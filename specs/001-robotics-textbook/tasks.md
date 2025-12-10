# Tasks: Physical AI & Humanoid Robotics Textbook

**Input**: Design documents from `/specs/001-robotics-textbook/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT required for this project (content generation and validation-focused)

**Organization**: Tasks are grouped to enable incremental delivery: Setup → Foundation → Module 1 (MVP) → Modules 2-5 → RAG Integration → Deployment → Bonus Features

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story/module this task belongs to (e.g., US1=Module 1, US2=Module 2, etc.)
- Include exact file paths in descriptions

## Path Conventions

- **Textbook Content**: `textbook/docs/module-X/` for chapter Markdown files
- **Code Examples**: `code-examples/module-X/` for runnable examples
- **Backend**: `backend/src/` for FastAPI RAG chatbot
- **Scripts**: `scripts/content-generation/`, `scripts/data-processing/`, `scripts/deployment/`
- **Bonus Features**: `bonus/` for optional implementations

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure per plan.md (textbook/, backend/, scripts/, code-examples/, bonus/)
- [X] T002 Initialize Node.js project for Docusaurus in textbook/ directory (package.json, docusaurus.config.js)
- [X] T003 [P] Initialize Python project for backend in backend/ directory (requirements.txt, src/main.py)
- [X] T004 [P] Initialize content generation scripts in scripts/content-generation/ (generate_chapter.py, validate_citations.py, check_readability.py)
- [X] T005 [P] Create .gitignore with Node.js, Python, and IDE exclusions
- [X] T006 [P] Create README.md with project overview and quickstart link

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No content generation can begin until this phase is complete

### Docusaurus Setup

- [X] T007 Install Docusaurus 3.x with MDX plugin in textbook/ (npm install @docusaurus/core @docusaurus/preset-classic)
- [X] T008 [P] Configure docusaurus.config.js with site metadata, theme, and plugins (Mermaid, Algolia DocSearch placeholder)
- [X] T009 [P] Create sidebar.js defining 5 modules with chapter placeholders
- [X] T010 [P] Create custom CSS theme in textbook/src/css/custom.css (colors, fonts, layout)
- [X] T011 [P] Create landing page in textbook/src/pages/index.js (textbook intro, module overview, start learning CTA)

### FastAPI Backend Setup

- [ ] T012 Install FastAPI and dependencies in backend/ (pip install fastapi uvicorn lang chain qdrant-client openai sqlalchemy psychopg2-binary alembic)
- [X] T013 [P] Create FastAPI app structure in backend/src/main.py (CORS middleware, health endpoint)
- [X] T014 [P] Create Pydantic models for API requests/responses in backend/src/models/ (query.py, user.py)
- [ ] T015 [P] Set up Alembic for database migrations in backend/migrations/ (alembic init)
- [ ] T016 [P] Create initial database schema for user_profiles and user_queries tables (backend/migrations/versions/001_initial_schema.py)

### Content Generation Infrastructure

- [X] T017 Create 8-section chapter template in scripts/content-generation/templates/chapter-template.md (objectives, prerequisites, concepts, tutorial, worked example, exercises, troubleshooting, references)
- [X] T018 [P] Implement readability checker in scripts/content-generation/check_readability.py (uses textstat library, validates Flesch-Kincaid 10-14)
- [X] T019 [P] Implement citation validator in scripts/content-generation/validate_citations.py (checks APA format, source date <5 years, 50%+ official sources, URL accessibility)
- [ ] T020 [P] Implement plagiarism checker wrapper in scripts/content-generation/check_plagiarism.py (integrates GPTZero API or local detection)
- [ ] T021 [P] Create chapter generation script in scripts/content-generation/generate_chapter.py (uses Claude API, fills template, runs validation)

### CI/CD Setup

- [ ] T022 Create GitHub Actions workflow in .github/workflows/docusaurus-deploy.yml (build Docusaurus, deploy to GitHub Pages on main branch push)
- [ ] T023 [P] Create GitHub Actions workflow in .github/workflows/content-validation.yml (run readability, citation, plagiarism checks on PR)
- [ ] T024 [P] Create GitHub Actions workflow in .github/workflows/backend-tests.yml (run pytest for backend APIs)

**Checkpoint**: Foundation ready - content generation can now begin in parallel

---

## Phase 3: User Story 1 - Module 1 (ROS 2 Fundamentals) 🎯 MVP

**Goal**: Learners can complete Module 1 (4 chapters) and run all ROS 2 code examples

**Independent Test**: Learner installs ROS 2 Humble, runs talker-listener example, creates functional ROS 2 package, loads humanoid URDF in RViz

### Content Generation for Module 1

- [ ] T025 [P] [US1] Generate Chapter 1.1 in textbook/docs/module-1-ros2/1.1-nodes-topics-services.md (Introduction to ROS 2 Nodes, Topics, and Services)
- [ ] T026 [P] [US1] Generate Chapter 1.2 in textbook/docs/module-1-ros2/1.2-python-ros-bridge.md (Bridging Python Agents to ROS Controllers)
- [ ] T027 [P] [US1] Generate Chapter 1.3 in textbook/docs/module-1-ros2/1.3-urdf-humanoids.md (Understanding URDF for Humanoid Robots)
- [ ] T028 [P] [US1] Generate Chapter 1.4 in textbook/docs/module-1-ros2/1.4-hands-on-controller.md (Hands-On: Building a Simple ROS 2 Humanoid Controller)

### Code Examples for Module 1

- [ ] T029 [P] [US1] Create talker-listener example in code-examples/module-1-ros2/talker_listener/ (src/talker.py, src/listener.py, tests/test_talker.py, README.md)
- [ ] T030 [P] [US1] Create Python-ROS bridge example in code-examples/module-1-ros2/python_agent_bridge/ (agent.py, ros_controller.py, integration test)
- [ ] T031 [P] [US1] Create humanoid URDF in code-examples/module-1-ros2/humanoid_urdf/ (robot.urdf, launch file for RViz, README.md)
- [ ] T032 [P] [US1] Create simple controller package in code-examples/module-1-ros2/simple_controller/ (arm_controller.py, package.xml, setup.py)

### Validation for Module 1

- [ ] T033 [US1] Run readability validation on all Module 1 chapters (scripts/content-generation/check_readability.py)
- [ ] T034 [US1] Run citation validation on all Module 1 chapters (scripts/content-generation/validate_citations.py)
- [ ] T035 [US1] Run plagiarism check on all Module 1 chapters (scripts/content-generation/check_plagiarism.py, target <5%)
- [ ] T036 [US1] Test all Module 1 code examples (pytest code-examples/module-1-ros2/*/tests/)
- [ ] T037 [US1] Manual review: Verify ROS 2 installation instructions work on Ubuntu 22.04, test talker-listener output

**Checkpoint**: Module 1 complete and testable independently (MVP achieved - learners can complete ROS 2 fundamentals)

---

## Phase 4: User Story 2 - Module 2 (Digital Twin: Gazebo & Unity)

**Goal**: Learners can build digital twins with Gazebo physics and Unity rendering

**Independent Test**: Student launches Gazebo world with robot, imports URDF to Unity, simulates sensors (LiDAR, cameras, IMU), builds custom environment

### Content Generation for Module 2

- [ ] T038 [P] [US2] Generate Chapter 2.1 in textbook/docs/module-2-digital-twin/2.1-gazebo-physics.md (Simulating Physics, Gravity, and Collisions in Gazebo)
- [ ] T039 [P] [US2] Generate Chapter 2.2 in textbook/docs/module-2-digital-twin/2.2-unity-rendering.md (High-Fidelity Rendering and Human-Robot Interaction in Unity)
- [ ] T040 [P] [US2] Generate Chapter 2.3 in textbook/docs/module-2-digital-twin/2.3-sensor-simulation.md (Simulating Sensors: LiDAR, Depth Cameras, and IMUs)
- [ ] T041 [P] [US2] Generate Chapter 2.4 in textbook/docs/module-2-digital-twin/2.4-environment-building.md (Hands-On: Creating a Custom Simulated Environment)

### Code Examples for Module 2

- [ ] T042 [P] [US2] Create Gazebo world files in code-examples/module-2-digital-twin/gazebo_worlds/ (humanoid.world, obstacle_course.world, launch files)
- [ ] T043 [P] [US2] Create Unity project skeleton in code-examples/module-2-digital-twin/unity_projects/ (URDF importer config, materials, lighting setup)
- [ ] T044 [P] [US2] Create sensor plugin examples in code-examples/module-2-digital-twin/sensor_plugins/ (LiDAR plugin, depth camera plugin, IMU plugin, ROS 2 topic publishers)
- [ ] T045 [P] [US2] Create custom environment template in code-examples/module-2-digital-twin/custom_environment/ (apartment.world with furniture, Gazebo and Unity versions)

### Validation for Module 2

- [ ] T046 [US2] Run readability validation on all Module 2 chapters
- [ ] T047 [US2] Run citation validation on all Module 2 chapters
- [ ] T048 [US2] Run plagiarism check on all Module 2 chapters
- [ ] T049 [US2] Test Gazebo worlds launch correctly (gazebo humanoid.world)
- [ ] T050 [US2] Manual review: Verify Unity project imports URDF, sensors publish to ROS 2 topics

**Checkpoint**: Module 2 complete and testable independently (learners can build digital twins)

---

## Phase 5: User Story 3 - Module 3 (NVIDIA Isaac)

**Goal**: Learners can generate synthetic data, deploy Isaac ROS perception, configure Nav2 for bipedal navigation

**Independent Test**: Generate 10,000+ labeled images in Isaac Sim, run hardware-accelerated VSLAM, configure Nav2 for bipedal path planning

### Content Generation for Module 3

- [ ] T051 [P] [US3] Generate Chapter 3.1 in textbook/docs/module-3-isaac/3.1-isaac-sim-overview.md (NVIDIA Isaac Sim: Photorealistic Simulation and Synthetic Data Generation)
- [ ] T052 [P] [US3] Generate Chapter 3.2 in textbook/docs/module-3-isaac/3.2-synthetic-data.md (Synthetic Data Generation for Training)
- [ ] T053 [P] [US3] Generate Chapter 3.3 in textbook/docs/module-3-isaac/3.3-isaac-ros-perception.md (Isaac ROS: Hardware-Accelerated VSLAM and Navigation)
- [ ] T054 [P] [US3] Generate Chapter 3.4 in textbook/docs/module-3-isaac/3.4-nav2-planning.md (Nav2: Path Planning for Bipedal Humanoid Movement)

### Code Examples for Module 3

- [ ] T055 [P] [US3] Create Isaac Sim scene in code-examples/module-3-isaac/isaac_sim_scenes/ (warehouse.usd, domain randomization script, synthetic data export)
- [ ] T056 [P] [US3] Create synthetic data scripts in code-examples/module-3-isaac/synthetic_data_scripts/ (generate_dataset.py, labeling script, train-test split)
- [ ] T057 [P] [US3] Create Isaac ROS config in code-examples/module-3-isaac/isaac_ros_configs/ (cuVSLAM launch file, RViz config, camera setup)
- [ ] T058 [P] [US3] Create Nav2 config for bipedal in code-examples/module-3-isaac/nav2_bipedal_config/ (nav2_params.yaml with CoM constraints, costmap configs)

### Validation for Module 3

- [ ] T059 [US3] Run readability validation on all Module 3 chapters
- [ ] T060 [US3] Run citation validation on all Module 3 chapters
- [ ] T061 [US3] Run plagiarism check on all Module 3 chapters
- [ ] T062 [US3] Test Isaac Sim scene loads and generates 100 sample images (verify labels)
- [ ] T063 [US3] Manual review: Verify Isaac ROS cuVSLAM runs at >30 FPS, Nav2 generates bipedal path

**Checkpoint**: Module 3 complete and testable independently (learners can use NVIDIA Isaac for perception and planning)

---

## Phase 6: User Story 4 - Module 4 (Vision-Language-Action)

**Goal**: Learners can integrate voice commands (Whisper), LLM planning, and ROS 2 action execution

**Independent Test**: Deploy voice interface, LLM generates ROS 2 action sequences, robot executes multi-step tasks from voice commands

### Content Generation for Module 4

- [ ] T064 [P] [US4] Generate Chapter 4.1 in textbook/docs/module-4-vla/4.1-whisper-voice.md (Voice-to-Action: Using OpenAI Whisper for Voice Commands)
- [ ] T065 [P] [US4] Generate Chapter 4.2 in textbook/docs/module-4-vla/4.2-llm-planning.md (Cognitive Planning: Using LLMs to Translate Natural Language to ROS 2 Actions)
- [ ] T066 [P] [US4] Generate Chapter 4.3 in textbook/docs/module-4-vla/4.3-vla-integration.md (Hands-On: Integrating VLA in a Simple Robotic Task)

### Code Examples for Module 4

- [ ] T067 [P] [US4] Create Whisper integration in code-examples/module-4-vla/whisper_integration/ (voice_listener.py, transcription service, ROS 2 publisher)
- [ ] T068 [P] [US4] Create LLM planner in code-examples/module-4-vla/llm_planner/ (langchain_planner.py, action sequence generator, prompt templates)
- [ ] T069 [P] [US4] Create VLA pipeline in code-examples/module-4-vla/vla_pipeline/ (vla_node.py integrating voice + LLM + action execution, error handling, clarification loop)

### Validation for Module 4

- [ ] T070 [US4] Run readability validation on all Module 4 chapters
- [ ] T071 [US4] Run citation validation on all Module 4 chapters
- [ ] T072 [US4] Run plagiarism check on all Module 4 chapters
- [ ] T073 [US4] Test Whisper transcribes "go to the kitchen" with >90% accuracy
- [ ] T074 [US4] Test LLM planner generates valid action sequence for "clean the room"
- [ ] T075 [US4] Manual review: Verify VLA pipeline executes multi-step task end-to-end

**Checkpoint**: Module 4 complete and testable independently (learners can build VLA pipelines)

---

## Phase 7: User Story 5 - Module 5 (Capstone Project)

**Goal**: Learners integrate all modules into autonomous humanoid simulation

**Independent Test**: Student launches full simulation, issues voice command, robot autonomously navigates, detects objects, executes multi-step task

### Content Generation for Module 5

- [ ] T076 [P] [US5] Generate Chapter 5.1 in textbook/docs/module-5-capstone/5.1-project-setup.md (Project Setup and Digital Twin of a Real Humanoid)
- [ ] T077 [P] [US5] Generate Chapter 5.2 in textbook/docs/module-5-capstone/5.2-perception-action-pipeline.md (Building the Full VLA Perception-to-Action Pipeline)
- [ ] T078 [P] [US5] Generate Chapter 5.3 in textbook/docs/module-5-capstone/5.3-sim2real-transfer.md (From Simulation to Reality: Sim2Real Transfer)
- [ ] T079 [P] [US5] Generate Chapter 5.4 in textbook/docs/module-5-capstone/5.4-bonus-challenges.md (Competition-Ready Extensions: Bonus for Advanced Students)

### Code Examples for Module 5

- [ ] T080 [P] [US5] Create capstone template in code-examples/module-5-capstone/capstone_template/ (integrated launch files, config files, README with project structure)
- [ ] T081 [P] [US5] Create example solution in code-examples/module-5-capstone/example_solutions/ (set_the_table demo, full pipeline with voice + perception + navigation + manipulation)

### Validation for Module 5

- [ ] T082 [US5] Run readability validation on all Module 5 chapters
- [ ] T083 [US5] Run citation validation on all Module 5 chapters
- [ ] T084 [US5] Run plagiarism check on all Module 5 chapters
- [ ] T085 [US5] Test capstone template launches successfully (all nodes start, simulation spawns)
- [ ] T086 [US5] Manual review: Verify example solution completes "set the table" task end-to-end

**Checkpoint**: Module 5 complete and testable independently (learners can build full autonomous humanoid systems)

---

## Phase 8: RAG Chatbot Integration (Cross-Cutting Feature)

**Purpose**: Integrate RAG chatbot for context-aware Q&A on all textbook pages

### Backend Implementation

- [ ] T087 [P] Implement RAG service in backend/src/services/rag_service.py (LangChain RecursiveCharacterTextSplitter, VectorStoreRetriever, RetrievalQA chain)
- [ ] T088 [P] Implement embedding service in backend/src/services/embedding_service.py (OpenAI text-embedding-3-small client, batch embedding generation)
- [ ] T089 [P] Implement LLM service in backend/src/services/llm_service.py (OpenAI GPT-4-turbo client, answer synthesis with context)
- [ ] T090 [P] Implement chatbot API in backend/src/api/chatbot.py (POST /api/chatbot/query endpoint, request validation, response formatting)
- [ ] T091 [P] Implement user profile API in backend/src/api/user_profile.py (POST /api/user/profile, PUT /api/user/progress endpoints)
- [ ] T092 [P] Implement content API in backend/src/api/content.py (GET /api/content/chapters endpoint with metadata)

### Data Processing

- [ ] T093 Create embedding generation script in scripts/data-processing/embed_chapters.py (chunk all chapter Markdown, generate embeddings, upload to Qdrant)
- [ ] T094 [P] Create database seeding script in scripts/deployment/seed_database.py (populate modules, chapters tables with metadata from Markdown frontmatter)
- [ ] T095 Run embed_chapters.py to populate Qdrant with all 18 chapter embeddings (verify 200+ chunks created)

### Frontend Integration

- [ ] T096 [P] Create ChatbotWidget React component in textbook/src/components/ChatbotWidget.tsx (query input, loading state, answer display with sources)
- [ ] T097 [P] Integrate ChatbotWidget into Docusaurus theme in textbook/src/theme/Root.tsx (floating widget on all pages, user-selected text context)
- [ ] T098 [P] Style ChatbotWidget in textbook/src/css/chatbot.css (responsive design, mobile-friendly, accessibility)

### Testing

- [ ] T099 Test RAG query locally: curl POST /api/chatbot/query with "What is a ROS 2 node?" (verify answer references Chapter 1.1, response time <3s)
- [ ] T100 Test user profile creation: curl POST /api/user/profile with background questionnaire (verify user ID returned, stored in Postgres)
- [ ] T101 Test chatbot widget on localhost:3000 (ask question, verify answer appears with sources, test user-selected text context)

**Checkpoint**: RAG chatbot functional and embedded on all textbook pages

---

## Phase 9: Deployment & QA (Cross-Cutting Feature)

**Purpose**: Deploy textbook to GitHub Pages and backend to Render, validate quality gates

### Deployment

- [ ] T102 Configure GitHub Pages deployment in textbook/package.json (add deploy script: gh-pages -d build)
- [ ] T103 [P] Connect Render to GitHub repo, configure service (root directory: backend/, build command: pip install -r requirements.txt, start command: uvicorn src.main:app --host 0.0.0.0 --port $PORT)
- [ ] T104 [P] Set environment variables in Render dashboard (OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY, NEON_DATABASE_URL)
- [ ] T105 Deploy textbook to GitHub Pages (npm run deploy from textbook/, verify live at https://username.github.io/robotics-textbook/)
- [ ] T106 Deploy backend to Render (git push main, verify live at https://robotics-textbook-api.onrender.com)

### Quality Assurance

- [ ] T107 Run Lighthouse CI on deployed site (target: performance ≥90, accessibility WCAG 2.1 AA, SEO ≥90)
- [ ] T108 [P] Test all 18 chapters load correctly (click through each chapter, verify content renders, no 404s)
- [ ] T109 [P] Test all code examples downloadable (verify GitHub repo links work, README files present)
- [ ] T110 [P] Test chatbot on live site (ask 5 sample questions, verify responses within 3 seconds, sources accurate)
- [ ] T111 Run plagiarism scan on all chapters (GPTZero or Turnitin, target <5% similarity, verify zero violations)
- [ ] T112 Cross-browser testing (Chrome, Firefox, Safari latest versions, verify layout and chatbot work)
- [ ] T113 Mobile responsive testing (iOS Safari, Android Chrome, verify chatbot widget usable on mobile)

### Bug Fixes

- [ ] T114 Fix any broken links found in Lighthouse/manual testing
- [ ] T115 Fix any accessibility issues (missing alt text, low contrast, keyboard navigation)
- [ ] T116 Fix any chatbot errors (CORS issues, API timeouts, incorrect sources)

**Checkpoint**: Textbook and RAG chatbot deployed, all quality gates passed (BASE DELIVERABLE COMPLETE = 100 points)

---

## Phase 10: Bonus Feature 1 - Claude Subagents (Optional, +50 points)

**Purpose**: Refactor content generation scripts into reusable Claude Agent SDK subagents

- [ ] T117 [P] Install Claude Agent SDK in scripts/ (pip install anthropic-agent-sdk)
- [ ] T118 [P] Refactor generate_chapter.py into Claude subagent in bonus/claude-subagents/content_generator_agent.py (define agent config, input/output schema)
- [ ] T119 [P] Refactor validate_citations.py into Claude subagent in bonus/claude-subagents/citation_validator_agent.py
- [ ] T120 [P] Create agent orchestrator in bonus/claude-subagents/orchestrator.py (manages multiple agents, parallel execution)
- [ ] T121 Document subagent usage in bonus/claude-subagents/README.md (installation, API, example workflows)
- [ ] T122 Test subagent: Run content_generator_agent.py to generate a test chapter (verify follows template, passes validation)
- [ ] T123 Package subagents as npm module bonus/claude-subagents/package.json (for reuse in other projects)

**Checkpoint**: Claude subagents functional and documented (+50 points if complete)

---

## Phase 11: Bonus Feature 2 - Better-Auth (Optional, +50 points)

**Purpose**: Add authentication with user signup/signin flow and background questionnaire

- [ ] T124 [P] Install Better-Auth in textbook/ (npm install better-auth)
- [ ] T125 [P] Configure Better-Auth in bonus/better-auth/auth_config.ts (Neon Postgres connection, session management)
- [ ] T126 [P] Create signup component in bonus/better-auth/SignupForm.tsx (email input, password, background questionnaire: prior ROS experience, robotics level, programming languages)
- [ ] T127 [P] Create signin component in bonus/better-auth/SigninForm.tsx (email, password, redirect to textbook)
- [ ] T128 [P] Integrate Better-Auth into Docusaurus navbar in textbook/src/theme/Navbar.tsx (Signup/Signin buttons, user profile dropdown)
- [ ] T129 Update user profile API to use Better-Auth tokens in backend/src/api/user_profile.py (verify JWT tokens, link to UserProfile entity)
- [ ] T130 Test signup flow: Create account with background questionnaire (verify user stored in Postgres, token issued)
- [ ] T131 Test signin flow: Login with credentials (verify session persists, user profile accessible)

**Checkpoint**: Better-Auth functional with background questionnaire (+50 points if complete)

---

## Phase 12: Bonus Feature 3 - Personalization (Optional, +50 points)

**Purpose**: Adapt chapter content based on user background profile

- [ ] T132 [P] Implement personalization engine in bonus/personalization/personalization_engine.py (analyzes user background, generates content variants: skip ROS basics for experienced users, add Python refresher for beginners)
- [ ] T133 [P] Create adaptive content component in bonus/personalization/AdaptiveContent.tsx ("Personalize This Chapter" button, displays adapted content in modal)
- [ ] T134 [P] Integrate personalization into chapters in textbook/src/theme/DocItem.tsx (add personalization button to chapter header)
- [ ] T135 Update content API to return personalized metadata in backend/src/api/content.py (GET /api/content/chapters?user_id=X returns adapted prerequisites, difficulty)
- [ ] T136 Test personalization: Create beginner profile, click "Personalize Chapter 1.1" (verify Python refresher added)
- [ ] T137 Test personalization: Create advanced profile, click "Personalize Chapter 1.1" (verify ROS basics skipped)

**Checkpoint**: Personalization functional (+50 points if complete)

---

## Phase 13: Bonus Feature 4 - Urdu Translation (Optional, +50 points)

**Purpose**: Add one-click Urdu translation with RTL text support

- [ ] T138 [P] Configure i18next for Docusaurus in bonus/translation/i18n_config.js (enable Urdu locale, RTL support)
- [ ] T139 [P] Translate all chapter content to Urdu in bonus/translation/translation_files/ur.json (use GPT-4 with APA citation preservation, manual review for accuracy)
- [ ] T140 [P] Create translation toggle button in textbook/src/components/TranslationButton.tsx (switch between English and Urdu, persist preference in localStorage)
- [ ] T141 [P] Integrate TranslationButton into Docusaurus navbar in textbook/src/theme/Navbar.tsx
- [ ] T142 Test Urdu translation: Click translation button, verify all content switches to Urdu, RTL text renders correctly
- [ ] T143 Test translation persistence: Reload page after switching to Urdu (verify preference persists)

**Checkpoint**: Urdu translation functional with RTL support (+50 points if complete)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all modules
- **Modules 1-5 (Phases 3-7)**: All depend on Foundational phase completion
  - Modules can proceed in parallel (if using Claude subagents for concurrent generation)
  - Or sequentially in priority order (Module 1 → Module 2 → Module 3 → Module 4 → Module 5)
- **RAG Integration (Phase 8)**: Depends on at least Module 1 completion (needs content to embed)
- **Deployment (Phase 9)**: Depends on all desired modules + RAG integration
- **Bonuses (Phases 10-13)**: Depend on base deliverable deployment (Phase 9)

### Module Dependencies

- **Module 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other modules
- **Module 2 (P2)**: Can start after Foundational - Builds on Module 1 concepts but independently testable
- **Module 3 (P3)**: Can start after Foundational - Requires Module 1-2 knowledge but independently testable
- **Module 4 (P4)**: Can start after Foundational - Integrates all modules but independently testable
- **Module 5 (P5)**: Depends on Modules 1-4 completion (capstone integrates all prior modules)

### Within Each Module

- Content Generation tasks (T025-T028, etc.) can run in parallel using Claude subagents
- Code Examples tasks (T029-T032, etc.) can run in parallel (different directories, no dependencies)
- Validation tasks (T033-T037, etc.) must run sequentially after all content + code complete

### Parallel Opportunities

#### Foundation Phase (Phase 2)
```bash
# These can run in parallel (different files/systems):
- T008-T011 (Docusaurus config, sidebar, CSS, landing page)
- T014-T016 (FastAPI models, Alembic, database schema)
- T018-T021 (Validation scripts: readability, citations, plagiarism, generation)
```

#### Module 1 (Phase 3)
```bash
# Generate all 4 chapters concurrently:
Task T025: Chapter 1.1 (Claude subagent 1)
Task T026: Chapter 1.2 (Claude subagent 2)
Task T027: Chapter 1.3 (Claude subagent 3)
Task T028: Chapter 1.4 (Claude subagent 4)

