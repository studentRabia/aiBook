"""Base Pydantic models for RAG chatbot API."""
from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict


class QueryMode(str, Enum):
    """Query mode for chat requests."""
    GENERAL = "general"
    SELECTED_TEXT = "selected_text"


class UserContext(BaseModel):
    """User's current reading context."""
    current_chapter: Optional[str] = None
    current_page: Optional[str] = None
    scroll_position: Optional[int] = None


class PerformanceMetrics(BaseModel):
    """Performance tracking for chat responses."""
    retrieval_time_ms: int = Field(..., description="Vector search time in milliseconds")
    generation_time_ms: int = Field(..., description="LLM generation time in milliseconds")
    total_time_ms: int = Field(..., description="End-to-end response time in milliseconds")


class ErrorResponse(BaseModel):
    """Standard error response format."""
    error: str = Field(..., description="Error type/category")
    message: str = Field(..., description="Human-readable error message")
    code: Optional[str] = Field(None, description="Machine-readable error code")
    details: Optional[Dict] = Field(None, description="Additional error context")


# Import entity models for easy access
from src.api.models.chunk import ContentChunk
from src.api.models.message import UserMessage, ChatbotResponse, SourceCitation
from src.api.models.session import ConversationSession

__all__ = [
    "QueryMode",
    "UserContext",
    "PerformanceMetrics",
    "ErrorResponse",
    "ContentChunk",
    "UserMessage",
    "ChatbotResponse",
    "SourceCitation",
    "ConversationSession",
]
