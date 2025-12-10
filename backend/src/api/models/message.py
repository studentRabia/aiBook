"""Message models for user queries and chatbot responses."""
from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, field_validator
from src.api.models import QueryMode


class UserMessage(BaseModel):
    """User question in conversation.

    Per data-model.md: Represents a question or statement from the user,
    stored in Neon Postgres messages table.
    """

    # Identifiers
    id: str = Field(..., description="UUID")
    session_id: str = Field(..., description="FK to ConversationSession")

    # Content
    message_text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's question/statement"
    )
    selected_text: Optional[str] = Field(
        None,
        max_length=5000,
        description="Text selected by user (FR-007)"
    )
    query_mode: QueryMode = Field(..., description="Enum: GENERAL | SELECTED_TEXT")

    # Context
    current_page: Optional[str] = Field(None, description="Page user was reading")
    current_chapter: Optional[str] = Field(None, description="Chapter user was in")

    # Metadata
    timestamp: datetime = Field(..., description="Message creation time")
    client_info: Optional[Dict] = Field(None, description="Browser, device info")

    @field_validator("selected_text", mode="after")
    @classmethod
    def validate_selected_text_with_mode(cls, v: Optional[str], info) -> Optional[str]:
        """Ensure query_mode is SELECTED_TEXT if selected_text is provided."""
        if v and info.data.get("query_mode") != QueryMode.SELECTED_TEXT:
            raise ValueError("query_mode must be SELECTED_TEXT when selected_text is provided")
        return v


class SourceCitation(BaseModel):
    """Citation to specific textbook location.

    Per data-model.md: Nested model for ChatbotResponse to reference textbook chunks.
    """

    chunk_id: str = Field(..., description="ID of ContentChunk")
    chapter: str = Field(..., description='e.g., "Chapter 3"')
    section: Optional[str] = Field(None, description='e.g., "3.2 Inverse Kinematics"')
    page_number: Optional[int] = Field(None, description="Page reference")
    relevance_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="0.0-1.0 (from vector search)"
    )
    quoted_text: Optional[str] = Field(
        None,
        max_length=200,
        description="Direct quote from chunk (max 200 chars)"
    )


class ChatbotResponse(BaseModel):
    """AI-generated response with citations.

    Per data-model.md: AI-generated answer to user query with source citations,
    stored in Neon Postgres messages table.
    """

    # Identifiers
    id: str = Field(..., description="UUID")
    session_id: str = Field(..., description="FK to ConversationSession")
    user_message_id: str = Field(..., description="FK to UserMessage (the query this answers)")

    # Content
    response_text: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Generated answer"
    )
    sources: List[SourceCitation] = Field(
        default_factory=list,
        max_length=5,
        description="Citations to textbook (FR-005)"
    )

    # Quality indicators
    confidence_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=1.0,
        description="0.0-1.0 (based on retrieval relevance)"
    )
    is_out_of_scope: bool = Field(
        False,
        description="True if question outside book (FR-009)"
    )

    # Retrieved context metadata
    retrieved_chunks: List[str] = Field(
        default_factory=list,
        description="IDs of chunks used (for debugging)"
    )
    retrieval_scores: List[float] = Field(
        default_factory=list,
        description="Similarity scores for each chunk"
    )

    # Performance metrics (SC-001: <3000ms)
    retrieval_time_ms: int = Field(..., ge=0, description="Time spent in vector search")
    generation_time_ms: int = Field(..., ge=0, description="Time spent in LLM call")
    total_time_ms: int = Field(..., ge=0, description="End-to-end time")

    # Metadata
    timestamp: datetime = Field(..., description="Response creation time")
    model_used: str = Field(..., description='e.g., "gpt-3.5-turbo-1106"')

    @field_validator("sources")
    @classmethod
    def validate_sources_for_in_scope(cls, v: List[SourceCitation], info) -> List[SourceCitation]:
        """Ensure at least 1 citation for in-scope answers (FR-005)."""
        is_out_of_scope = info.data.get("is_out_of_scope", False)
        if not is_out_of_scope and len(v) == 0:
            raise ValueError("In-scope responses must have at least 1 source citation (FR-005)")
        return v

    @field_validator("total_time_ms")
    @classmethod
    def warn_on_slow_response(cls, v: int) -> int:
        """Warn if response exceeds SC-001 target of 3000ms."""
        if v > 3000:
            # Note: This is a warning, not an error - still allow the response
            pass  # In production, log a warning metric here
        return v