# Create all 4 code examples concurrently:
Task T029: talker_listener example
Task T030: python_agent_bridge example
Task T031: humanoid_urdf example
Task T032: simple_controller example
```

#### RAG Backend (Phase 8)
```bash
# Build all services in parallel:
Task T087: RAG service
Task T088: Embedding service
Task T089: LLM service
Task T090-T092: API endpoints (chatbot, user profile, content)
Task T096-T098: Frontend components (ChatbotWidget, integration, styling)
```

---

## Implementation Strategy

### MVP First (Module 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all modules)
3. Complete Phase 3: Module 1 (ROS 2 Fundamentals)
4. **STOP and VALIDATE**: Test Module 1 independently (run code examples, verify readability/citations/plagiarism)
5. Minimal RAG: Complete Phase 8 tasks T087-T095, T099-T101 (backend + embeddings for Module 1 only)
6. Minimal Deployment: Complete Phase 9 tasks T102-T106 (deploy Module 1 + basic RAG)
7. **MVP ACHIEVED**: Learners can complete Module 1 with RAG chatbot (~60 points)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add Module 1 → Test independently → Deploy (MVP!)
3. Add Module 2 → Test independently → Redeploy
4. Add Module 3 → Test independently → Redeploy
5. Add Module 4 → Test independently → Redeploy
6. Add Module 5 → Test independently → Redeploy (BASE COMPLETE = 100 points)
7. Add Bonus Features (Phases 10-13) → Up to +200 points

### Parallel Team Strategy

With multiple developers or using Claude subagents:

1. Team completes Setup + Foundational together (Days 1-2)
2. Once Foundational is done (Day 2):
   - Subagent 1: Module 1 content generation (T025-T028)
   - Subagent 2: Module 2 content generation (T038-T041)
   - Subagent 3: Module 3 content generation (T051-T054)
   - Subagent 4: Module 4 content generation (T064-T066)
   - Subagent 5: Module 5 content generation (T076-T079)
   - Developer A: RAG backend (T087-T092)
   - Developer B: Frontend integration (T096-T098)
3. Content complete in ~1 day (concurrent generation)
4. Validation + Deployment (Days 3-4)
5. Bonus features (Days 5-7, optional)

**Total Timeline**: 4-7 days with parallel execution vs. 10-14 days sequential

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] labels** = US1 (Module 1), US2 (Module 2), US3 (Module 3), US4 (Module 4), US5 (Module 5)
- Each module independently completable and testable (learners can stop after any module)
- Verify content validation passes (readability, citations, plagiarism) before moving to next module
- Commit after each module completion or logical group
- Stop at any checkpoint to validate module independently
- **Base Deliverable** = Phases 1-9 complete (100 points)
- **Bonus Features** = Phases 10-13 (up to +200 points)
- Avoid: vague tasks, missing file paths, cross-module dependencies that break independence

---

## Total Task Summary

- **Total Tasks**: 143
- **Setup Tasks**: 6 (T001-T006)
- **Foundational Tasks**: 18 (T007-T024)
- **Module 1 Tasks**: 13 (T025-T037)
- **Module 2 Tasks**: 13 (T038-T050)
- **Module 3 Tasks**: 13 (T051-T063)
- **Module 4 Tasks**: 12 (T064-T075)
- **Module 5 Tasks**: 11 (T076-T086)
- **RAG Integration Tasks**: 15 (T087-T101)
- **Deployment & QA Tasks**: 15 (T102-T116)
- **Bonus 1 (Claude Subagents)**: 7 (T117-T123)
- **Bonus 2 (Better-Auth)**: 8 (T124-T131)
- **Bonus 3 (Personalization)**: 6 (T132-T137)
- **Bonus 4 (Urdu Translation)**: 6 (T138-T143)

**MVP Scope (Module 1 only)**: ~50 tasks (T001-T037, select RAG/Deployment tasks)
**Base Deliverable (All Modules + RAG)**: ~116 tasks (T001-T116)
**Full Implementation (Base + All Bonuses)**: 143 tasks
