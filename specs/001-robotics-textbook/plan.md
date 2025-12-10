# Implementation Plan: Physical AI & Humanoid Robotics Textbook

**Branch**: `001-robotics-textbook` | **Date**: 2025-12-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-robotics-textbook/spec.md`

**Note**: This plan follows the Spec-Driven Development approach with AI-assisted concurrent content generation and integration.

## Summary

Build an interactive Physical AI & Humanoid Robotics textbook covering ROS 2, Gazebo, Unity, NVIDIA Isaac, and Vision-Language-Action (VLA) integration. The textbook consists of 5 modules (18 chapters total) delivered as a Docusaurus static site with embedded RAG chatbot for context-aware Q&A. Content generation uses Claude Code subagents to concurrently create chapters while integrating AI-native features (chatbot, personalization, translation) incrementally. Base deliverables (textbook + RAG chatbot = 100 points) prioritized before bonus features (Claude Subagents, Better-Auth, Personalization, Urdu Translation = up to +200 points).

**Technical Approach**:
- **Content Generation**: AI/Spec-driven concurrent approach using Claude Code subagents and Spec-Kit Plus templates
- **Platform**: Docusaurus 3.x for static site generation, deployed to GitHub Pages via CI/CD
- **RAG Stack**: FastAPI backend + Qdrant vector DB + Neon Serverless Postgres + OpenAI Agents SDK
- **Quality**: APA citations (50%+ from official docs), Flesch-Kincaid grade 10-14, <5% plagiarism, reproducibility validation
- **Phases**: Planning → Content Generation → AI Integrations → Deployment → Bonus Features & Optimization

## Technical Context

**Language/Version**: Python 3.11+ (content generation scripts, RAG backend), JavaScript/TypeScript (Docusaurus frontend), Markdown (chapter content)

**Primary Dependencies**:
- **Content Platform**: Docusaurus 3.x, Node.js 18+, React 18, MDX
- **RAG Backend**: FastAPI 0.104+, Uvicorn, LangChain 0.1+, OpenAI Python SDK 1.x
- **Databases**: Qdrant Cloud Free Tier (vector store), Neon Serverless Postgres (user data, query logs)
- **AI Services**: OpenAI API (embeddings: text-embedding-3-small, chat: gpt-4-turbo), Claude API (content generation via Claude Code)
- **Content Tools**: Mermaid.js (diagrams), Prism (syntax highlighting), Algolia DocSearch (search)
- **Bonus Features**: Claude Agent SDK (reusable subagents), Better-Auth 1.x (authentication), i18next (Urdu translation)

**Storage**:
- **Content**: Git repository (Markdown chapters, code examples, URDF files, world files)
- **Vector Database**: Qdrant Cloud (chapter embeddings for RAG retrieval)
- **Relational Database**: Neon Postgres (user profiles, query history, personalization data)
- **Static Assets**: GitHub Pages (deployed Docusaurus build), GitHub Releases (downloadable code packages)

**Testing**:
- **Content Validation**: Markdown linters (markdownlint), link checkers (broken-link-checker), readability analysis (textstat for Flesch-Kincaid), plagiarism detection (manual GPTZero scans)
- **Code Examples**: pytest for Python validation scripts, colcon test for ROS 2 packages (CI simulation)
- **RAG System**: pytest for FastAPI endpoints, integration tests for Qdrant queries, E2E tests for chatbot UI
- **Site Build**: Docusaurus build validation, Lighthouse CI (performance ≥90, accessibility WCAG 2.1 AA)

**Target Platform**: Web (Docusaurus static site on GitHub Pages), tested on Chrome/Firefox/Safari latest versions, mobile-responsive design

**Project Type**: Web application (Docusaurus frontend + FastAPI backend + vector/relational databases)

**Performance Goals**:
- **Page Load**: <2 seconds on standard broadband (Lighthouse score ≥90)
- **RAG Query**: <3 seconds average response time for chatbot queries
- **Content Generation**: 1 chapter per hour using AI subagents (18 chapters in ~1 day with parallelization)
- **Site Build**: <5 minutes for full Docusaurus build and deployment

**Constraints**:
- **Hackathon Timeline**: Complete base deliverables (textbook + RAG) in 1-2 weeks; bonus features are optional
- **Citation Accuracy**: Minimum 50% from official sources (ROS 2, NVIDIA, Gazebo, Unity docs); all sources within past 5 years where applicable
- **Reproducibility**: All code examples must run on Ubuntu 22.04 LTS with NVIDIA GPU ≥ RTX 3060, 16GB RAM
- **Cost**: Free tier limits (Qdrant Cloud, Neon Postgres, GitHub Pages); OpenAI API usage <$50 total
- **Accessibility**: WCAG 2.1 AA compliance (alt text, semantic HTML, keyboard navigation)

**Scale/Scope**:
- **Content**: 5 modules, 18 chapters, ~50,000 words total, 100+ code examples, 50+ diagrams
- **Users**: Estimated 100-500 learners concurrently (GitHub Pages can handle; RAG backend scales with Neon autoscaling)
- **Code Repository**: ~10,000 LOC (content generation scripts + RAG backend + Docusaurus config)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Accuracy Through Verification
- [ ] All technical claims traceable to official documentation (ROS 2, Gazebo, Unity, Isaac Sim, Nav2, Whisper)
- [ ] Peer-reviewed sources for AI/ML concepts (VLA, synthetic data, Sim2Real transfer)
- [ ] Code examples verified against official GitHub repositories (ros2/examples, NVIDIA-AI-IOT/isaac_ros)
- [ ] Version-specific citations (ROS 2 Humble Hawksbill, Isaac Sim 2023.1.1, Unity 2022 LTS)

**Status**: ✅ PASS (with mitigation)
**Mitigation**: Content generation phase includes automated citation validation step; each chapter reviewed against official docs before merge.

### II. Clarity for Students
- [ ] Flesch-Kincaid grade 10-14 readability (measured via textstat library)
- [ ] Domain terminology defined on first use (glossary auto-generated from chapters)
- [ ] Conceptual → Practical progression in each chapter (8-section mandatory template)
- [ ] Visual aids: 50+ diagrams (Mermaid.js flowcharts, architecture diagrams), 100+ simulation screenshots
- [ ] Worked examples before exercises (each chapter has 1 worked example + 3 exercises)

**Status**: ✅ PASS
**Validation**: Automated readability checks in CI pipeline; manual review for terminology clarity.

### III. Reproducibility
- [ ] Complete environment specs: Ubuntu 22.04 LTS, Python 3.10+, ROS 2 Humble, NVIDIA CUDA 11.8+
- [ ] Step-by-step setup instructions with expected outputs (validated via test scripts)
- [ ] Docker/VM images for complex setups (Isaac Sim Dockerfile, ROS 2 + Gazebo containers)
- [ ] Test scripts validate correct installation (e.g., `test_ros2_setup.py`)
- [ ] Error troubleshooting guides for common failures (GPU driver issues, ROS 2 sourcing, Unity licensing)

**Status**: ✅ PASS
**Validation**: All code examples tested in CI with Ubuntu 22.04 Docker containers; GPU-dependent code flagged for manual validation.

### IV. Interactivity and AI-Nativeness
- [ ] Structured Markdown with semantic headers for RAG chunking
- [ ] Metadata frontmatter: difficulty levels (beginner/intermediate/advanced), prerequisites, learning objectives
- [ ] RAG chatbot embedded on all pages with user-selected text queries
- [ ] Personalization hooks: user background questionnaire, chapter adaptation based on profile
- [ ] Translation services: Urdu translation button with RTL text support (bonus feature)

**Status**: ✅ PASS
**Implementation**: Docusaurus MDX supports frontmatter metadata; RAG chatbot uses LangChain for document chunking; personalization via Neon Postgres user profiles.

### V. Comprehensive Coverage
- [ ] Module 1: ROS 2 fundamentals (4 chapters: Nodes/Topics/Services, Python-ROS bridging, URDF, hands-on controller)
- [ ] Module 2: Digital twins (4 chapters: Gazebo physics, Unity rendering, sensor simulation, environment building)
- [ ] Module 3: NVIDIA Isaac (4 chapters: Isaac Sim, synthetic data, Isaac ROS perception, Nav2 planning)
- [ ] Module 4: VLA integration (3 chapters: Whisper voice, LLM planning, ROS 2 action execution)
- [ ] Module 5: Capstone project (4 chapters: setup, perception-to-action pipeline, Sim2Real, bonus challenges)
- [ ] Sequential dependencies: Module N+1 requires Module N completion (enforced via prerequisite checks)

**Status**: ✅ PASS
**Validation**: All 18 chapters planned with detailed outlines; prerequisite chains documented in data-model.md.

### VI. Citation and Source Standards
- [ ] APA citation format with inline hyperlinks
- [ ] Minimum 50% from official docs (ros.org, docs.nvidia.com, docs.unity3d.com, gazebosim.org)
- [ ] No unmaintained blogs or deprecated tutorials (sources validated via publication date checks)
- [ ] Code attribution: BSD-3 for ROS 2 examples, Apache 2.0 for Isaac examples
- [ ] Version pinning: "ROS 2 Humble Hawksbill (2022)", "Isaac Sim 2023.1.1", "Unity 2022 LTS"

**Status**: ✅ PASS (with validation step)
**Validation**: Automated citation checker in CI; references.md file auto-generated from chapter citations.

## Project Structure

### Documentation (this feature)

```text
specs/001-robotics-textbook/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output: Technology decisions and best practices
├── data-model.md        # Phase 1 output: Content entities (Module, Chapter, CodeExample, etc.)
├── quickstart.md        # Phase 1 output: Developer onboarding for content contributors
├── contracts/           # Phase 1 output: RAG chatbot API contracts
│   ├── chatbot-api.openapi.yaml
│   ├── user-profile-api.openapi.yaml
│   └── content-api.openapi.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (Docusaurus frontend + FastAPI backend)

