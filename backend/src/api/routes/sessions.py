"""Session management endpoints for RAG chatbot."""
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from src.api.models import ErrorResponse
from src.api.models.session import ConversationSession
from src.services.database import DatabaseService

router = APIRouter(prefix="/api/v1", tags=["sessions"])

# Database service is optional (requires psycopg2 and database_url)
try:
    db_service = DatabaseService()
except RuntimeError:
    db_service = None  # Database not configured


# Request/Response Models
class CreateSessionRequest(BaseModel):
    """Create session request per openapi.yaml."""

    textbook_id: str = Field(..., description="ID of textbook for this session")
    user_id: Optional[str] = Field(None, description="Optional user identifier")
    preferred_detail_level: Optional[str] = Field(
        None,
        pattern="^(concise|detailed|technical)$",
        description="Optional detail preference"
    )


class SessionResponse(BaseModel):
    """Session response per openapi.yaml."""

    session_id: str = Field(..., description="UUID for session")
    textbook_id: str = Field(..., description="Textbook ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    is_active: bool = Field(..., description="Whether session is active")


class SessionDetailsResponse(SessionResponse):
    """Extended session response with message history."""

    last_activity_at: datetime = Field(..., description="Last activity timestamp")
    message_count: int = Field(..., description="Number of messages")
    conversation_summary: Optional[str] = Field(None, description="Session summary")
    messages: List[Dict[str, Any]] = Field(..., description="Recent messages")


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(request: CreateSessionRequest):
    """Create a new conversation session (T026).

    Initialize a new conversation session for a user. Returns session ID
    to be used in subsequent chat requests.

    Per FR-011: Sessions persisted for 90 days.

    Args:
        request: CreateSessionRequest with textbook_id and optional user_id

    Returns:
        SessionResponse with session_id and metadata

    Raises:
        HTTPException 400: Invalid request
        HTTPException 500: Database error
    """
    try:
        # Create session in database
        session = db_service.create_session(
            textbook_id=request.textbook_id,
            user_id=request.user_id,
            preferred_detail_level=request.preferred_detail_level
        )

        return SessionResponse(
            session_id=session.id,
            textbook_id=session.textbook_id,
            created_at=session.created_at,
            is_active=session.is_active
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=ErrorResponse(
                error="Invalid request",
                message=str(e),
                code="VALIDATION_ERROR"
            ).dict()
        )

    except Exception as e:
        # Log error
        print(f"[ERROR] Failed to create session: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error="Internal server error",
                message="Failed to create session. Please try again.",
                code="DATABASE_ERROR"
            ).dict()
        )


@router.get(
    "/sessions/{session_id}/messages",
    response_model=List[Dict[str, Any]],
    status_code=status.HTTP_200_OK
)
async def get_session_messages(session_id: str, limit: int = 50, offset: int = 0):
    """Retrieve message history for a session (T033).

    Get ordered messages with pagination for conversation history (FR-008).

    Args:
        session_id: UUID of session
        limit: Maximum number of messages to return (default 50)
        offset: Number of messages to skip (default 0)

    Returns:
        List of message dictionaries with text and metadata

    Raises:
        HTTPException 404: Session not found
        HTTPException 500: Database error
    """
    try:
        # Verify session exists
        session = db_service.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    error="Session not found",
                    message=f"No session found with ID: {session_id}",
                    code="SESSION_NOT_FOUND"
                ).dict()
            )

        # Retrieve messages with pagination
        messages = db_service.get_session_messages(session_id, limit=limit)

        # Apply offset manually (simple implementation)
        if offset > 0:
            messages = messages[offset:]

        return messages

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # Log error
        print(f"[ERROR] Failed to retrieve messages for session {session_id}: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error="Internal server error",
                message="Failed to retrieve messages. Please try again.",
                code="DATABASE_ERROR"
            ).dict()
        )


@router.get(
    "/sessions/{session_id}",
    response_model=SessionDetailsResponse,
    status_code=status.HTTP_200_OK
)
async def get_session(session_id: str):
    """Retrieve session details and message history (T027).

    Get conversation history and metadata for a session.

    Args:
        session_id: UUID of session

    Returns:
        SessionDetailsResponse with session info and messages

    Raises:
        HTTPException 404: Session not found
        HTTPException 500: Database error
    """
    try:
        # Retrieve session from database
        session = db_service.get_session(session_id)

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    error="Session not found",
                    message=f"No session found with ID: {session_id}",
                    code="SESSION_NOT_FOUND"
                ).dict()
            )

        # Retrieve recent messages (last 50)
        messages = db_service.get_session_messages(session_id, limit=50)

        return SessionDetailsResponse(
            session_id=session.id,
            textbook_id=session.textbook_id,
            created_at=session.created_at,
            last_activity_at=session.last_activity_at,
            is_active=session.is_active,
            message_count=session.message_count,
            conversation_summary=session.conversation_summary,
            messages=messages
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # Log error
        print(f"[ERROR] Failed to retrieve session {session_id}: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error="Internal server error",
                message="Failed to retrieve session. Please try again.",
                code="DATABASE_ERROR"
            ).dict()
        )


@router.delete(
    "/sessions/{session_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_session(session_id: str):
    """Delete (deactivate) a conversation session (T036).

    Sets is_active=False to allow users to clear history (FR-020).
    Session is not permanently deleted, just marked inactive.

    Args:
        session_id: UUID of session to delete

    Returns:
        204 No Content on success

    Raises:
        HTTPException 404: Session not found
        HTTPException 500: Database error
    """
    try:
        # Verify session exists
        session = db_service.get_session(session_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=ErrorResponse(
                    error="Session not found",
                    message=f"No session found with ID: {session_id}",
                    code="SESSION_NOT_FOUND"
                ).dict()
            )

        # Deactivate session
        db_service.deactivate_session(session_id)

        # Return 204 No Content (no response body)
        return None

    except HTTPException:
        # Re-raise HTTP exceptions
        raise

    except Exception as e:
        # Log error
        print(f"[ERROR] Failed to delete session {session_id}: {str(e)}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=ErrorResponse(
                error="Internal server error",
                message="Failed to delete session. Please try again.",
                code="DATABASE_ERROR"
            ).dict()
        )
