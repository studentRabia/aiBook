---
id: 002
title: Create RAG Chatbot Implementation Plan
stage: plan
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5
feature: 002-rag-chatbot
branch: 002-rag-chatbot
user: DELL
command: /sp.plan
labels: ["architecture", "planning", "rag", "chatbot", "technical-design"]
links:
  spec: specs/002-rag-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-rag-chatbot/plan.md
  - specs/002-rag-chatbot/research.md
  - specs/002-rag-chatbot/data-model.md
  - specs/002-rag-chatbot/contracts/openapi.yaml
  - specs/002-rag-chatbot/quickstart.md
tests:
  - Constitution check passed - multiple cloud services justified by free tier requirements
  - All NEEDS CLARIFICATION items resolved in research.md
  - Data models validated against functional requirements (FR-001 to FR-020)
  - API contracts validated against success criteria (SC-001 to SC-010)
---

## Prompt

$ARGUMENTS

(User triggered /sp.plan command to create architectural plan for the RAG chatbot feature)

## Response snapshot

Created comprehensive implementation plan with 5 Phase 0-1 artifacts:

**Phase 0 - Research (research.md)**:
- Resolved 11 "NEEDS CLARIFICATION" items from Technical Context
- Made 11 architectural decisions with rationale and alternatives considered
- Key decisions:
  - Frontend: Vanilla JS + Web Components (embeddability, minimal bundle)
  - Document Processing: LangChain + Markdown (semantic chunking)
  - Embedding: text-embedding-3-small (1024 dims, cost-effective)
  - LLM: GPT-3.5-turbo (speed/cost balance)
  - Deployment: Railway (backend) + Netlify (frontend)
  - Chunking: 512 tokens, 50 overlap, heading-hierarchy aware
  - Retention: 90 days (semester use case)

**Phase 1 - Design**:

1. **data-model.md**: Defined 6 core entities with Postgres/Qdrant schemas
   - ContentChunk (Qdrant vector DB) - textbook embeddings
   - UserMessage (Postgres) - user queries with context
   - ChatbotResponse (Postgres) - AI answers with citations
   - ConversationSession (Postgres) - multi-turn conversations
   - UserContext (in-memory + Postgres) - reading state
   - RetrievedContext (transient) - vector search results
   - All entities validated against functional requirements (FR-001 to FR-020)

2. **contracts/openapi.yaml**: RESTful API specification
   - POST /api/v1/chat - main query endpoint (general + selected-text modes)
   - POST/GET/DELETE /api/v1/sessions - conversation management
   - GET /api/v1/health - system health check
   - Complete request/response schemas with validation rules
   - Performance metrics in responses (retrieval_time_ms, total_time_ms) for SC-001 monitoring

3. **quickstart.md**: Developer implementation guide
   - Environment setup (Python 3.11, Node 18, API keys)
   - Database initialization (Qdrant collection, Postgres schema)
   - Textbook ingestion pipeline (PDF → Markdown → Chunks → Embeddings → Qdrant)
   - Backend implementation (FastAPI routes, services, models)
   - Frontend widget (vanilla JS Web Component)
   - Testing strategy (pytest unit/integration, Playwright E2E)
   - Deployment instructions (Railway + Netlify)

**Technical Context Filled**:
- Language: Python 3.11+ (backend), Vanilla JS (frontend)
- Stack: FastAPI, OpenAI API, Qdrant Cloud, Neon Postgres, LangChain
- Project Type: Web application (backend API + embeddable widget)
- Performance: <3s response (95%), 100 concurrent users
- Constraints: Free tier limits, embedding/LLM costs

**Constitution Check**:
- ✅ Testability: Independent user stories with acceptance scenarios
- ✅ Separation of Concerns: Backend, vector DB, conversation store, frontend
- ✅ Performance Requirements: SC-001 to SC-010 measurable targets
- ⚠️ Simplicity: Multiple cloud services justified by free tier POC scope
- ✅ Error Handling: FR-009, FR-010, FR-014
- No blocking violations

**Project Structure Defined**:
- `backend/src/` - FastAPI application (routes, models, services, scripts)
- `frontend/src/` - Chat widget (components, services, styles)
- `textbook/content/` - Source Markdown files
- `scripts/setup/` - Database initialization scripts

## Outcome

- ✅ Impact: Complete architectural plan with technical decisions, data models, API contracts, and developer guide. All "NEEDS CLARIFICATION" items resolved. Ready for task generation (/sp.tasks).
- 🧪 Tests: Constitution check passed, data models validated against 20 FRs, API contracts aligned with 10 success criteria
- 📁 Files: 5 planning artifacts created (plan.md, research.md, data-model.md, openapi.yaml, quickstart.md)
- 🔁 Next prompts: Run `/sp.tasks` to generate testable implementation tasks, then begin TDD cycle (Red-Green-Refactor)
- 🧠 Reflection: Comprehensive planning completed Phase 0-1. Research phase balanced pragmatism (free tiers, vanilla JS) with quality (LangChain, semantic chunking). Data model is normalized and validated. API is RESTful with performance observability built-in.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning workflow executed successfully
- Graders run and results (PASS/FAIL): PASS - All artifacts cross-validated (data-model ↔ API contracts ↔ functional requirements ↔ success criteria)
- Prompt variant (if applicable): Standard /sp.plan workflow with template-driven structure
- Next experiment (smallest change to try): Execute /sp.tasks to generate prioritized task list for TDD implementation; validate chunking strategy with real textbook content to refine token counts
