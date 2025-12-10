"""Chat endpoint for RAG chatbot interactions."""
import time
import uuid
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from src.api.models import QueryMode, UserContext, PerformanceMetrics, ErrorResponse
from src.api.models.message import SourceCitation
from src.services.vector_search import VectorSearchService
from src.services.llm import LLMService
from src.services.database import DatabaseService

router = APIRouter(prefix="/api/v1", tags=["chat"])

# Initialize services
vector_search = VectorSearchService()
llm_service = LLMService()

# Database service is optional (requires psycopg2 and database_url)
try:
    db_service = DatabaseService()
except RuntimeError:
    db_service = None  # Database not configured


# Request/Response Models
class ChatRequest(BaseModel):
    """Chat request model per openapi.yaml."""

    session_id: str = Field(..., description="Active session ID")
    message: str = Field(..., min_length=1, max_length=2000, description="User's question")
    query_mode: QueryMode = Field(..., description="Search strategy (FR-006)")
    selected_text: Optional[str] = Field(None, max_length=5000, description="Selected text")
    context: Optional[UserContext] = Field(None, description="User's reading context")

    @field_validator("selected_text")
    @classmethod
    def validate_selected_text_required_for_mode(cls, v: Optional[str], info) -> Optional[str]:
        """Ensure selected_text is provided when query_mode is SELECTED_TEXT."""
        query_mode = info.data.get("query_mode")
        if query_mode == QueryMode.SELECTED_TEXT and not v:
            raise ValueError("selected_text is required when query_mode is 'selected_text'")
        return v


