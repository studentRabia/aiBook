# Quickstart Guide: RAG Chatbot Development

**Feature**: 002-rag-chatbot
**Date**: 2025-12-10
**Audience**: Developers implementing the RAG chatbot

## Overview

This guide walks through setting up the development environment and implementing the RAG chatbot from specification to working system.

**Prerequisites**:
- Python 3.11+ installed
- Node.js 18+ (for frontend)
- Git
- OpenAI API key
- Qdrant Cloud account (free tier)
- Neon Postgres account (free tier)

**Estimated Setup Time**: 30-45 minutes

---

## Phase 0: Environment Setup

### 1. Clone & Navigate

```bash
cd aiBook
git checkout 002-rag-chatbot
```

### 2. Create Virtual Environment (Backend)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**requirements.txt** (create if missing):
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
openai==1.3.5
qdrant-client==1.7.0
psycopg2-binary==2.9.9
python-dotenv==1.0.0
langchain==0.0.340
```

### 4. Configure Environment Variables

Create `backend/.env`:
```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant Cloud
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-key

# Neon Postgres
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/chatbot_db

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
CORS_ORIGINS=http://localhost:3000,http://localhost:8080
```

### 5. Initialize Databases

#### Qdrant (Vector DB)

```python
# scripts/setup/init_qdrant.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import os
from dotenv import load_dotenv

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

client.create_collection(
    collection_name="textbook_chunks",
    vectors_config=VectorParams(
        size=1024,  # text-embedding-3-small
        distance=Distance.COSINE
    )
)

print("✅ Qdrant collection 'textbook_chunks' created")
```

Run:
```bash
python scripts/setup/init_qdrant.py
```

#### Postgres (Conversation History)

```python
# scripts/setup/init_postgres.py
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cur = conn.cursor()

# Create sessions table
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

# Create indexes
cur.execute("CREATE INDEX IF NOT EXISTS idx_user_textbook ON sessions(user_id, textbook_id);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_last_activity ON sessions(last_activity_at);")

# Create messages table
cur.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        message_type VARCHAR(20) NOT NULL,

        message_text TEXT,
        selected_text TEXT,
        query_mode VARCHAR(20),
        current_page VARCHAR(255),
        current_chapter VARCHAR(255),

        response_text TEXT,
        sources JSONB,
        confidence_score FLOAT,
        is_out_of_scope BOOLEAN DEFAULT FALSE,
        retrieved_chunks JSONB,
        retrieval_time_ms INTEGER,
        generation_time_ms INTEGER,
        total_time_ms INTEGER,
        model_used VARCHAR(100),

        timestamp TIMESTAMP DEFAULT NOW(),

        CONSTRAINT check_message_type CHECK (message_type IN ('user', 'chatbot'))
    );
""")

cur.execute("CREATE INDEX IF NOT EXISTS idx_session_messages ON messages(session_id, timestamp);")

conn.commit()
cur.close()
conn.close()

print("✅ Postgres schema created")
```

Run:
```bash
python scripts/setup/init_postgres.py
```

---

## Phase 1: Ingest Textbook Content

### 1. Prepare Textbook Files

Place Markdown files in `textbook/content/`:
```
textbook/content/
├── chapter-01-introduction.md
├── chapter-02-fundamentals.md
├── chapter-03-kinematics.md
└── ...
```

**If you have PDF**: Convert using Pandoc:
```bash
pandoc robotics-textbook.pdf -o textbook/content/full-book.md
```

### 2. Chunk and Embed

```python
# backend/src/scripts/ingest_textbook.py
import os
from pathlib import Path
from openai import OpenAI
from qdrant_client import QdrantClient
from langchain.text_splitter import RecursiveCharacterTextSplitter
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Initialize clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Configure splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""]
)

def extract_metadata(text, filename):
    """Extract chapter/section from markdown headings"""
    lines = text.split('\n')
    chapter = None
    section = None

    for line in lines:
        if line.startswith('# '):
            chapter = line[2:].strip()
        elif line.startswith('## '):
            section = line[3:].strip()
            break

    return chapter or filename, section

def ingest_file(filepath):
    """Process single markdown file"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = Path(filepath).stem
    chunks = splitter.split_text(content)

    print(f"Processing {filename}: {len(chunks)} chunks")

    points = []
    for idx, chunk_text in enumerate(chunks):
        chapter, section = extract_metadata(chunk_text, filename)

        # Generate embedding
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk_text,
            dimensions=1024
        )
        embedding = response.data[0].embedding

        # Prepare Qdrant point
        point_id = str(uuid.uuid4())
        points.append({
            "id": point_id,
            "vector": embedding,
            "payload": {
                "text": chunk_text,
                "textbook_id": "robotics-101",
                "chapter": chapter,
                "section": section,
                "chunk_index": idx,
                "filename": filename,
                "created_at": datetime.utcnow().isoformat()
            }
        })

        # Batch upload every 100 chunks
        if len(points) >= 100:
            qdrant_client.upsert(
                collection_name="textbook_chunks",
                points=points
            )
            print(f"  Uploaded {len(points)} chunks")
            points = []

    # Upload remaining
    if points:
        qdrant_client.upsert(
            collection_name="textbook_chunks",
            points=points
        )
        print(f"  Uploaded {len(points)} chunks")

