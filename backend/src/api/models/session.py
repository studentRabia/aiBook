"""ConversationSession model for managing user chat sessions."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ConversationSession(BaseModel):
    """User conversation session.

    Per data-model.md: Collection of related message exchanges between user and
    chatbot, stored in Neon Postgres sessions table. Sessions persisted for 90 days (FR-011).
    """

    # Identifiers
    id: str = Field(..., description="UUID (session ID)")
    user_id: Optional[str] = Field(None, description="Anonymous or authenticated user ID")

    # Session metadata
    created_at: datetime = Field(..., description="Session creation timestamp")
    last_activity_at: datetime = Field(..., description="Updated on each message")
    is_active: bool = Field(True, description="False if user explicitly ended session")

    # Context accumulation (FR-008)
    message_count: int = Field(0, ge=0, description="Number of messages in session")
    conversation_summary: Optional[str] = Field(
        None,
        description="LLM-generated summary (for long sessions)"
    )

    # User preferences
    textbook_id: str = Field(..., description="Which textbook this session is for")
    preferred_detail_level: Optional[str] = Field(
        None,
        pattern="^(concise|detailed|technical)$",
        description="concise | detailed | technical"
    )

    @field_validator("last_activity_at")
    @classmethod
    def validate_last_activity_after_creation(cls, v: datetime, info) -> datetime:
        """Ensure last_activity_at >= created_at."""
        created_at = info.data.get("created_at")
        if created_at and v < created_at:
            raise ValueError("last_activity_at must be >= created_at")
        return v

    class Config:
        """Pydantic configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "anonymous_12345",
                "created_at": "2025-12-10T10:00:00Z",
                "last_activity_at": "2025-12-10T10:15:00Z",
                "is_active": True,
                "message_count": 5,
                "conversation_summary": None,
                "textbook_id": "robotics-101",
                "preferred_detail_level": "detailed"
            }
        }
