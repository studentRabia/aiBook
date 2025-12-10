# Tasks: Integrated RAG Chatbot for Robotics Textbook

**Input**: Design documents from `/specs/002-rag-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are excluded. Focus on implementation tasks that deliver user-facing functionality.

**Organization**: Tasks are grouped by user story (P1-P4) to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **`- [ ]`**: Checkbox (REQUIRED at start of every task)
- **[ID]**: Task number (T001, T002, etc.) in execution order
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this belongs to (US1, US2, US3, US4) - REQUIRED for user story phases
- Include exact file paths in descriptions

## Path Conventions

Per plan.md, this is a web application with:
- **Backend**: `backend/src/` - FastAPI application
- **Frontend**: `frontend/src/` - Vanilla JS Web Component
- **Textbook**: `textbook/content/` - Source content files
- **Scripts**: `scripts/setup/` - Database initialization

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [X] T001 Create backend directory structure (backend/src/api/routes/, backend/src/api/models/, backend/src/api/services/, backend/src/scripts/, backend/tests/)
- [X] T002 Create frontend directory structure (frontend/src/components/, frontend/src/services/, frontend/src/styles/)
- [X] T003 Create textbook and scripts directories (textbook/content/, scripts/setup/)
- [X] T004 [P] Initialize Python backend with requirements.txt (FastAPI==0.104.1, uvicorn==0.24.0, pydantic==2.5.0, openai==1.3.5, qdrant-client==1.7.0, psycopg2-binary==2.9.9, python-dotenv==1.0.0, langchain==0.0.340)
- [X] T005 [P] Initialize frontend with package.json (vite for dev server)
- [X] T006 [P] Create .env template file in backend/ with placeholders for OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY, DATABASE_URL
- [X] T007 [P] Create .gitignore for Python (.env, __pycache__, venv/) and Node (node_modules/, dist/)
- [X] T008 [P] Create Dockerfile for backend containerization per deployment strategy (Railway)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Implement configuration management in backend/src/config.py using Pydantic BaseSettings (OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY, DATABASE_URL, CORS_ORIGINS)
- [ ] T010 Create database initialization script in scripts/setup/init_postgres.py (sessions table, messages table with indexes per data-model.md)
- [ ] T011 Create Qdrant collection initialization script in scripts/setup/init_qdrant.py (textbook_chunks collection, 1024-dim vectors, COSINE distance per research.md Decision 3)
- [ ] T012 [P] Implement base Pydantic models in backend/src/api/models/ for shared entities (QueryMode enum, UserContext, PerformanceMetrics, ErrorResponse from data-model.md)
- [ ] T013 [P] Setup FastAPI application in backend/src/main.py with CORS middleware, health endpoint, and router registration
- [ ] T014 [P] Implement health check route in backend/src/api/routes/health.py (GET /health with Postgres, Qdrant, OpenAI status checks per openapi.yaml)
- [ ] T015 Implement textbook ingestion script in backend/src/scripts/ingest_textbook.py (LangChain RecursiveCharacterTextSplitter with 512 tokens, 50 overlap per research.md Decision 5, OpenAI text-embedding-3-small 1024-dim per Decision 3, batch upload to Qdrant)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - General Book Content Questions (Priority: P1) 🎯 MVP

**Goal**: Enable students to ask questions about any topic in the textbook and receive accurate answers with chapter/section citations

**Independent Test**: Ask "What is inverse kinematics?" and verify chatbot returns answer with chapter references from textbook content

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create ContentChunk model in backend/src/api/models/chunk.py (id, text, embedding, chapter, section, metadata per data-model.md)
- [ ] T017 [P] [US1] Create UserMessage model in backend/src/api/models/message.py (id, session_id, message_text, query_mode, selected_text, timestamp per data-model.md)
- [ ] T018 [P] [US1] Create ChatbotResponse model in backend/src/api/models/message.py (id, session_id, response_text, sources as List[SourceCitation], confidence_score, is_out_of_scope, performance metrics per data-model.md)
- [ ] T019 [P] [US1] Create SourceCitation nested model in backend/src/api/models/message.py (chunk_id, chapter, section, page_number, relevance_score, quoted_text per data-model.md)
- [ ] T020 [US1] Implement VectorSearchService in backend/src/api/services/vector_search.py (search method using Qdrant client, query embedding generation with OpenAI text-embedding-3-small 1024-dim, top_k=5 retrieval per quickstart.md)
- [ ] T021 [US1] Implement LLMService in backend/src/api/services/llm.py (generate_answer method using GPT-3.5-turbo, temperature=0.3, max_tokens=800, system prompt enforcing citations and anti-hallucination per research.md Decision 4)
- [ ] T022 [US1] Implement chat endpoint POST /api/v1/chat in backend/src/api/routes/chat.py (handle general query_mode, vector search → LLM generation pipeline, build SourceCitation list, track performance metrics for SC-001 <3s validation per openapi.yaml)
- [ ] T023 [US1] Add out-of-scope detection logic in chat route (check retrieval scores, set is_out_of_scope=True if scores <0.3, return appropriate message per FR-009)
- [ ] T024 [US1] Add error handling and graceful degradation in chat route (API failures, rate limiting, empty results per FR-014)
- [ ] T025 [P] [US1] Create ConversationSession model in backend/src/api/models/session.py (id, user_id, textbook_id, created_at, last_activity_at, message_count per data-model.md)
- [ ] T026 [US1] Implement session creation endpoint POST /api/v1/sessions in backend/src/api/routes/sessions.py (create session record in Postgres, return session_id per openapi.yaml)
- [ ] T027 [US1] Implement session retrieval endpoint GET /api/v1/sessions/{session_id} in backend/src/api/routes/sessions.py (fetch session details with message_count and last_activity per openapi.yaml)
- [ ] T028 [US1] Store user messages and chatbot responses in Postgres messages table within chat endpoint (insert after each exchange, update session.last_activity_at per FR-011)

**Checkpoint**: User Story 1 complete - Basic Q&A with citations works end-to-end (Backend API functional for general questions)

---

## Phase 4: User Story 2 - Context-Aware Questions on Selected Text (Priority: P2)

**Goal**: Enable students to select specific text and ask questions about only that selection (not entire book)

**Independent Test**: Select a paragraph about PID control, ask "Explain this in simpler terms", verify response uses only selected text context

### Implementation for User Story 2

- [ ] T029 [US2] Extend chat endpoint in backend/src/api/routes/chat.py to handle query_mode=SELECTED_TEXT (bypass vector search, use selected_text directly as context per FR-006, FR-007)
- [ ] T030 [US2] Add selected_text validation in chat endpoint (require selected_text when query_mode=SELECTED_TEXT, max 5000 chars per data-model.md UserMessage validation)
- [ ] T031 [US2] Modify LLMService.generate_answer in backend/src/api/services/llm.py to accept optional direct_context parameter (use instead of retrieved chunks when query_mode=SELECTED_TEXT)
- [ ] T032 [US2] Update SourceCitation generation in chat endpoint for selected text mode (create single citation with "Selected Text" as chapter, include first 200 chars as quoted_text)

**Checkpoint**: User Story 2 complete - Selected text questions work independently from general questions

---

## Phase 5: User Story 3 - Conversation History and Follow-up Questions (Priority: P3)

**Goal**: Enable multi-turn conversations where chatbot understands context from previous exchanges without re-stating

**Independent Test**: Ask "What is forward kinematics?", then "What about inverse kinematics?", verify second response understands comparative context

### Implementation for User Story 3

- [ ] T033 [US3] Implement session message history retrieval endpoint GET /api/v1/sessions/{session_id}/messages in backend/src/api/routes/sessions.py (fetch ordered messages with pagination, limit=50, offset=0 per openapi.yaml)
- [ ] T034 [US3] Modify chat endpoint in backend/src/api/routes/chat.py to fetch conversation history from Postgres (retrieve last 5 messages for session_id before processing new query)
- [ ] T035 [US3] Update LLMService.generate_answer in backend/src/api/services/llm.py to accept conversation_history parameter (include previous messages in OpenAI API call for context per FR-008)
- [ ] T036 [US3] Implement session deletion endpoint DELETE /api/v1/sessions/{session_id} in backend/src/api/routes/sessions.py (set is_active=False, allow users to clear history per FR-020)
- [ ] T037 [US3] Add conversation summary generation for long sessions in backend/src/api/services/session_store.py (LLM-generated summary when message_count > 20 to maintain context window limits)

**Checkpoint**: User Story 3 complete - Multi-turn conversations work with context preservation across session lifetime

---

## Phase 6: User Story 4 - Visual Integration with Book Interface (Priority: P4)

**Goal**: Embed responsive chat widget in textbook with toggle button, preserving reading position across open/close

**Independent Test**: Open chat on any textbook page, send message, close chat, verify reading position preserved and UI responsive on mobile

### Implementation for User Story 4

- [ ] T038 [P] [US4] Create ChatWidget Web Component class in frontend/src/components/ChatWidget.js (define custom element <chatbot-widget>, Shadow DOM setup, basic structure per research.md Decision 1)
- [ ] T039 [P] [US4] Create ToggleButton component in frontend/src/components/ToggleButton.js (chat toggle button, state management for isOpen, click handlers)
- [ ] T040 [P] [US4] Create MessageList component in frontend/src/components/MessageList.js (display user/chatbot messages, scrolling, visual distinction per FR-019)
- [ ] T041 [P] [US4] Create InputBox component in frontend/src/components/InputBox.js (text input, send button, enter key handler, loading state per FR-013)
- [ ] T042 [US4] Implement API client service in frontend/src/services/api.js (fetch wrappers for POST /api/v1/chat, POST /api/v1/sessions, error handling)
- [ ] T043 [US4] Implement text selection detection service in frontend/src/services/selection.js (window.getSelection(), capture selected text, pass to chat API with query_mode=SELECTED_TEXT per FR-007)
- [ ] T044 [US4] Wire up session creation in ChatWidget.connectedCallback (call POST /api/v1/sessions on widget initialization, store session_id in component state)
- [ ] T045 [US4] Wire up message sending in ChatWidget (collect input, call api.sendMessage with session_id and query_mode, append response to MessageList)
- [ ] T046 [US4] Implement chat panel open/close behavior in ChatWidget (toggle visibility, preserve scroll position in textbook per FR-012, Acceptance Scenario 1-2)
- [ ] T047 [P] [US4] Create responsive CSS styles in frontend/src/styles/chat.css (desktop, tablet, mobile breakpoints, Shadow DOM encapsulation per FR-015, research.md Decision 1)
- [ ] T048 [US4] Add loading indicator during API calls in MessageList (spinner/skeleton while processing, meets Acceptance Scenario 4)
- [ ] T049 [US4] Create frontend entry point in frontend/src/index.js (import ChatWidget, register custom element, export for embedding)
- [ ] T050 [US4] Create demo textbook page in textbook/index.html (load chat widget via <script> tag, demonstrate embedding per quickstart.md)

**Checkpoint**: User Story 4 complete - Full end-to-end chat experience from embedded widget to backend

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T051 [P] Add comprehensive error messages across all endpoints in backend/src/api/routes/ (user-friendly messages per FR-014, map exception types to appropriate HTTP status codes)
- [ ] T052 [P] Implement request/response logging in backend/src/main.py (structured logging for all API calls, include session_id, query_mode, performance metrics for observability)
- [ ] T053 [P] Add rate limiting middleware in backend/src/api/middleware/rate_limit.py (60 requests/minute per IP to prevent API quota exhaustion, return 429 status per openapi.yaml edge case)
- [ ] T054 [P] Optimize vector search performance in VectorSearchService (connection pooling for Qdrant client, cache frequently asked questions if retrieval_time_ms consistently >500ms)
- [ ] T055 [P] Add mathematical notation rendering in frontend MessageList (detect LaTeX in responses, render with KaTeX or MathJax per FR-016)
- [ ] T056 [P] Implement 90-day conversation cleanup cron job in scripts/setup/cleanup_sessions.py (DELETE FROM sessions WHERE last_activity_at < NOW() - INTERVAL '90 days' per research.md Decision 9)
- [ ] T057 Validate quickstart.md by following all setup steps (verify database initialization, textbook ingestion, backend startup, frontend embedding)
- [ ] T058 Create deployment configuration for Railway in backend/ (railway.json or Dockerfile with environment variable injection per research.md Decision 8)
- [ ] T059 Create Netlify deployment configuration for frontend (netlify.toml, build command, publish directory per research.md Decision 8)
- [ ] T060 [P] Add CORS configuration validation in backend/src/main.py (ensure textbook domain is in CORS_ORIGINS for production deployment)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Independent but integrates with US1 chat endpoint
  - User Story 3 (P3): Can start after Foundational - Independent but extends US1 chat endpoint
  - User Story 4 (P4): Depends on US1 backend being functional - Frontend widget needs working API
- **Polish (Phase 7)**: Depends on at least US1 being complete (MVP); ideally all user stories

### User Story Dependencies

```
Foundational (Phase 2)
         ↓
    ┌────┴────┬────────┬────────┐
    ↓         ↓        ↓        ↓
  US1 (P1)  US2 (P2) US3 (P3)  │
    ↓         ↓        ↓        │
    └────┬────┴────────┘        │
         └───────────────────→ US4 (P4)
                                 ↓
                            Polish (Phase 7)