# Process all markdown files
textbook_dir = Path("../textbook/content")
for md_file in textbook_dir.glob("*.md"):
    ingest_file(md_file)

print("✅ Textbook ingestion complete")
```

Run:
```bash
cd backend
python src/scripts/ingest_textbook.py
```

**Expected Output**:
```
Processing chapter-01-introduction: 23 chunks
  Uploaded 23 chunks
Processing chapter-02-fundamentals: 45 chunks
  Uploaded 45 chunks
...
✅ Textbook ingestion complete
```

---

## Phase 2: Implement Backend API

### 1. Project Structure

```bash
mkdir -p backend/src/api/{routes,models,services}
```

### 2. Configuration

```python
# backend/src/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    qdrant_url: str
    qdrant_api_key: str
    database_url: str
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()
```

### 3. Models

```python
# backend/src/api/models/message.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class QueryMode(str, Enum):
    GENERAL = "general"
    SELECTED_TEXT = "selected_text"

class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    query_mode: QueryMode
    selected_text: Optional[str] = Field(None, max_length=5000)
    context: Optional[dict] = None

class SourceCitation(BaseModel):
    chunk_id: str
    chapter: str
    section: Optional[str] = None
    page_number: Optional[int] = None
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    quoted_text: Optional[str] = Field(None, max_length=200)

class ChatResponse(BaseModel):
    message_id: str
    session_id: str
    response: str
    sources: List[SourceCitation]
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    is_out_of_scope: bool
    performance: dict
    timestamp: datetime
```

### 4. Services

```python
# backend/src/api/services/vector_search.py
from qdrant_client import QdrantClient
from openai import OpenAI
import os

