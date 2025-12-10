# Data Model: RAG Chatbot

**Feature**: 002-rag-chatbot
**Date**: 2025-12-10
**Purpose**: Define entities, schemas, and relationships for RAG chatbot system

## Overview

This document defines the data models for the RAG chatbot, extracted from the feature specification and aligned with research decisions. All models include validation rules from functional requirements.

---

## Entity Diagram

```
┌─────────────────────┐
│  ContentChunk       │
│  (Qdrant Vector DB) │
└──────────┬──────────┘
           │
           │ referenced by
           │
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│  ChatbotResponse    │◄─────┤  ConversationSession│
└──────────┬──────────┘      └──────────┬──────────┘
           │                            │
           │ part of                    │ contains
           │                            │
           ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐
│  RetrievedContext   │      │   UserMessage       │
└─────────────────────┘      └─────────────────────┘
                                       │
                                       │ optionally has
                                       ▼
                             ┌─────────────────────┐
                             │   UserContext       │
                             │  (Selected Text)    │
                             └─────────────────────┘
```

---

## 1. ContentChunk

**Purpose**: Represents a segment of textbook content stored in Qdrant vector database for semantic retrieval.

**Storage**: Qdrant Cloud (vector database)

### Schema

```python
class ContentChunk(BaseModel):
    """Textbook content chunk with embedding for semantic search"""

    # Identifiers
    id: str                          # UUID for chunk
    textbook_id: str                 # ID of source textbook

    # Content
    text: str                        # Actual chunk text (512 tokens max)
    embedding: List[float]           # 1024-dim vector from text-embedding-3-small

    # Metadata for citations (FR-005)
    chapter: str                     # e.g., "Chapter 3: Kinematics"
    section: Optional[str]           # e.g., "3.2 Inverse Kinematics"
    subsection: Optional[str]        # e.g., "3.2.1 Analytical Solutions"
    heading_path: str                # Full path: "Ch3 > 3.2 > 3.2.1"
    page_number: Optional[int]       # Page number in original book

    # Chunk metadata
    chunk_index: int                 # Sequential index in document
    prev_chunk_id: Optional[str]     # ID of previous chunk (for overlap context)
    next_chunk_id: Optional[str]     # ID of next chunk

    # Content type flags
    contains_equation: bool          # True if chunk has LaTeX math
    contains_code: bool              # True if chunk has code blocks
    contains_table: bool             # True if chunk has tables

    # Timestamps
    created_at: datetime
    updated_at: datetime
```

### Validation Rules

- `text`: 1-4000 characters (max ~512 tokens)
- `embedding`: Exactly 1024 dimensions, all floats
- `heading_path`: Required, format: "ChapterX > Section > Subsection"
- `chapter`: Required, max 200 chars
- FR-017: Chunking strategy ensures semantic coherence
- FR-018: All chunks must have embeddings before system goes live

### Indexes (Qdrant)

- **Vector Index**: HNSW on `embedding` field (cosine similarity)
- **Payload Index**: `textbook_id`, `chapter`, `contains_*` flags for filtering

---

## 2. UserMessage

**Purpose**: Represents a question or statement from the user.

**Storage**: Neon Postgres (part of `messages` table)

### Schema

```python
class UserMessage(BaseModel):
    """User question in conversation"""

    # Identifiers
    id: str                          # UUID
    session_id: str                  # FK to ConversationSession

    # Content
    message_text: str                # User's question/statement
    selected_text: Optional[str]     # Text selected by user (FR-007)
    query_mode: QueryMode            # Enum: GENERAL | SELECTED_TEXT

    # Context
    current_page: Optional[str]      # Page user was reading
    current_chapter: Optional[str]   # Chapter user was in

    # Metadata
    timestamp: datetime
    client_info: Optional[Dict]      # Browser, device info
```

### Validation Rules

- `message_text`: 1-2000 characters (prevent abuse)
- `selected_text`: 0-5000 characters (if provided, must match query_mode)
- `query_mode`: Must be SELECTED_TEXT if `selected_text` is provided
- FR-002: Must accept natural language (no format restrictions)
- FR-006: query_mode determines retrieval strategy

### Enums

```python
class QueryMode(str, Enum):
    GENERAL = "general"              # Search entire book
    SELECTED_TEXT = "selected_text"  # Only use selected text as context
```

---

## 3. ChatbotResponse

**Purpose**: AI-generated answer to user query with source citations.

**Storage**: Neon Postgres (part of `messages` table)

### Schema

