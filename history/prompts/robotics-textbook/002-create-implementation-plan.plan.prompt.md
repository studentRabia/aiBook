---
id: 002
title: Create Implementation Plan
stage: plan
date: 2025-12-10
surface: agent
model: claude-sonnet-4-5
feature: robotics-textbook
branch: 001-robotics-textbook
user: DELL
command: /sp.plan
labels: ["planning", "architecture", "rag-chatbot", "docusaurus", "content-generation"]
links:
  spec: specs/001-robotics-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-robotics-textbook/plan.md
  - specs/001-robotics-textbook/research.md
  - specs/001-robotics-textbook/data-model.md
  - specs/001-robotics-textbook/quickstart.md
  - specs/001-robotics-textbook/contracts/README.md
tests:
  - None (planning documents)
---

## Prompt

```text
/sp.plan

Create: overall system architecture sketch, book section structure, development approach, quality validation.
Decisions needing documentation: list important choices with options and tradeoffs for tools, integrations, and features.
Testing strategy: validation checks based on success criteria from specification and hackathon requirements.

Technical details:
- Use AI/Spec-driven concurrent approach (generate content while integrating, not all upfront; leverage Claude Code for subagents and Spec-Kit Plus for specs)
- Follow APA citation style from Constitution for all references
- Organize by phases: Planning → Content Generation → AI Integrations → Deployment → Bonus Features & Optimization
- Ensure all code and setups are reproducible with GitHub repo templates
- Prioritize base deliverables (Docusaurus book + RAG chatbot) before bonuses (Claude Subagents, Better-Auth, Personalization, Translation) for max points (100 base + up to 200 bonus)
```

## Response snapshot

Created comprehensive implementation plan with complete technical architecture for Physical AI & Humanoid Robotics textbook:

**Technical Stack**:
- Frontend: Docusaurus 3.x (MDX, React components, Mermaid.js, Algolia DocSearch)
- Backend: FastAPI + LangChain + Qdrant (vector DB) + Neon Postgres (user data)
- Content Generation: Claude Code subagents + Spec-Kit Plus templates (1 chapter/hour, 18 chapters in ~1 day parallelized)
- Deployment: GitHub Pages (frontend) + Render Free Tier (backend)
- Quality: APA citations (50%+ official), Flesch-Kincaid 10-14, <5% plagiarism, reproducibility via Docker

**Project Structure**:
- Content: 5 modules, 18 chapters in `textbook/docs/` (Markdown + frontmatter metadata)
- Code Examples: Separate `code-examples/` directory with tests (pytest, colcon test)
- RAG Backend: `backend/src/` with FastAPI API routes, LangChain services, SQLAlchemy models
- Scripts: `scripts/content-generation/` (AI chapter generation, citation validation, readability checks)
- Bonus: `bonus/` directory for optional features (Claude Subagents, Better-Auth, Personalization, Urdu Translation)

**Constitution Check**: All 6 principles passed (Accuracy, Clarity, Reproducibility, Interactivity, Comprehensive Coverage, Citations)

**Phase 0 - Research** (research.md):
- 7 technology decisions documented with rationale and alternatives
- Content Generation: Claude Code + Spec-Kit Plus (speed, reusability)
- Docusaurus: MDX support, plugin ecosystem, GitHub Pages deployment
- RAG: LangChain + OpenAI + Qdrant (industry standard, free tiers)
- Citations: BibTeX + Pandoc + automated validation (CI-integrated)
- Code Packaging: Git branches + Docker (reproducibility)
- Deployment: GitHub Pages + Render (zero cost, no cold starts)
- Bonus Prioritization: Claude Subagents → Better-Auth → Personalization → Urdu Translation

**Phase 1 - Design** (data-model.md, contracts/, quickstart.md):
- 6 entities: Module, Chapter, CodeExample, Exercise, UserProfile, UserQuery
- Module: 1:N Chapters (sequential prerequisites, 3-4 chapters each)
- Chapter: Flesch-Kincaid 10-14, 50%+ official sources, 8 mandatory sections, 3 exercises
- CodeExample: BSD-3/Apache-2.0 licenses, CI-tested, expected output documented
- Exercise: basic/intermediate/challenge difficulty, starter code + solutions (in separate branch)
- UserProfile: Background questionnaire for personalization, progress tracking
- UserQuery: RAG chatbot logs for analytics, <3s response time, confidence scores
- API Contracts: Chatbot (POST /api/chatbot/query), User Profile (POST /api/user/profile, PUT /api/user/progress), Content (GET /api/content/chapters)
- Quickstart: 5-section developer guide (setup, contribution workflow, testing, RAG testing, deployment)

**Phase 2 - Implementation** (high-level strategy in plan.md):
- Phase A (Days 1-2): Scaffolding (Docusaurus + FastAPI + CI/CD pipelines)
- Phase B (Days 3-7): Concurrent content generation (5 Claude subagents for 5 modules)
- Phase C (Days 6-8): RAG integration (embeddings, retrieval, ChatbotWidget component)
- Phase D (Days 9-10): Deployment + QA (GitHub Pages, Render, Lighthouse CI, plagiarism checks)
- Phase E (Days 11-14): Bonus features (optional, sequential implementation)

**Architectural Decisions** (3 ADRs documented):
1. Content Generation: AI Draft + Review (fast, low cost, meets timeline)
2. RAG Backend: Render Free Tier (no cold starts, simple setup, sufficient RAM)
3. Citation Management: Automated Script (CI-enforced, <5 years, 50%+ official)

**Testing Strategy**:
- Content: Readability (textstat), Citations (APA + date + URL checks), Plagiarism (GPTZero <5%)
- Code: pytest (Python), colcon test (ROS 2), Docker (reproducibility)
- RAG: API tests (FastAPI), RAGAS metrics (retrieval quality), Locust (load testing <3s)
- Deployment: Docusaurus build, Lighthouse CI (≥90), cross-browser, mobile responsive

**Timeline**: 10-14 days (base deliverables in 10 days, bonuses in 11-14 if time permits)

## Outcome

- ✅ Impact: Complete implementation roadmap for textbook project; defines all technical decisions, data models, API contracts, and development phases aligned with constitution
- 🧪 Tests: Validation strategies defined for content quality (readability, citations, plagiarism), code reproducibility (pytest, Docker), and RAG performance (response time, accuracy)
- 📁 Files: `plan.md` (comprehensive architecture), `research.md` (7 tech decisions), `data-model.md` (6 entities), `quickstart.md` (developer onboarding), `contracts/README.md` (API overview)
- 🔁 Next prompts: `/sp.tasks` to generate detailed task breakdown, or begin Phase A implementation (Docusaurus scaffolding)
- 🧠 Reflection: Plan prioritizes hackathon speed (AI content generation, free tiers, concurrent workflows) while maintaining quality (constitution gates, automated validation). Bonus features architected as modular add-ons to avoid blocking base deliverables. All decisions traceable to requirements (spec.md) and principles (constitution.md).

## Evaluation notes (flywheel)

- Failure modes observed: None - planning phase completed with all artifacts generated
- Graders run and results (PASS/FAIL): Constitution Check PASS (all 6 principles), Phase 0 research complete (7 decisions), Phase 1 design complete (entities + contracts + quickstart)
- Prompt variant (if applicable): Standard `/sp.plan` command with AI/Spec-driven approach emphasized
- Next experiment (smallest change to try): Test concurrent chapter generation with 2-3 Claude subagents before full 5-agent parallelization—validate quality and iteration requirements