# Frontend: Docusaurus textbook site
textbook/
├── docs/                        # Markdown chapter content
│   ├── module-1-ros2/
│   │   ├── 1.1-nodes-topics-services.md
│   │   ├── 1.2-python-ros-bridge.md
│   │   ├── 1.3-urdf-humanoids.md
│   │   └── 1.4-hands-on-controller.md
│   ├── module-2-digital-twin/
│   │   ├── 2.1-gazebo-physics.md
│   │   ├── 2.2-unity-rendering.md
│   │   ├── 2.3-sensor-simulation.md
│   │   └── 2.4-environment-building.md
│   ├── module-3-isaac/
│   │   ├── 3.1-isaac-sim-overview.md
│   │   ├── 3.2-synthetic-data.md
│   │   ├── 3.3-isaac-ros-perception.md
│   │   └── 3.4-nav2-planning.md
│   ├── module-4-vla/
│   │   ├── 4.1-whisper-voice.md
│   │   ├── 4.2-llm-planning.md
│   │   └── 4.3-vla-integration.md
│   └── module-5-capstone/
│       ├── 5.1-project-setup.md
│       ├── 5.2-perception-action-pipeline.md
│       ├── 5.3-sim2real-transfer.md
│       └── 5.4-bonus-challenges.md
├── src/
│   ├── components/              # React components (ChatbotWidget, TranslationButton, etc.)
│   ├── css/                     # Custom styling
│   └── pages/                   # Landing page, about, etc.
├── static/
│   ├── img/                     # Diagrams, screenshots
│   └── downloads/               # Code packages, URDFs, world files
├── docusaurus.config.js
└── package.json