```python
class ChatbotResponse(BaseModel):
    """AI-generated response with citations"""

    # Identifiers
    id: str                          # UUID
    session_id: str                  # FK to ConversationSession
    user_message_id: str             # FK to UserMessage (the query this answers)

    # Content
    response_text: str               # Generated answer
    sources: List[SourceCitation]    # Citations to textbook (FR-005)

    # Quality indicators
    confidence_score: Optional[float]  # 0.0-1.0 (based on retrieval relevance)
    is_out_of_scope: bool            # True if question outside book (FR-009)

    # Retrieved context metadata
    retrieved_chunks: List[str]      # IDs of chunks used (for debugging)
    retrieval_scores: List[float]    # Similarity scores for each chunk

    # Performance metrics
    retrieval_time_ms: int           # Time spent in vector search
    generation_time_ms: int          # Time spent in LLM call
    total_time_ms: int               # End-to-end time (SC-001: <3000ms)

    # Metadata
    timestamp: datetime
    model_used: str                  # e.g., "gpt-3.5-turbo-1106"
```

### Nested Models

```python
class SourceCitation(BaseModel):
    """Citation to specific textbook location"""
    chunk_id: str                    # ID of ContentChunk
    chapter: str                     # e.g., "Chapter 3"
    section: Optional[str]           # e.g., "3.2 Inverse Kinematics"
    page_number: Optional[int]       # Page reference
    relevance_score: float           # 0.0-1.0 (from vector search)
    quoted_text: Optional[str]       # Direct quote from chunk (max 200 chars)
```

### Validation Rules

- `response_text`: 1-5000 characters
- `sources`: 0-5 citations (FR-005: at least 1 for in-scope answers)
- `confidence_score`: 0.0-1.0
- `total_time_ms`: Must be <3000 for 95% of requests (SC-001)
- FR-003: Retrieved chunks must come from vector search
- FR-010: Response must be grounded in `retrieved_chunks`

---

## 4. ConversationSession

**Purpose**: Collection of related message exchanges between user and chatbot.

**Storage**: Neon Postgres (`sessions` table)

### Schema

```python
class ConversationSession(BaseModel):
    """User conversation session"""

    # Identifiers
    id: str                          # UUID (session ID)
    user_id: Optional[str]           # Anonymous or authenticated user ID

    # Session metadata
    created_at: datetime
    last_activity_at: datetime       # Updated on each message
    is_active: bool                  # False if user explicitly ended session

    # Context accumulation (FR-008)
    message_count: int               # Number of messages in session
    conversation_summary: Optional[str]  # LLM-generated summary (for long sessions)

    # User preferences
    textbook_id: str                 # Which textbook this session is for
    preferred_detail_level: Optional[str]  # "concise" | "detailed" | "technical"
```

### Validation Rules

- `message_count`: >= 0
- `last_activity_at`: Must be >= `created_at`
- FR-011: Sessions persisted across browser sessions (90-day retention)
- FR-020: Users can clear session (set `is_active=False`)

### State Transitions

```
[Created] → [Active] → [Ended]
                ↓
            [Archived after 90 days]
```

---

## 5. UserContext

**Purpose**: Captures user's current reading state and interaction context.

**Storage**: In-memory (session state) + partial in Postgres

### Schema

```python
class UserContext(BaseModel):
    """User's current reading context"""

    # Reading position
    current_page: Optional[str]      # Page ID in textbook
    current_chapter: Optional[str]   # Chapter name
    scroll_position: Optional[int]   # Y-offset in page (for restoration)

    # Selection state (FR-007)
    selected_text: Optional[str]     # Currently highlighted text
    selection_start: Optional[int]   # Start index in page
    selection_end: Optional[int]     # End index in page

    # Session preferences
    session_id: str                  # FK to ConversationSession
    chat_panel_open: bool            # UI state

    # Timestamps
    last_updated: datetime
```

### Validation Rules

- `selected_text`: Max 5000 characters
- `selection_start < selection_end` (if both provided)
- FR-007: Selected text must be from current page

---

## 6. RetrievedContext

**Purpose**: Results from vector similarity search used to generate response.

**Storage**: Transient (not persisted; only in response metadata)

### Schema