class VectorSearchService:
    def __init__(self):
        self.qdrant = QdrantClient(url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"))
        self.openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def search(self, query: str, top_k: int = 5):
        """Perform vector similarity search"""
        # Generate query embedding
        response = self.openai.embeddings.create(
            model="text-embedding-3-small",
            input=query,
            dimensions=1024
        )
        query_vector = response.data[0].embedding

        # Search Qdrant
        results = self.qdrant.search(
            collection_name="textbook_chunks",
            query_vector=query_vector,
            limit=top_k
        )

        return results
```

```python
# backend/src/api/services/llm.py
from openai import OpenAI
import os

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    def generate_answer(self, query: str, context_chunks: list, conversation_history: list = None):
        """Generate answer using GPT-3.5-turbo"""
        context = "\n\n".join([chunk.payload['text'] for chunk in context_chunks])

        system_prompt = """You are a helpful tutor for a robotics textbook. Answer questions accurately based ONLY on the provided context.
        - Always cite sources (chapter/section)
        - If the answer is not in the context, say so clearly
        - Be concise but thorough
        - Use the exact terminology from the textbook"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
        ]

        response = self.client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            messages=messages,
            temperature=0.3,
            max_tokens=800
        )

        return response.choices[0].message.content
```

### 5. Routes

```python
# backend/src/api/routes/chat.py
from fastapi import APIRouter, HTTPException
from ..models.message import ChatRequest, ChatResponse, SourceCitation
from ..services.vector_search import VectorSearchService
from ..services.llm import LLMService
import uuid
from datetime import datetime
import time

router = APIRouter(prefix="/api/v1", tags=["chat"])
vector_search = VectorSearchService()
llm_service = LLMService()

@router.post("/chat", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    start_time = time.time()

    # Retrieval phase
    retrieval_start = time.time()
    if request.query_mode == "general":
        results = vector_search.search(request.message, top_k=5)
    else:
        # For selected text, use it as context directly
        results = []
    retrieval_time_ms = int((time.time() - retrieval_start) * 1000)

    # Generation phase
    generation_start = time.time()
    if results:
        answer = llm_service.generate_answer(request.message, results)
        is_out_of_scope = False
    else:
        answer = "I apologize, but I don't have information about that in this textbook."
        is_out_of_scope = True
    generation_time_ms = int((time.time() - generation_start) * 1000)

    # Build sources
    sources = [
        SourceCitation(
            chunk_id=str(result.id),
            chapter=result.payload.get('chapter', 'Unknown'),
            section=result.payload.get('section'),
            relevance_score=result.score,
            quoted_text=result.payload['text'][:200]
        )
        for result in results
    ]

    total_time_ms = int((time.time() - start_time) * 1000)

    return ChatResponse(
        message_id=str(uuid.uuid4()),
        session_id=request.session_id,
        response=answer,
        sources=sources,
        is_out_of_scope=is_out_of_scope,
        performance={
            "retrieval_time_ms": retrieval_time_ms,
            "generation_time_ms": generation_time_ms,
            "total_time_ms": total_time_ms
        },
        timestamp=datetime.utcnow()
    )
```

### 6. Main Application

```python
# backend/src/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import chat
from .config import settings

app = FastAPI(title="RAG Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

### 7. Run Backend

```bash
cd backend
uvicorn src.main:app --reload
```

Visit http://localhost:8000/docs for Swagger UI.

---

## Phase 3: Implement Frontend Widget

### 1. Setup

```bash
cd frontend
npm init -y
npm install --save-dev vite
```

### 2. Chat Widget Component

```javascript
// frontend/src/components/ChatWidget.js
class ChatWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.sessionId = null;
        this.isOpen = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.createSession();
    }

    async createSession() {
        const response = await fetch('http://localhost:8000/api/v1/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textbook_id: 'robotics-101' })
        });
        const data = await response.json();
        this.sessionId = data.session_id;
    }

    async sendMessage(message) {
        const response = await fetch('http://localhost:8000/api/v1/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: this.sessionId,
                message: message,
                query_mode: 'general'
            })
        });
        return await response.json();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .chat-widget { /* styles */ }
                .chat-toggle { /* styles */ }
                .chat-panel { /* styles */ }
            </style>
            <div class="chat-widget">
                <button class="chat-toggle">💬 Ask AI</button>
                <div class="chat-panel" hidden>
                    <div class="messages"></div>
                    <input type="text" class="input" placeholder="Ask a question...">
                </div>
            </div>
        `;
    }
}

customElements.define('chatbot-widget', ChatWidget);
```

### 3. Embed in Textbook

```html
<!-- textbook/index.html -->
<script type="module" src="/frontend/src/index.js"></script>
<chatbot-widget></chatbot-widget>
```

---

## Testing

### Unit Tests (Backend)

```python
# backend/tests/unit/test_vector_search.py
import pytest
from src.api.services.vector_search import VectorSearchService

def test_search_returns_results():
    service = VectorSearchService()
    results = service.search("What is inverse kinematics?", top_k=5)
    assert len(results) <= 5
    assert all(hasattr(r, 'score') for r in results)
```

Run:
```bash
pytest backend/tests/
```

### Integration Tests

```python
# backend/tests/integration/test_chat_endpoint.py
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_chat_endpoint():
    response = client.post("/api/v1/chat", json={
        "session_id": "test-session",
        "message": "What is inverse kinematics?",
        "query_mode": "general"
    })
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "sources" in data
```

---

## Deployment

### Railway (Backend)

1. Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. Deploy:
```bash
railway login
railway init
railway up
```

### Netlify (Frontend)

```bash
cd frontend
npm run build
netlify deploy --prod
```

---

## Next Steps

1. **Run `/sp.tasks`** to generate implementation task list
2. **Implement test-first** (Red-Green-Refactor cycle)
3. **Monitor performance**: Track SC-001 (<3s response time)
4. **Iterate on chunking**: Adjust based on retrieval quality

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `OPENAI_API_KEY` not found | Check `.env` file, ensure `load_dotenv()` called |
| Qdrant connection error | Verify `QDRANT_URL` and `QDRANT_API_KEY` |
| Embedding dimension mismatch | Ensure `dimensions=1024` in both embedding calls |
| Slow responses (>3s) | Check network latency; consider caching frequently asked questions |

---

**Documentation**:
- [Spec](./spec.md)
- [Research](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/openapi.yaml)