# Backend: RAG chatbot + user profile APIs
backend/
├── src/
│   ├── api/
│   │   ├── chatbot.py           # RAG query endpoints
│   │   ├── user_profile.py      # User background, preferences
│   │   └── content.py           # Chapter metadata, progress tracking
│   ├── services/
│   │   ├── rag_service.py       # LangChain + Qdrant retrieval
│   │   ├── embedding_service.py # OpenAI text-embedding-3-small
│   │   └── llm_service.py       # OpenAI GPT-4 for query answering
│   ├── models/
│   │   ├── user.py              # SQLAlchemy models for Neon Postgres
│   │   └── query.py
│   └── main.py                  # FastAPI app entrypoint
├── tests/
│   ├── test_chatbot_api.py
│   ├── test_rag_service.py
│   └── test_integration.py
├── requirements.txt
└── Dockerfile

# Scripts: Content generation and validation
scripts/
├── content-generation/
│   ├── generate_chapter.py      # AI-assisted chapter creation using Claude API
│   ├── validate_citations.py   # APA format checker + source date validation
│   └── check_readability.py    # Flesch-Kincaid grade measurement
├── data-processing/
│   ├── embed_chapters.py        # Generate embeddings and upload to Qdrant
│   └── build_index.py           # Create search index
└── deployment/
    ├── deploy_gh_pages.sh       # GitHub Actions deployment script
    └── seed_database.py         # Initialize Neon Postgres with schema

# Code examples (separate from textbook content for testing)
code-examples/
├── module-1-ros2/
│   ├── talker_listener/         # ROS 2 package examples
│   ├── python_agent_bridge/
│   ├── humanoid_urdf/
│   └── simple_controller/
├── module-2-digital-twin/
│   ├── gazebo_worlds/
│   ├── unity_projects/
│   └── sensor_plugins/
├── module-3-isaac/
│   ├── isaac_sim_scenes/
│   ├── synthetic_data_scripts/
│   └── isaac_ros_configs/
├── module-4-vla/
│   ├── whisper_integration/
│   ├── llm_planner/
│   └── vla_pipeline/
└── module-5-capstone/
    ├── capstone_template/
    └── example_solutions/

# Bonus features (optional, separate directories for modularity)
bonus/
├── claude-subagents/            # Reusable Claude Code subagents (+50 points)
│   ├── content_reviewer.py
│   └── citation_validator.py
├── better-auth/                 # Authentication with background questionnaire (+50 points)
│   ├── auth_config.ts
│   └── user_questionnaire_component.tsx
├── personalization/             # Chapter adaptation based on user profile (+50 points)
│   ├── personalization_engine.py
│   └── adaptive_content_component.tsx
└── translation/                 # Urdu translation with RTL support (+50 points)
    ├── i18n_config.js
    └── translation_files/
        └── ur.json