class ChatResponse(BaseModel):
    """Chat response model per openapi.yaml."""

    message_id: str = Field(..., description="UUID for this response")
    session_id: str = Field(..., description="Session ID")
    response: str = Field(..., description="AI-generated answer")
    sources: List[SourceCitation] = Field(..., description="Citations to textbook (FR-005)")
    confidence_score: Optional[float] = Field(None, description="Answer confidence")
    is_out_of_scope: bool = Field(..., description="True if question outside book (FR-009)")
    performance: PerformanceMetrics = Field(..., description="Performance metrics")
    timestamp: datetime = Field(..., description="Response timestamp")


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def send_message(request: ChatRequest):
    """Primary chat endpoint for RAG chatbot interactions.

    Supports two query modes (FR-006):
    - GENERAL: Search entire textbook content
    - SELECTED_TEXT: Answer based only on user-selected text

    Returns AI-generated response with source citations (FR-005).
    Handles out-of-scope questions (FR-009).
    Performance target: <3000ms (SC-001).

    Args:
        request: ChatRequest with query and context

    Returns:
        ChatResponse with answer, sources, and performance metrics

    Raises:
        HTTPException 400: Invalid request
        HTTPException 500: Internal server error (API failures)
        HTTPException 429: Rate limit exceeded
    """
    start_time = time.time()
    message_id = str(uuid.uuid4())

    try:
        # T034: Fetch conversation history for context (last 5 messages)
        conversation_history = []
        if db_service:
            try:
                conversation_history = db_service.get_session_messages(request.session_id, limit=5)
            except Exception:
                pass  # Database optional

        # T028: Store user message in database (optional)
        user_message_id = None
        if db_service:
            try:
                user_message_id = db_service.store_user_message(
                    session_id=request.session_id,
                    message_text=request.message,
                    query_mode=request.query_mode.value,
                    selected_text=request.selected_text,
                    current_page=request.context.current_page if request.context else None,
                    current_chapter=request.context.current_chapter if request.context else None
                )
            except Exception:
                pass  # Database optional

        # Step 1: Vector search (T020) or bypass for SELECTED_TEXT (T029)
        if request.query_mode == QueryMode.SELECTED_TEXT and request.selected_text:
            # T029, FR-007: SELECTED_TEXT mode - bypass vector search, use text directly
            chunks = []
            scores = []
            retrieval_time_ms = 0  # No retrieval performed
        else:
            # FR-003: GENERAL mode with vector search
            chapter_filter = None
            if request.context and request.context.current_chapter:
                chapter_filter = request.context.current_chapter

            chunks, scores, retrieval_time_ms = vector_search.search(
                query_text=request.message,
                top_k=5,
                chapter_filter=chapter_filter
            )

        # Step 2: Check if out of scope (T024, FR-009)
        max_score = max(scores) if scores else 0.0
        is_out_of_scope_heuristic = llm_service.detect_out_of_scope(
            query=request.message,
            max_retrieval_score=max_score
        )

        # Step 3: Generate response (T021, T035)
        response_text, is_out_of_scope_llm, generation_time_ms, model_used = llm_service.generate_response(
            query=request.message,
            retrieved_chunks=chunks,
            query_mode=request.query_mode.value,
            selected_text=request.selected_text,
            conversation_history=conversation_history  # T035: Pass conversation history for context
        )

        # Combine out-of-scope signals
        is_out_of_scope = is_out_of_scope_heuristic or is_out_of_scope_llm

        # Step 4: Build source citations (FR-005)
        sources = []
        if not is_out_of_scope:
            if request.query_mode == QueryMode.SELECTED_TEXT and request.selected_text:
                # T032: For SELECTED_TEXT mode, create single citation with selected text
                quoted_text = request.selected_text[:200] + "..." if len(request.selected_text) > 200 else request.selected_text
                source = SourceCitation(
                    chunk_id="selected_text",
                    chapter="Selected Text",
                    section=None,
                    page_number=None,
                    relevance_score=1.0,  # Direct selection, full relevance
                    quoted_text=quoted_text
                )
                sources.append(source)
            elif chunks:
                # GENERAL mode: citations from retrieved chunks
                for chunk, score in zip(chunks[:5], scores[:5]):
                    # Extract quoted text (first 200 chars of chunk)
                    quoted_text = chunk.text[:200] + "..." if len(chunk.text) > 200 else chunk.text

                    source = SourceCitation(
                        chunk_id=chunk.id,
                        chapter=chunk.chapter,
                        section=chunk.section,
                        page_number=chunk.page_number,
                        relevance_score=round(score, 3),
                        quoted_text=quoted_text
                    )
                    sources.append(source)

        # Step 5: Calculate performance metrics
        total_time_ms = int((time.time() - start_time) * 1000)

        # Step 6: Build and return response
        chat_response = ChatResponse(
            message_id=message_id,
            session_id=request.session_id,
            response=response_text,
            sources=sources,
            confidence_score=round(max_score, 3) if scores else None,
            is_out_of_scope=is_out_of_scope,
            performance=PerformanceMetrics(
                retrieval_time_ms=retrieval_time_ms,
                generation_time_ms=generation_time_ms,
                total_time_ms=total_time_ms
            ),
            timestamp=datetime.utcnow()
        )

        # T028: Store chatbot response in database (optional)
        if db_service:
            try:
                db_service.store_chatbot_response(
                    session_id=request.session_id,
                    user_message_id=user_message_id,
                    response_text=response_text,
                    sources=sources,
                    confidence_score=round(max_score, 3) if scores else None,
                    is_out_of_scope=is_out_of_scope,
                    retrieved_chunks=[chunk.id for chunk in chunks],
                    retrieval_scores=scores,
                    retrieval_time_ms=retrieval_time_ms,
                    generation_time_ms=generation_time_ms,
                    total_time_ms=total_time_ms,
                    model_used=model_used
                )
            except Exception:
                pass  # Database optional

        # Update session activity (optional)
        if db_service:
            try:
                db_service.update_session_activity(request.session_id)
            except Exception:
                pass  # Database optional

        return chat_response

    except ValueError as e:
        # T023: Handle validation errors
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error="Invalid request",
                message=str(e),
                code="VALIDATION_ERROR"
            ).dict()
        )

    except Exception as e:
        # T023: Handle API failures (OpenAI, Qdrant)
        error_type = type(e).__name__

        # Check for specific API errors
        if "openai" in str(e).lower():
            error_code = "OPENAI_API_ERROR"
            error_msg = "Failed to generate response. Please try again."
        elif "qdrant" in str(e).lower():
            error_code = "QDRANT_API_ERROR"
            error_msg = "Failed to search textbook content. Please try again."
        else:
            error_code = "INTERNAL_ERROR"
            error_msg = "An unexpected error occurred. Please try again."

        # Log error (in production, use proper logging)
        print(f"[ERROR] {error_code}: {error_type} - {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error="Internal server error",
                message=error_msg,
                code=error_code,
                details={"error_type": error_type} if error_type else None
            ).dict()
        )
