# Implementation Plan: Integrated RAG Chatbot for Robotics Textbook

**Branch**: `002-rag-chatbot` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rag-chatbot/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build and embed a Retrieval-Augmented Generation (RAG) chatbot within a published robotics textbook. The system will enable students to ask natural language questions about book content and receive accurate, context-aware answers with source citations. Key capabilities include: (1) general Q&A over entire book content, (2) focused questions on user-selected text, (3) multi-turn conversational context, and (4) responsive web interface embedded in the textbook.

**Technical Stack** (from user requirements): FastAPI backend, OpenAI API for LLM, Qdrant Cloud for vector storage, Neon Serverless Postgres for conversation history, web frontend with chat UI.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**:
- Backend: FastAPI, OpenAI Python SDK, Qdrant Client, psycopg2 (Neon Postgres), Pydantic
- Frontend: NEEDS CLARIFICATION (React/Vue/vanilla JS for chat widget)
- Document Processing: NEEDS CLARIFICATION (for chunking/embedding textbook content)

**Storage**:
- Vector DB: Qdrant Cloud Free Tier (textbook embeddings)
- Relational DB: Neon Serverless Postgres (conversation history, session management)
- Document Source: NEEDS CLARIFICATION (Markdown/HTML/PDF - affects chunking strategy)

**Testing**: pytest (backend unit/integration), NEEDS CLARIFICATION (frontend testing framework)

**Target Platform**:
- Backend: Cloud-hosted (containerized FastAPI service)
- Frontend: Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Deployment: NEEDS CLARIFICATION (hosting platform - Vercel/Netlify/Railway/Docker)

**Project Type**: Web application (backend API + frontend widget)

**Performance Goals**:
- < 3 seconds end-to-end response time for 95% of queries (SC-001)
- Support 100 concurrent users without degradation (SC-005)
- Vector search: < 500ms for similarity queries
- LLM generation: < 2 seconds for typical responses

**Constraints**:
- Free tier limits: Qdrant Cloud (storage/requests), Neon Postgres (storage/connections), OpenAI API (rate limits)
- Embedding model: NEEDS CLARIFICATION (text-embedding-ada-002 vs text-embedding-3-small)
- LLM model: NEEDS CLARIFICATION (GPT-3.5-turbo vs GPT-4 for generation - cost vs quality tradeoff)
- Chunking strategy: NEEDS CLARIFICATION (chunk size, overlap, splitting method)

**Scale/Scope**:
- Initial: Single robotics textbook (~200-500 pages estimated)
- Users: 100 concurrent, NEEDS CLARIFICATION (total user base size)
- Conversation history: NEEDS CLARIFICATION (retention period - 30/90/365 days)
- Vector DB size: NEEDS CLARIFICATION (estimated based on chunk count)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file is currently a template. Applying standard software engineering principles.

### Initial Check (Pre-Research)

- ✅ **Testability**: All user stories have independent acceptance scenarios (P1-P4)
- ✅ **Separation of Concerns**: Clear separation between backend API, vector storage, conversation management, and frontend
- ✅ **Performance Requirements**: Specific, measurable targets defined (SC-001 to SC-010)
- ⚠️ **Simplicity**: Using multiple external services (OpenAI, Qdrant, Neon) - justified by free tier constraints and avoiding premature optimization
- ✅ **Error Handling**: Requirements FR-009, FR-010, FR-014 explicitly address error scenarios
- ⚠️ **Dependencies**: Multiple third-party dependencies (OpenAI API, Qdrant Cloud, Neon Postgres) - creates vendor lock-in risk but enables rapid development

**Violations to Justify**: None blocking. Multiple cloud services are justified by:
1. Free tier availability matches POC/MVP scope
2. Each service addresses distinct concerns (LLM, vectors, persistence)
3. Migration paths exist if scaling requires self-hosted alternatives

**Post-Design Re-Check**: Will validate after Phase 1 contracts are defined.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── chat.py           # Chat endpoint (POST /api/chat)
│   │   │   ├── sessions.py       # Session management
│   │   │   └── health.py         # Health check
│   │   ├── models/
│   │   │   ├── message.py        # Message, Response models
│   │   │   ├── session.py        # Session, UserContext models
│   │   │   └── chunk.py          # ContentChunk model
│   │   ├── services/
│   │   │   ├── embeddings.py     # OpenAI embedding generation
│   │   │   ├── vector_search.py  # Qdrant query service
│   │   │   ├── llm.py            # OpenAI chat completion
│   │   │   ├── chunking.py       # Document chunking logic
│   │   │   └── session_store.py  # Postgres session persistence
│   │   ├── config.py             # Environment config
│   │   └── main.py               # FastAPI app entry
│   └── scripts/
│       └── ingest_textbook.py    # One-time setup: chunk + embed
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── requirements.txt
└── Dockerfile

frontend/
├── src/
│   ├── components/
│   │   ├── ChatWidget.js         # Main chat component
│   │   ├── MessageList.js        # Message display
│   │   ├── InputBox.js           # User input
│   │   └── ToggleButton.js       # Open/close control
│   ├── services/
│   │   ├── api.js                # Backend API client
│   │   └── selection.js          # Text selection handler
│   ├── styles/
│   │   └── chat.css              # Chat UI styles
│   └── index.js                  # Entry point
├── tests/
└── package.json

textbook/
└── content/                      # Source textbook files (Markdown/HTML/PDF)

scripts/
└── setup/
    ├── init_qdrant.py            # Initialize vector collection
    └── init_postgres.py          # Create DB schema
```

**Structure Decision**: Web application (backend + frontend). Backend is FastAPI service handling RAG logic. Frontend is embeddable chat widget. Separate `textbook/` directory for source content to be ingested.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
