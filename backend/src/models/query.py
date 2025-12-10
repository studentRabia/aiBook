"""
Pydantic models for RAG chatbot queries
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class ChatbotQuery(BaseModel):
    """Request model for chatbot query"""
    query: str = Field(..., min_length=1, max_length=500, description="User question about textbook content")
    chapter_id: Optional[int] = Field(None, description="Optional chapter ID to scope retrieval")
    user_id: Optional[str] = Field(None, description="Optional user ID for personalization")
    selected_text: Optional[str] = Field(None, max_length=2000, description="Optional text selected by user for context-specific questions")


class ChatbotResponse(BaseModel):
    """Response model for chatbot query"""
    answer: str = Field(..., description="Generated answer from RAG system")
    sources: List[str] = Field(..., description="Source chapters and URLs used for answer")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score for answer quality")
    response_time_ms: int = Field(..., description="Response time in milliseconds")
