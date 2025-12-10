"""
Chatbot API endpoints for RAG-powered Q&A
"""
from fastapi import APIRouter, HTTPException
from ..models.query import ChatbotQuery, ChatbotResponse
from ..services.rag_service import get_rag_service

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


@router.post("/query", response_model=ChatbotResponse)
async def query_chatbot(query: ChatbotQuery):
    """
    Query the RAG chatbot with a question about textbook content

    Args:
        query: ChatbotQuery with user question and optional context

    Returns:
        ChatbotResponse with answer, sources, confidence, and response time
    """
    try:
        rag_service = get_rag_service()

        # Extract optional chapter_id as string if provided
        chapter_id_str = str(query.chapter_id) if query.chapter_id else None

        result = rag_service.query_chatbot(
            query=query.query,
            chapter_id=chapter_id_str,
            selected_text=getattr(query, 'selected_text', None),  # Support selected text
            top_k=3
        )

        return ChatbotResponse(**result)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chatbot query: {str(e)}"
        )


@router.get("/health")
async def chatbot_health():
    """Health check endpoint for chatbot service"""
    try:
        rag_service = get_rag_service()
        return {
            "status": "healthy",
            "service": "chatbot",
            "collection": rag_service.collection_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Chatbot service unhealthy: {str(e)}"
        )