```python
class RetrievedContext(BaseModel):
    """Results from vector search for a query"""

    # Query info
    query_text: str                  # Original user question
    query_embedding: List[float]     # Embedding of query (1024 dims)

    # Retrieved chunks
    chunks: List[ContentChunk]       # Top-k chunks (k=5 default)
    scores: List[float]              # Similarity scores (0.0-1.0)

    # Retrieval metadata
    total_candidates: int            # Total chunks searched
    retrieval_time_ms: int           # Query execution time
    filter_applied: Optional[Dict]   # Any filters (chapter, section, etc.)

    # Quality metrics
    min_score: float                 # Lowest score in results
    max_score: float                 # Highest score in results
    avg_score: float                 # Average relevance
```

### Validation Rules

- `chunks.length == scores.length`
- `scores`: All values 0.0-1.0, sorted descending
- FR-003: Vector search is mandatory for all queries (except SELECTED_TEXT mode)

---

## Database Schema (Postgres)

### Tables

#### `sessions`
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    textbook_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_activity_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    message_count INTEGER DEFAULT 0,
    conversation_summary TEXT,
    preferred_detail_level VARCHAR(50),

    INDEX idx_user_textbook (user_id, textbook_id),
    INDEX idx_last_activity (last_activity_at)
);
```

#### `messages`
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user' | 'chatbot'

    -- User message fields
    message_text TEXT,
    selected_text TEXT,
    query_mode VARCHAR(20), -- 'general' | 'selected_text'
    current_page VARCHAR(255),
    current_chapter VARCHAR(255),

    -- Chatbot response fields
    response_text TEXT,
    sources JSONB,  -- Array of SourceCitation objects
    confidence_score FLOAT,
    is_out_of_scope BOOLEAN DEFAULT FALSE,
    retrieved_chunks JSONB,  -- Array of chunk IDs
    retrieval_time_ms INTEGER,
    generation_time_ms INTEGER,
    total_time_ms INTEGER,
    model_used VARCHAR(100),

    -- Common
    timestamp TIMESTAMP DEFAULT NOW(),

    INDEX idx_session_messages (session_id, timestamp),
    INDEX idx_message_type (message_type),
    CONSTRAINT check_message_type CHECK (message_type IN ('user', 'chatbot'))
);
```

### Cleanup Policy (FR-011 + 90-day retention)

```sql
-- Daily cron job
DELETE FROM sessions
WHERE last_activity_at < NOW() - INTERVAL '90 days';
```

---

## Qdrant Collection Schema

### Collection: `textbook_chunks`

```python
from qdrant_client.models import Distance, VectorParams

client.create_collection(
    collection_name="textbook_chunks",
    vectors_config=VectorParams(
        size=1024,  # text-embedding-3-small dimensions
        distance=Distance.COSINE
    )
)
```

### Payload Schema
```json
{
    "id": "uuid",
    "textbook_id": "robotics-101",
    "text": "Inverse kinematics calculates...",
    "chapter": "Chapter 3: Kinematics",
    "section": "3.2 Inverse Kinematics",
    "subsection": "3.2.1 Analytical Solutions",
    "heading_path": "Ch3 > 3.2 > 3.2.1",
    "page_number": 87,
    "chunk_index": 142,
    "contains_equation": true,
    "contains_code": false,
    "contains_table": false,
    "created_at": "2025-12-10T10:00:00Z"
}
```

---

## Relationships

1. **ConversationSession** (1) → (N) **UserMessage**
   - One session contains many user messages

2. **ConversationSession** (1) → (N) **ChatbotResponse**
   - One session contains many chatbot responses

3. **UserMessage** (1) → (1) **ChatbotResponse**
   - Each user message gets one response (current design; future: regenerate)

4. **ChatbotResponse** (1) → (N) **SourceCitation**
   - One response cites multiple textbook chunks

5. **SourceCitation** (N) → (1) **ContentChunk**
   - Multiple responses can cite the same chunk

6. **UserMessage** (1) → (0..1) **UserContext**
   - Message optionally includes user's reading context

---

## Validation Summary

| Entity | Key Validations |
|--------|-----------------|
| ContentChunk | 1-4000 chars, 1024-dim embedding, heading_path required |
| UserMessage | 1-2000 chars, selected_text ≤ 5000 chars |
| ChatbotResponse | 1-5000 chars, 0-5 sources, total_time_ms < 3000 |
| ConversationSession | last_activity >= created_at, 90-day TTL |
| UserContext | selected_text ≤ 5000 chars, selection_start < selection_end |
| RetrievedContext | chunks.length == scores.length, scores sorted descending |

---

## Next Steps

1. Generate OpenAPI schema for API contracts (contracts/ directory)
2. Create quickstart.md with setup instructions
3. Implement Pydantic models in `backend/src/api/models/`