```

- **US1 (P1) - General Questions**: Fully independent, core MVP
- **US2 (P2) - Selected Text**: Extends US1 chat endpoint but independently testable
- **US3 (P3) - Conversation History**: Extends US1 chat endpoint but independently testable
- **US4 (P4) - Frontend Widget**: Depends on US1 API being functional (cannot test UI without backend)

### Within Each User Story

- Models before services (data structures defined first)
- Services before endpoints/routes (business logic before API layer)
- Core implementation before integration (get single feature working before connecting to others)
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Within Setup (Phase 1)**:
- T004 (Python requirements), T005 (frontend package.json), T006 (.env template), T007 (.gitignore), T008 (Dockerfile) can all run in parallel

**Within Foundational (Phase 2)**:
- T012 (base models), T013 (FastAPI app), T014 (health route) can run in parallel after T009-T011 complete

**Within User Story 1 (Phase 3)**:
- T016-T019 (all models) can run in parallel
- T025 (ConversationSession model) can run in parallel with T016-T019

**Within User Story 4 (Phase 6)**:
- T038-T041 (all frontend components) can run in parallel
- T047 (CSS styles) can run in parallel with T038-T041

**Across User Stories (if team capacity allows)**:
- After Foundational completes, US1, US2, US3 can be worked on by different developers in parallel
- US4 must wait for US1 backend to be functional (T022 chat endpoint minimum)

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create ContentChunk model in backend/src/api/models/chunk.py"
Task: "Create UserMessage model in backend/src/api/models/message.py"
Task: "Create ChatbotResponse model in backend/src/api/models/message.py"
Task: "Create SourceCitation nested model in backend/src/api/models/message.py"
Task: "Create ConversationSession model in backend/src/api/models/session.py"

# All 5 models are in different files and have no dependencies on each other
# Expected outcome: All models defined and ready for service layer
```