```

**Structure Decision**: Web application structure chosen due to Docusaurus frontend + FastAPI backend requirement. Frontend is static site (Docusaurus) served via GitHub Pages; backend is FastAPI service (deployed to Vercel/Render free tier or self-hosted) handling RAG queries and user profiles. Code examples separated from textbook content for independent testing and packaging. Bonus features modularized in separate directory for optional implementation.

## Complexity Tracking

> **No violations of constitutional principles.** All requirements align with established gates.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | N/A        | N/A                                 |

## Phase 0: Research & Technology Decisions

**Objective**: Resolve all technology choices, establish best practices, and create research.md documenting decisions.

### Research Tasks

1. **Content Generation Tooling**
   - **Decision**: Use Claude Code with Spec-Kit Plus templates for AI-assisted chapter generation
   - **Rationale**: Claude Code supports reusable subagents (bonus feature), Spec-Kit Plus provides structured spec templates
   - **Alternatives**: Manual writing (too slow for hackathon timeline), GPT-4 standalone (lacks subagent reusability)

2. **Docusaurus Configuration**
   - **Decision**: Docusaurus 3.x with MDX, Algolia DocSearch, Mermaid plugin, React components for chatbot widget
   - **Rationale**: MDX enables React components in Markdown (chatbot integration), Algolia DocSearch provides free site search
   - **Alternatives**: GitBook (proprietary limits), Nextra (less mature ecosystem), custom React site (too much overhead)

3. **RAG Chatbot Architecture**
   - **Decision**: LangChain + OpenAI embeddings (text-embedding-3-small) + Qdrant vector store + GPT-4-turbo for answers
   - **Rationale**: LangChain simplifies document chunking and retrieval, OpenAI embeddings high quality, Qdrant free tier sufficient
   - **Alternatives**: Pinecone (free tier too limited), Weaviate (more complex setup), local models (slower, less accurate)

4. **Citation Management**
   - **Decision**: BibTeX + Pandoc for APA citations, automated validation script checking source dates and URL accessibility
   - **Rationale**: BibTeX standard for academic citations, Pandoc converts to APA format, automated checks prevent outdated sources
   - **Alternatives**: Manual citation tracking (error-prone), Zotero (overkill for this project)

5. **Code Example Packaging**
   - **Decision**: Separate Git repository branches for code solutions, Docker containers for complex setups (Isaac Sim, ROS 2 + Gazebo)
   - **Rationale**: Keeps textbook repo clean, Docker ensures reproducibility across different student environments
   - **Alternatives**: Inline code in Markdown (too cluttered), external ZIP files (harder to version control)

6. **Deployment Strategy**
   - **Decision**: GitHub Actions CI/CD for Docusaurus build + deployment to GitHub Pages, backend deployed to Render free tier
   - **Rationale**: GitHub Pages free for public repos, Render free tier supports FastAPI with 512MB RAM (sufficient for RAG backend)
   - **Alternatives**: Vercel (free tier limits on API routes), Netlify (similar constraints), self-hosted (requires maintenance)

7. **Bonus Feature Prioritization**
   - **Decision**: Implement in order: Claude Subagents (reuse for content generation) → Better-Auth (enables personalization) → Personalization → Urdu Translation
   - **Rationale**: Claude Subagents provide immediate ROI for content generation, Better-Auth prerequisite for personalization, translation last (lowest complexity)
   - **Alternatives**: Implement all in parallel (risk of incomplete features), skip bonuses (miss up to +200 points)

**Output**: `research.md` documenting all 7 decisions with rationale and alternatives.

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete

### Data Model (`data-model.md`)

**Key Entities**:

1. **Module**
   - Fields: `id` (int), `title` (string), `description` (text), `prerequisites` (array of module IDs), `chapters` (array of Chapter IDs)
   - Relationships: Module 1:N Chapters
   - Validation: Sequential ordering (Module 2 cannot be accessed before Module 1 completion)
   - State: Draft | Published | Archived

2. **Chapter**
   - Fields: `id` (int), `module_id` (FK), `title` (string), `slug` (string), `content_path` (file path), `difficulty` (enum: beginner|intermediate|advanced), `learning_objectives` (array of strings), `prerequisites` (array of Chapter IDs), `estimated_time_minutes` (int)
   - Relationships: Chapter N:1 Module, Chapter 1:N CodeExamples, Chapter 1:N Exercises
   - Validation: Flesch-Kincaid grade 10-14, minimum 50% citations from official sources, mandatory 8 sections (objectives, prerequisites, concepts, tutorial, worked example, exercises, troubleshooting, references)
   - State: Draft | Review | Published

3. **CodeExample**
   - Fields: `id` (int), `chapter_id` (FK), `title` (string), `description` (text), `language` (enum: Python|C++|Bash), `code` (text), `repo_path` (string), `test_command` (string), `expected_output` (text)
   - Relationships: CodeExample N:1 Chapter
   - Validation: Must pass automated tests in CI, license attribution required (BSD-3 or Apache 2.0)
   - State: Draft | Tested | Published

4. **Exercise**
   - Fields: `id` (int), `chapter_id` (FK), `title` (string), `description` (text), `difficulty` (enum: basic|intermediate|challenge), `starter_code_path` (string), `solution_path` (string), `hints` (array of strings)
   - Relationships: Exercise N:1 Chapter
   - Validation: Starter code must compile/run, solution provided in separate branch
   - State: Draft | Published

5. **UserProfile**
   - Fields: `id` (UUID), `email` (string), `created_at` (timestamp), `background` (JSON: {prior_ros_experience, robotics_level, programming_languages}), `language_preference` (enum: en|ur), `completed_chapters` (array of Chapter IDs), `current_module` (FK to Module)
   - Relationships: UserProfile 1:N UserQueries
   - Validation: Email unique, background questionnaire required for personalization
   - State: Active | Inactive

6. **UserQuery**
   - Fields: `id` (UUID), `user_id` (FK), `query_text` (text), `selected_context` (text), `chapter_id` (FK), `response_text` (text), `response_sources` (array of strings), `created_at` (timestamp), `feedback` (enum: helpful|not_helpful|null)
   - Relationships: UserQuery N:1 UserProfile, UserQuery N:1 Chapter
   - Validation: Query text non-empty, response generated within 3 seconds
   - State: Answered | Pending | Failed

**Output**: `data-model.md` documenting all 6 entities with fields, relationships, validation rules, and state transitions.

### API Contracts (`contracts/`)

1. **Chatbot API** (`chatbot-api.openapi.yaml`)

```yaml
openapi: 3.0.3
info:
  title: RAG Chatbot API
  version: 1.0.0
