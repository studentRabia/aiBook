"""Database service for conversation session and message storage."""
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
    RealDictCursor = None
import json

from src.config import settings
from src.api.models.session import ConversationSession
from src.api.models.message import UserMessage, ChatbotResponse, SourceCitation


class DatabaseService:
    """Service for managing sessions and messages in Postgres.

    Per data-model.md: Uses Neon Serverless Postgres for conversation history.
    Per FR-011: Sessions persisted for 90 days.
    """

    def __init__(self):
        """Initialize database connection."""
        self.database_url = settings.database_url
        if not HAS_PSYCOPG2 or not self.database_url:
            raise RuntimeError(
                "Database service requires psycopg2 and database_url. "
                "Install psycopg2-binary or use service without database."
            )

    def _get_connection(self):
        """Get database connection.

        Returns:
            psycopg2 connection object
        """
        if not HAS_PSYCOPG2:
            raise RuntimeError("psycopg2 not installed")
        return psycopg2.connect(self.database_url)

    # Session Management
    def create_session(
        self,
        textbook_id: str,
        user_id: Optional[str] = None,
        preferred_detail_level: Optional[str] = None
    ) -> ConversationSession:
        """Create new conversation session.

        Args:
            textbook_id: ID of textbook for this session
            user_id: Optional user identifier
            preferred_detail_level: Optional detail preference

        Returns:
            ConversationSession model

        Raises:
            psycopg2 errors
        """
        session_id = str(uuid.uuid4())
        created_at = datetime.utcnow()

        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO sessions
                    (id, user_id, textbook_id, created_at, last_activity_at,
                     is_active, message_count, preferred_detail_level)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    session_id,
                    user_id,
                    textbook_id,
                    created_at,
                    created_at,
                    True,
                    0,
                    preferred_detail_level
                ))
                conn.commit()
        finally:
            conn.close()

        return ConversationSession(
            id=session_id,
            user_id=user_id,
            textbook_id=textbook_id,
            created_at=created_at,
            last_activity_at=created_at,
            is_active=True,
            message_count=0,
            conversation_summary=None,
            preferred_detail_level=preferred_detail_level
        )

    def get_session(self, session_id: str) -> Optional[ConversationSession]:
        """Retrieve session by ID.

        Args:
            session_id: UUID of session

        Returns:
            ConversationSession if found, None otherwise
        """
        conn = self._get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, user_id, textbook_id, created_at, last_activity_at,
                           is_active, message_count, conversation_summary,
                           preferred_detail_level
                    FROM sessions
                    WHERE id = %s
                """, (session_id,))
                row = cur.fetchone()

                if not row:
                    return None

                return ConversationSession(
                    id=row["id"],
                    user_id=row["user_id"],
                    textbook_id=row["textbook_id"],
                    created_at=row["created_at"],
                    last_activity_at=row["last_activity_at"],
                    is_active=row["is_active"],
                    message_count=row["message_count"],
                    conversation_summary=row["conversation_summary"],
                    preferred_detail_level=row["preferred_detail_level"]
                )
        finally:
            conn.close()

    def update_session_activity(self, session_id: str) -> None:
        """Update last_activity_at timestamp for session.

        Args:
            session_id: UUID of session
        """
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE sessions
                    SET last_activity_at = %s,
                        message_count = message_count + 1
                    WHERE id = %s
                """, (datetime.utcnow(), session_id))
                conn.commit()
        finally:
            conn.close()

    def deactivate_session(self, session_id: str) -> None:
        """Deactivate a session (soft delete) per FR-020, T036.

        Args:
            session_id: UUID of session to deactivate
        """
        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE sessions
                    SET is_active = FALSE
                    WHERE id = %s
                """, (session_id,))
                conn.commit()
        finally:
            conn.close()

    def generate_session_summary(self, session_id: str) -> Optional[str]:
        """Generate conversation summary for long sessions (T037).

        Per FR-008: Generate LLM summary when message_count > 20 to maintain
        context window limits.

        Args:
            session_id: UUID of session

        Returns:
            Generated summary text, or None if summary not needed

        Note:
            This is a placeholder implementation. In production, this would:
            1. Fetch all messages for the session
            2. Call OpenAI API to generate a summary
            3. Store summary in sessions.conversation_summary
            4. Return the summary
        """
        # TODO: Implement full summary generation with OpenAI API
        # For MVP, this is deferred as an optimization
        return None

    # Message Storage (T028)
    def store_user_message(
        self,
        session_id: str,
        message_text: str,
        query_mode: str,
        selected_text: Optional[str] = None,
        current_page: Optional[str] = None,
        current_chapter: Optional[str] = None
    ) -> str:
        """Store user message in database.

        Args:
            session_id: Session ID
            message_text: User's question
            query_mode: "general" or "selected_text"
            selected_text: Optional selected text
            current_page: Optional current page
            current_chapter: Optional current chapter

        Returns:
            Message ID (UUID)
        """
        message_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()

        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO messages
                    (id, session_id, message_type, message_text, selected_text,
                     query_mode, current_page, current_chapter, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    message_id,
                    session_id,
                    "user",
                    message_text,
                    selected_text,
                    query_mode,
                    current_page,
                    current_chapter,
                    timestamp
                ))
                conn.commit()
        finally:
            conn.close()

        return message_id

    def store_chatbot_response(
        self,
        session_id: str,
        user_message_id: str,
        response_text: str,
        sources: List[SourceCitation],
        confidence_score: Optional[float],
        is_out_of_scope: bool,
        retrieved_chunks: List[str],
        retrieval_scores: List[float],
        retrieval_time_ms: int,
        generation_time_ms: int,
        total_time_ms: int,
        model_used: str
    ) -> str:
        """Store chatbot response in database.

        Args:
            session_id: Session ID
            user_message_id: ID of user message this responds to
            response_text: Generated answer
            sources: Source citations
            confidence_score: Answer confidence
            is_out_of_scope: Whether question was out of scope
            retrieved_chunks: Chunk IDs used
            retrieval_scores: Similarity scores
            retrieval_time_ms: Retrieval time
            generation_time_ms: Generation time
            total_time_ms: Total time
            model_used: Model name

        Returns:
            Message ID (UUID)
        """
        message_id = str(uuid.uuid4())
        timestamp = datetime.utcnow()

        # Serialize sources to JSON
        sources_json = json.dumps([s.dict() for s in sources])
        retrieved_chunks_json = json.dumps(retrieved_chunks)

        conn = self._get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO messages
                    (id, session_id, message_type, response_text, sources,
                     confidence_score, is_out_of_scope, retrieved_chunks,
                     retrieval_time_ms, generation_time_ms, total_time_ms,
                     model_used, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    message_id,
                    session_id,
                    "chatbot",
                    response_text,
                    sources_json,
                    confidence_score,
                    is_out_of_scope,
                    retrieved_chunks_json,
                    retrieval_time_ms,
                    generation_time_ms,
                    total_time_ms,
                    model_used,
                    timestamp
                ))
                conn.commit()
        finally:
            conn.close()

        return message_id

    def get_session_messages(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Retrieve messages for a session.

        Args:
            session_id: Session ID
            limit: Maximum number of messages to return

        Returns:
            List of message dictionaries
        """
        conn = self._get_connection()
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, message_type, message_text, response_text,
                           sources, timestamp, is_out_of_scope
                    FROM messages
                    WHERE session_id = %s
                    ORDER BY timestamp ASC
                    LIMIT %s
                """, (session_id, limit))
                return [dict(row) for row in cur.fetchall()]
        finally:
            conn.close()

    def health_check(self) -> bool:
        """Check database connectivity.

        Returns:
            True if healthy, False otherwise
        """
        try:
            conn = self._get_connection()
            conn.close()
            return True
        except Exception:
            return False