---

## Parallel Example: User Story 4

```bash
# Launch all frontend components together:
Task: "Create ChatWidget Web Component in frontend/src/components/ChatWidget.js"
Task: "Create ToggleButton component in frontend/src/components/ToggleButton.js"
Task: "Create MessageList component in frontend/src/components/MessageList.js"
Task: "Create InputBox component in frontend/src/components/InputBox.js"
Task: "Create responsive CSS styles in frontend/src/styles/chat.css"

# All components are independent until wiring phase (T044-T045)
# Expected outcome: All UI components ready to be integrated
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete **Phase 1: Setup** (T001-T008) - Project structure ready
2. Complete **Phase 2: Foundational** (T009-T015) - Infrastructure ready
3. Complete **Phase 3: User Story 1** (T016-T028) - Core Q&A working
4. **STOP and VALIDATE**:
   - Run textbook ingestion script
   - Test: POST /api/v1/sessions → GET session_id
   - Test: POST /api/v1/chat with "What is inverse kinematics?" → Verify answer with citations
   - Validate SC-001 (<3 seconds), SC-002 (90% accuracy), SC-003 (85% citations)
5. Deploy backend to Railway if ready

**MVP Delivers**: Students can ask questions about textbook content and get cited answers (core value)

### Incremental Delivery

1. **Foundation** (Phases 1-2) → Databases ready, health checks pass
2. **MVP** (Phase 3: US1) → Backend API functional, can be tested with curl/Postman
3. **Enhanced** (Phase 4: US2) → Selected text questions work, precision feature
4. **Conversational** (Phase 5: US3) → Multi-turn context, natural flow
5. **Full Product** (Phase 6: US4) → Embedded widget, complete UX
6. **Production** (Phase 7: Polish) → Error handling, rate limiting, cleanup

Each phase adds value without breaking previous phases.

### Parallel Team Strategy

With 3 developers after Foundational phase completes:

1. **Developer A**: User Story 1 (T016-T028) - 13 tasks, ~3-4 days
2. **Developer B**: User Story 2 (T029-T032) - 4 tasks, ~1 day, then help with US4
3. **Developer C**: User Story 3 (T033-T037) - 5 tasks, ~1-2 days, then help with US4
4. **All together**: User Story 4 (T038-T050) - 13 tasks, ~3-4 days after US1 backend ready

Estimated timeline: ~1.5-2 weeks to MVP (US1), ~3-4 weeks to full product (US1-US4)

---

## Task Summary

**Total Tasks**: 60
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 7 tasks (BLOCKING)
- **Phase 3 (US1 - P1)**: 13 tasks 🎯 MVP
- **Phase 4 (US2 - P2)**: 4 tasks
- **Phase 5 (US3 - P3)**: 5 tasks
- **Phase 6 (US4 - P4)**: 13 tasks
- **Phase 7 (Polish)**: 10 tasks

**Parallelizable Tasks**: 21 tasks marked [P]

**Story Distribution**:
- US1: 13 tasks (core MVP)
- US2: 4 tasks (selected text precision)
- US3: 5 tasks (conversation context)
- US4: 13 tasks (frontend embedding)
- Infrastructure: 25 tasks (setup + foundational + polish)

**Critical Path to MVP**: T001-T015 (Setup + Foundational) → T016-T028 (US1) = 23 tasks

---

## Notes

- **Tests excluded**: Specification does not explicitly request TDD approach, focus is on delivering user-facing functionality
- **[P] tasks**: Different files, no dependencies on incomplete tasks in same phase
- **[Story] labels**: Required for all tasks in Phases 3-6, maps to user stories P1-P4 in spec.md
- Each user story is independently completable and testable per specification requirements
- Verify independent test criteria at each checkpoint before moving to next phase
- Commit after each task or logical group (e.g., all models for a story)
- **Performance tracking**: Log retrieval_time_ms, generation_time_ms, total_time_ms in every chat response for SC-001 validation
- **Stop at checkpoints** to validate story independently before continuing