paths:
  /api/chatbot/query:
    post:
      summary: Submit RAG query with optional user-selected context
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query: { type: string, minLength: 1 }
                selected_text: { type: string, nullable: true }
                chapter_id: { type: integer, nullable: true }
                user_id: { type: string, format: uuid, nullable: true }
              required: [query]
      responses:
        200:
          description: Query answered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  answer: { type: string }
                  sources: { type: array, items: { type: string } }
                  confidence: { type: number, minimum: 0, maximum: 1 }
                  response_time_ms: { type: integer }
        400:
          description: Invalid query (empty or too long >500 chars)
        500:
          description: RAG service error
```

2. **User Profile API** (`user-profile-api.openapi.yaml`)

```yaml
openapi: 3.0.3
info:
  title: User Profile API
  version: 1.0.0
paths:
  /api/user/profile:
    post:
      summary: Create user profile with background questionnaire
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string, format: email }
                background:
                  type: object
                  properties:
                    prior_ros_experience: { type: boolean }
                    robotics_level: { enum: [beginner, intermediate, advanced] }
                    programming_languages: { type: array, items: { type: string } }
                language_preference: { enum: [en, ur], default: en }
              required: [email, background]
      responses:
        201:
          description: Profile created
          content:
            application/json:
              schema:
                type: object
                properties:
                  user_id: { type: string, format: uuid }
                  token: { type: string }
        409:
          description: Email already exists

  /api/user/progress:
    put:
      summary: Update chapter completion progress
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                user_id: { type: string, format: uuid }
                chapter_id: { type: integer }
                completed: { type: boolean }
              required: [user_id, chapter_id, completed]
      responses:
        200:
          description: Progress updated
        404:
          description: User or chapter not found
```

3. **Content API** (`content-api.openapi.yaml`)

```yaml
openapi: 3.0.3
info:
  title: Content Metadata API
  version: 1.0.0
paths:
  /api/content/chapters:
    get:
      summary: List all chapters with metadata (for personalization)
      parameters:
        - name: user_id
          in: query
          schema: { type: string, format: uuid }
          required: false
      responses:
        200:
          description: Chapters list with completion status for authenticated users
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id: { type: integer }
                    module_id: { type: integer }
                    title: { type: string }
                    difficulty: { enum: [beginner, intermediate, advanced] }
                    estimated_time_minutes: { type: integer }
                    prerequisites_met: { type: boolean }
                    completed: { type: boolean, nullable: true }
```

**Output**: `contracts/chatbot-api.openapi.yaml`, `contracts/user-profile-api.openapi.yaml`, `contracts/content-api.openapi.yaml`

### Quickstart Guide (`quickstart.md`)

**Purpose**: Developer onboarding for content contributors (e.g., adding new chapters, validating code examples)

**Sections**:
1. **Setup Local Environment**
   - Install Node.js 18+, Python 3.11+, Docker
   - Clone repository, install dependencies (`npm install`, `pip install -r requirements.txt`)
   - Run Docusaurus dev server (`npm start`) → http://localhost:3000
   - Run FastAPI backend (`uvicorn backend.src.main:app --reload`) → http://localhost:8000

2. **Content Contribution Workflow**
   - Create new branch: `git checkout -b feature/module-X-chapter-Y`
   - Add chapter Markdown to `textbook/docs/module-X/`
   - Follow 8-section template (objectives, prerequisites, concepts, tutorial, worked example, exercises, troubleshooting, references)
   - Add code examples to `code-examples/module-X/`
   - Run validation: `python scripts/content-generation/validate_citations.py`, `python scripts/content-generation/check_readability.py`
   - Commit and push, open PR for review

3. **Testing Code Examples**
   - Navigate to `code-examples/module-X/example-name/`
   - Run test command from CodeExample entity: `pytest tests/` or `colcon test`
   - Verify expected output matches documented behavior
   - Update chapter Markdown with test results

4. **RAG Chatbot Local Testing**
   - Set environment variables: `OPENAI_API_KEY`, `QDRANT_URL`, `NEON_DATABASE_URL`
   - Run embedding generation: `python scripts/data-processing/embed_chapters.py`
   - Test query via API: `curl -X POST http://localhost:8000/api/chatbot/query -d '{"query": "What is a ROS 2 node?"}'`
   - Inspect response sources and confidence score

