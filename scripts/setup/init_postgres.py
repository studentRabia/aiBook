"""
Initialize Postgres database schema for RAG chatbot.
Creates sessions and messages tables with indexes per data-model.md.
"""
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()


def init_database():
    """Create database schema for conversation management."""

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    conn = psycopg2.connect(database_url)
    cur = conn.cursor()

    try:
        print("Creating sessions table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id VARCHAR(255),
                textbook_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                last_activity_at TIMESTAMP DEFAULT NOW(),
                is_active BOOLEAN DEFAULT TRUE,
                message_count INTEGER DEFAULT 0,
                conversation_summary TEXT,
                preferred_detail_level VARCHAR(50)
            );
        """)

        print("Creating indexes on sessions table...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_user_textbook ON sessions(user_id, textbook_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_last_activity ON sessions(last_activity_at);")

        print("Creating messages table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
                message_type VARCHAR(20) NOT NULL,

                -- User message fields
                message_text TEXT,
                selected_text TEXT,
                query_mode VARCHAR(20),
                current_page VARCHAR(255),
                current_chapter VARCHAR(255),

                -- Chatbot response fields
                response_text TEXT,
                sources JSONB,
                confidence_score FLOAT,
                is_out_of_scope BOOLEAN DEFAULT FALSE,
                retrieved_chunks JSONB,
                retrieval_time_ms INTEGER,
                generation_time_ms INTEGER,
                total_time_ms INTEGER,
                model_used VARCHAR(100),

                -- Common fields
                timestamp TIMESTAMP DEFAULT NOW(),

                CONSTRAINT check_message_type CHECK (message_type IN ('user', 'chatbot'))
            );
        """)

        print("Creating indexes on messages table...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_session_messages ON messages(session_id, timestamp);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_message_type ON messages(message_type);")

        conn.commit()
        print("✅ Postgres schema created successfully")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating schema: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    init_database()