5. **Deployment**
   - Merge to `main` branch triggers GitHub Actions CI/CD
   - Docusaurus build: `npm run build` → deployed to GitHub Pages
   - Backend deployment: Push to Render triggers automatic deploy
   - Verify live site: https://username.github.io/robotics-textbook/

**Output**: `quickstart.md` with 5 sections and step-by-step instructions.

## Phase 2: Implementation Strategy

**Note**: This section provides high-level implementation guidance. Detailed tasks are generated by `/sp.tasks` command (not part of `/sp.plan`).

### Development Phases

1. **Phase A: Project Scaffolding (Days 1-2)**
   - Initialize Docusaurus project with MDX, Mermaid plugin, Algolia DocSearch
   - Set up FastAPI backend with Qdrant client, Neon Postgres connection, OpenAI SDK
   - Create CI/CD pipelines: GitHub Actions for Docusaurus build, Render deployment for backend
   - Establish content generation templates: 8-section chapter template, code example template, exercise template

2. **Phase B: Content Generation (Days 3-7)**
   - **Concurrent Approach**: Use Claude Code subagents to generate chapters in parallel
     - Subagent 1: Module 1 chapters (ROS 2 fundamentals)
     - Subagent 2: Module 2 chapters (Gazebo & Unity)
     - Subagent 3: Module 3 chapters (NVIDIA Isaac)
     - Subagent 4: Module 4 chapters (VLA)
     - Subagent 5: Module 5 chapters (Capstone)
   - Each subagent outputs chapter Markdown + code examples + citations
   - Validation pipeline: Readability check → Citation validation → Code testing → Manual review
   - Iterate on failed validations (e.g., Flesch-Kincaid grade too high, missing citations)

3. **Phase C: RAG Chatbot Integration (Days 6-8)**
   - Generate embeddings for all chapters using OpenAI text-embedding-3-small
   - Upload embeddings to Qdrant with metadata (chapter_id, module_id, difficulty)
   - Implement LangChain retrieval pipeline: User query → Embedding → Qdrant search → Top-K chunks → GPT-4 synthesis
   - Build React ChatbotWidget component for Docusaurus site
   - Integrate user-selected text feature: Highlight text → Right-click "Ask ChatBot" → Query with context
   - Test end-to-end: User asks "How do I create a ROS 2 node?" → Chatbot retrieves Chapter 1.1 content → Answers with citation

4. **Phase D: Deployment & QA (Days 9-10)**
   - Deploy Docusaurus site to GitHub Pages (https://username.github.io/robotics-textbook/)
   - Deploy FastAPI backend to Render free tier (https://robotics-textbook-api.onrender.com)
   - Run Lighthouse CI: Performance ≥90, Accessibility WCAG 2.1 AA, SEO ≥90
   - Manual QA: Test all 18 chapters load correctly, code examples downloadable, chatbot responds within 3 seconds
   - Plagiarism check: Run GPTZero on all chapters, ensure <5% similarity
   - Fix any deployment issues (broken links, missing images, API CORS errors)

5. **Phase E: Bonus Features (Days 11-14, optional)**
   - **Bonus 1: Claude Subagents** (+50 points)
     - Refactor content generation scripts into reusable Claude Agent SDK subagents
     - Document subagent usage: `claude-agent run content-reviewer --chapter-path docs/module-1/1.1.md`
     - Package as npm module for easy reuse in other projects
   - **Bonus 2: Better-Auth** (+50 points)
     - Integrate Better-Auth library for authentication
     - Build user signup/signin flow with background questionnaire (prior ROS experience, robotics level, programming languages)
     - Store user profiles in Neon Postgres
   - **Bonus 3: Personalization** (+50 points)
     - Build personalization engine: Analyze user background → Adapt chapter content (e.g., skip ROS basics for experienced users, add Python refresher for beginners)
     - Add "Personalize This Chapter" button to each chapter
     - Display adapted content in modal or inline replacement
   - **Bonus 4: Urdu Translation** (+50 points)
     - Configure i18next for Docusaurus
     - Translate all chapter content to Urdu (use GPT-4 with APA citation preservation)
     - Add translation toggle button in navbar
     - Test RTL text rendering, ensure proper Arabic script display

### Testing Strategy

1. **Content Validation**
   - **Readability**: Automated Flesch-Kincaid scoring via textstat library, fail if grade <10 or >14
   - **Citations**: Automated script checks APA format, source date <5 years, URL accessibility (HTTP 200)
   - **Plagiarism**: Manual GPTZero scans on all chapters, reject if similarity >5%

2. **Code Example Testing**
   - **Unit Tests**: pytest for Python scripts, colcon test for ROS 2 packages
   - **Integration Tests**: Docker containers simulate Ubuntu 22.04 environment, run all code examples, capture output
   - **Reproducibility**: Test scripts validate setup (e.g., ROS 2 sourced, Gazebo installed, URDF loaded)

3. **RAG Chatbot Testing**
   - **API Tests**: pytest for FastAPI endpoints (/api/chatbot/query, /api/user/profile, /api/content/chapters)
   - **Retrieval Quality**: Evaluate RAG responses using RAGAS metrics (context relevance, answer relevance, faithfulness)
   - **Response Time**: Load testing with Locust, ensure 95th percentile <3 seconds under 50 concurrent users

4. **Deployment Testing**
   - **Docusaurus Build**: CI pipeline runs `npm run build`, fails if broken links or missing assets
   - **Lighthouse CI**: Automated performance/accessibility/SEO audits, enforce thresholds (≥90 for all)
   - **Cross-Browser**: Manual testing on Chrome/Firefox/Safari latest versions
   - **Mobile Responsive**: Test on iOS Safari and Android Chrome, verify chatbot widget usability

## Architectural Decisions Requiring ADR

### Decision 1: Content Generation Strategy - AI-Assisted vs. Manual Writing

**Options**:
- **A**: Manual writing by subject matter experts (high quality, slow, expensive)
- **B**: AI-generated drafts with human review (fast, moderate quality, low cost)
- **C**: Hybrid: AI-generated outlines + human-written tutorials (balanced)

**Tradeoffs**:
| Factor | Manual (A) | AI Draft + Review (B) | Hybrid (C) |
|--------|------------|----------------------|------------|
| Speed | Slow (18 chapters in 3-4 weeks) | Fast (18 chapters in 3-5 days) | Moderate (18 chapters in 1-2 weeks) |
| Quality | Highest (expert knowledge) | Moderate (requires validation) | High (combines strengths) |
| Cost | High ($5,000-$10,000) | Low (<$100 OpenAI API) | Moderate ($500-$1,000) |
| Accuracy | Excellent | Good (with citation validation) | Excellent (human-verified) |
| Hackathon Fit | No (too slow) | Yes (meets timeline) | Yes (optimal balance) |

**Selected**: **Option B** (AI Draft + Review) for hackathon timeline; upgrade to Option C for production version.

**Rationale**: Hackathon requires 1-2 week delivery; AI drafts with automated validation (citations, readability) meet timeline while maintaining acceptable quality. Human review focuses on accuracy verification against official docs rather than writing from scratch.

### Decision 2: RAG Backend Deployment - Serverless vs. Server-Based

**Options**:
- **A**: AWS Lambda + API Gateway (serverless, pay-per-request)
- **B**: Render Free Tier (512MB RAM, always-on, limited to 750 hours/month)
- **C**: Vercel Serverless Functions (10-second timeout, cold starts)

**Tradeoffs**:
| Factor | AWS Lambda (A) | Render Free Tier (B) | Vercel Functions (C) |
|--------|----------------|---------------------|----------------------|
| Cost | $0-$5/month (free tier generous) | $0 (free tier) | $0 (free tier) |
| Cold Start | 1-3 seconds | None (always warm) | 2-5 seconds |
| Timeout | 15 minutes (configurable) | No limit | 10 seconds (Edge: 25s) |
| RAM | 128MB-10GB (configurable) | 512MB (fixed) | 1GB (Pro: 3GB) |
| Setup Complexity | High (IAM, API Gateway) | Low (Git push deploy) | Moderate (API routes) |
| Hackathon Fit | Moderate (complex setup) | Yes (simple, reliable) | Partial (timeout risk) |

**Selected**: **Option B** (Render Free Tier) for hackathon; migrate to AWS Lambda for production scale.

**Rationale**: Render free tier eliminates cold starts (better UX for chatbot), sufficient RAM for RAG pipeline (512MB handles LangChain + OpenAI SDK), simple deployment (Git push). Vercel 10-second timeout risky for LLM inference; AWS Lambda overkill for MVP.

### Decision 3: Citation Management - Manual vs. Automated Validation

**Options**:
- **A**: Manual citation tracking in spreadsheet, periodic audits
- **B**: BibTeX + Pandoc + automated validation script (checks APA format, source dates, URL accessibility)
- **C**: Reference management software (Zotero, Mendeley) + manual export

**Tradeoffs**:
| Factor | Manual (A) | Automated Script (B) | Zotero/Mendeley (C) |
|--------|------------|---------------------|---------------------|
| Accuracy | Low (human error) | High (automated checks) | Moderate (manual entry errors) |
| Speed | Slow (manual audit) | Fast (CI pipeline) | Moderate (export overhead) |
| APA Compliance | Manual formatting | Automatic (Pandoc) | Automatic (export) |
| Source Date Validation | None | Automated (fail if >5 years) | Manual |
| URL Accessibility | Manual check | Automated (HTTP 200 check) | None |
| Hackathon Fit | No (too manual) | Yes (CI-integrated) | Moderate (setup overhead) |

**Selected**: **Option B** (Automated Script) for hackathon and production.

**Rationale**: Constitution Principle VI requires minimum 50% from official sources published within 5 years. Automated script enforces this in CI pipeline, prevents outdated citations from merging. BibTeX + Pandoc standard for academic citations.

## Re-Evaluation of Constitution Check (Post-Design)

### I. Accuracy Through Verification
- [x] All technical claims traceable: **PASS** (automated citation validation script enforces traceability)
- [x] Peer-reviewed sources: **PASS** (BibTeX database includes IEEE/ACM papers for AI/ML concepts)
- [x] Code examples verified: **PASS** (CI pipeline runs automated tests on all code examples)
- [x] Version-specific citations: **PASS** (citation validation script checks version pinning)

**Final Status**: ✅ **PASS**

### II. Clarity for Students
- [x] Flesch-Kincaid grade 10-14: **PASS** (automated readability checks in CI)
- [x] Domain terminology defined: **PASS** (glossary auto-generated from chapters)
- [x] Conceptual → Practical progression: **PASS** (8-section template enforces structure)
- [x] Visual aids: **PASS** (50+ diagrams planned, Mermaid.js + screenshots)
- [x] Worked examples before exercises: **PASS** (template includes worked example section)

**Final Status**: ✅ **PASS**

### III. Reproducibility
- [x] Complete environment specs: **PASS** (Ubuntu 22.04, Python 3.10+, ROS 2 Humble, NVIDIA CUDA 11.8+)
- [x] Step-by-step setup: **PASS** (test scripts validate installation)
- [x] Docker/VM images: **PASS** (Dockerfiles for Isaac Sim, ROS 2 + Gazebo)
- [x] Test scripts: **PASS** (automated validation in CI)
- [x] Error troubleshooting: **PASS** (dedicated troubleshooting section in each chapter)

**Final Status**: ✅ **PASS**

### IV. Interactivity and AI-Nativeness
- [x] Structured Markdown: **PASS** (MDX with frontmatter metadata)
- [x] Metadata: **PASS** (difficulty, prerequisites, learning objectives in frontmatter)
- [x] RAG chatbot: **PASS** (LangChain + Qdrant + GPT-4 pipeline designed)
- [x] Personalization hooks: **PASS** (user profiles in Neon Postgres, adaptive content engine planned)
- [x] Translation services: **PASS** (i18next for Urdu translation, bonus feature)

**Final Status**: ✅ **PASS**

### V. Comprehensive Coverage
- [x] Module 1: ROS 2 fundamentals: **PASS** (4 chapters planned)
- [x] Module 2: Digital twins: **PASS** (4 chapters planned)
- [x] Module 3: NVIDIA Isaac: **PASS** (4 chapters planned)
- [x] Module 4: VLA integration: **PASS** (3 chapters planned)
- [x] Module 5: Capstone project: **PASS** (4 chapters planned)
- [x] Sequential dependencies: **PASS** (prerequisite checks in data model)

**Final Status**: ✅ **PASS**

### VI. Citation and Source Standards
- [x] APA citation format: **PASS** (BibTeX + Pandoc automated conversion)
- [x] Minimum 50% official docs: **PASS** (citation validation script enforces)
- [x] No unmaintained blogs: **PASS** (source date validation <5 years)
- [x] Code attribution: **PASS** (BSD-3 for ROS 2, Apache 2.0 for Isaac, documented in templates)
- [x] Version pinning: **PASS** (citation validation enforces version-specific references)

**Final Status**: ✅ **PASS**

**Overall Constitution Check**: ✅ **ALL GATES PASSED** - Project ready for `/sp.tasks` command.

## Next Steps

1. **Generate Phase 0 Research Document**: Run research tasks to create `research.md`
2. **Generate Phase 1 Design Documents**: Create `data-model.md`, `contracts/`, `quickstart.md`
3. **Run `/sp.tasks`**: Generate detailed task breakdown for implementation
4. **Begin Content Generation**: Launch Claude Code subagents to create chapters concurrently
5. **Integrate RAG Chatbot**: Build FastAPI backend + Qdrant embeddings + ChatbotWidget component
6. **Deploy to GitHub Pages**: Set up CI/CD pipeline and publish MVP
7. **Implement Bonus Features** (optional): Claude Subagents → Better-Auth → Personalization → Urdu Translation

**Estimated Timeline**:
- Phase 0-1: Days 1-2 (Planning, Research, Design)
- Phase A-B: Days 3-7 (Scaffolding, Content Generation)
- Phase C-D: Days 8-10 (RAG Integration, Deployment)
- Phase E: Days 11-14 (Bonus Features, optional)

**Total**: 10-14 days for complete textbook with base deliverables + optional bonuses.
