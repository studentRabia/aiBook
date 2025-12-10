# Research Document: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-10
**Feature**: 001-robotics-textbook
**Phase**: Phase 0 - Research & Technology Decisions

## Executive Summary

This document records all technology decisions, best practices research, and architectural choices for the Physical AI & Humanoid Robotics textbook project. All decisions prioritize hackathon timeline (1-2 weeks), cost constraints (free tiers), and constitution compliance (accuracy, reproducibility, AI-nativeness, citations).

## Technology Decisions

### 1. Content Generation Tooling

**Research Question**: What tools should we use to generate 18 chapters of technical content within hackathon timeline?

**Options Evaluated**:
- **Manual Writing**: Subject matter experts write chapters from scratch
- **GPT-4 Standalone**: Use OpenAI API directly for chapter generation
- **Claude Code + Spec-Kit Plus**: AI-assisted generation with reusable subagents

**Decision**: **Claude Code + Spec-Kit Plus**

**Rationale**:
1. **Speed**: Claude Code can generate 1 chapter per hour with proper prompting (18 chapters in ~1 day with parallelization)
2. **Quality**: Spec-Kit Plus templates ensure consistent structure (8-section chapter template)
3. **Reusability**: Claude Code subagents can be packaged as bonus feature (+50 points)
4. **Validation**: Built-in support for citation checking, readability analysis via Python scripts
5. **Cost**: <$100 total (Claude API usage for 18 chapters + iterations)

**Alternatives Rejected**:
- **Manual Writing**: Too slow for hackathon (18 chapters in 3-4 weeks minimum)
- **GPT-4 Standalone**: Lacks subagent reusability, harder to enforce constitution compliance

**Best Practices**:
- Use chapter-specific prompts with constitution principles embedded
- Validate each chapter against Flesch-Kincaid grade 10-14, 50%+ official sources
- Iterate on failed validations (typically 2-3 iterations per chapter)

**References**:
- Claude Code documentation: https://docs.anthropic.com/claude/docs/claude-code
- Spec-Kit Plus templates: https://github.com/specify/spec-kit-plus

---

### 2. Docusaurus Configuration

**Research Question**: Which static site generator best supports MDX, React components (chatbot), and educational content structure?

**Options Evaluated**:
- **Docusaurus 3.x**: React-based SSG with MDX, plugin ecosystem, Algolia search
- **GitBook**: Proprietary platform with limited customization
- **Nextra**: Next.js-based SSG, newer ecosystem
- **Custom React Site**: Full control, high development overhead

**Decision**: **Docusaurus 3.x**

**Rationale**:
1. **MDX Support**: Native MDX enables React components in Markdown (ChatbotWidget, TranslationButton)
2. **Plugin Ecosystem**: Mermaid.js (diagrams), Algolia DocSearch (free search), i18next (translation)
3. **Educational Use Case**: Designed for technical documentation, supports versioning and sidebar navigation
4. **Performance**: Static site generation → fast page loads (<2 seconds), Lighthouse score ≥90
5. **GitHub Pages**: One-command deployment (`npm run deploy`), free hosting

**Alternatives Rejected**:
- **GitBook**: Proprietary limits on customization, no RAG chatbot integration
- **Nextra**: Less mature plugin ecosystem, harder to configure
- **Custom React**: Too much overhead for hackathon timeline

**Best Practices**:
- Use `docusaurus.config.js` for centralized configuration
- Organize content by module: `docs/module-1-ros2/`, `docs/module-2-digital-twin/`, etc.
- Enable versioning for future textbook editions (e.g., ROS 2 Jazzy update)

**References**:
- Docusaurus 3.x docs: https://docusaurus.io/docs
- MDX documentation: https://mdxjs.com/
- Algolia DocSearch: https://docsearch.algolia.com/

---

### 3. RAG Chatbot Architecture

**Research Question**: How to build a RAG chatbot that answers student queries with <3 second response time and 85%+ accuracy?

**Options Evaluated**:
- **LangChain + OpenAI + Qdrant**: Industry-standard RAG pipeline
- **LlamaIndex + Local Models**: Open-source alternative, slower inference
- **Pinecone + Cohere**: Managed vector DB, limited free tier

**Decision**: **LangChain + OpenAI embeddings + Qdrant + GPT-4-turbo**

**Rationale**:
1. **LangChain**: Simplifies document chunking (RecursiveCharacterTextSplitter), retrieval (VectorStoreRetriever), and synthesis (RetrievalQA chain)
2. **OpenAI Embeddings**: `text-embedding-3-small` provides high-quality embeddings (1536 dimensions), low cost ($0.02 per 1M tokens)
3. **Qdrant Cloud**: Free tier (1GB storage, 100K vectors), sufficient for 18 chapters (~500 chunks)
4. **GPT-4-turbo**: Better context understanding than GPT-3.5, maintains <3 second response time
5. **RAGAS Metrics**: Evaluate retrieval quality (context relevance, answer faithfulness)

**Alternatives Rejected**:
- **LlamaIndex + Local Models**: Slower inference (10-15 seconds), lower accuracy
- **Pinecone**: Free tier too limited (1 index, 1M vectors max but restrictive quotas)

**Best Practices**:
- Chunk chapters into 512-token segments with 50-token overlap
- Use metadata filtering (chapter_id, module_id, difficulty) for targeted retrieval
- Implement user-selected text context: Append selected text to query for better relevance
- Cache embeddings to avoid regenerating on every deploy

**Architecture Diagram**:
```
User Query → FastAPI /api/chatbot/query → LangChain Pipeline:
  1. Embed query (OpenAI text-embedding-3-small)
  2. Search Qdrant (Top-5 chunks by cosine similarity)
  3. Synthesize answer (GPT-4-turbo with retrieved context)
  4. Return answer + sources + confidence score
```

**References**:
- LangChain documentation: https://python.langchain.com/docs/get_started/introduction
- Qdrant documentation: https://qdrant.tech/documentation/
- OpenAI embeddings: https://platform.openai.com/docs/guides/embeddings
- RAGAS metrics: https://github.com/explodinggradients/ragas

---

### 4. Citation Management

**Research Question**: How to enforce APA citations with 50%+ official sources and <5 years publication date automatically?

**Options Evaluated**:
- **Manual Spreadsheet**: Track citations in Google Sheets, periodic audits
- **BibTeX + Pandoc + Validation Script**: Automated conversion and validation
- **Zotero/Mendeley**: Reference management software with manual export

**Decision**: **BibTeX + Pandoc + Automated Validation Script**

**Rationale**:
1. **BibTeX**: Standard format for academic citations, integrates with Pandoc
2. **Pandoc**: Converts BibTeX to APA format automatically (`--citeproc` flag)
3. **Validation Script**: Python script checks:
   - APA format compliance (regex patterns)
   - Source date <5 years from current year (parse year from BibTeX)
   - URL accessibility (HTTP 200 check with `requests` library)
   - Minimum 50% from official sources (whitelist: ros.org, docs.nvidia.com, etc.)
4. **CI Integration**: Run validation script in GitHub Actions, fail build if violations

**Alternatives Rejected**:
- **Manual Spreadsheet**: Error-prone, no automated enforcement
- **Zotero/Mendeley**: Manual entry overhead, no source date validation

**Best Practices**:
- Maintain `references.bib` file with all citations
- Auto-generate `references.md` from BibTeX for transparency
- Include official source URLs in BibTeX `url` field for accessibility checks

**Validation Script Pseudocode**:
```python
def validate_citations(bibtex_file):
    citations = parse_bibtex(bibtex_file)
    official_sources = ["ros.org", "docs.nvidia.com", "gazebosim.org", "docs.unity3d.com"]

    for cite in citations:
        # Check APA format
        assert matches_apa_format(cite), f"Invalid APA: {cite}"

        # Check source date
        year = extract_year(cite)
        assert (2025 - year) <= 5, f"Outdated source: {cite} ({year})"

        # Check URL accessibility
        if "url" in cite:
            assert requests.get(cite["url"]).status_code == 200, f"Broken link: {cite['url']}"

    # Check 50% official sources
    official_count = sum(1 for c in citations if any(src in c.get("url", "") for src in official_sources))
    assert (official_count / len(citations)) >= 0.5, "Less than 50% official sources"
```

**References**:
- BibTeX documentation: http://www.bibtex.org/Format/
- Pandoc citeproc: https://pandoc.org/MANUAL.html#citations
- APA Style Guide: https://apastyle.apa.org/style-grammar-guidelines/references

---

### 5. Code Example Packaging

**Research Question**: How to organize and distribute 100+ code examples for reproducibility across student environments?

**Options Evaluated**:
- **Inline Code in Markdown**: Embed all code directly in chapters
- **Separate Git Branches**: Solutions in `solutions` branch, starter code in `main`
- **Docker Containers**: Pre-configured environments for Isaac Sim, ROS 2 + Gazebo

**Decision**: **Separate Git Branches + Docker Containers**

**Rationale**:
1. **Separation of Concerns**: Keeps textbook Markdown clean, code examples testable independently
2. **Git Branches**: `main` contains starter code, `solutions` contains complete implementations
3. **Docker**: Complex setups (Isaac Sim requires NVIDIA GPU, CUDA 11.8+) packaged as Dockerfiles
4. **Reproducibility**: Test scripts validate setup (e.g., `test_ros2_setup.py` checks ROS 2 sourcing)

**Alternatives Rejected**:
- **Inline Code**: Clutters Markdown, hard to test independently
- **External ZIP Files**: Version control issues, harder to update

**Best Practices**:
- Organize by module: `code-examples/module-1-ros2/`, `code-examples/module-2-digital-twin/`, etc.
- Include `README.md` in each example directory with setup instructions
- Provide Dockerfiles for GPU-dependent code (Isaac Sim, Isaac ROS)

**Directory Structure**:
```
code-examples/
├── module-1-ros2/
│   ├── talker_listener/
│   │   ├── README.md
│   │   ├── setup.sh
│   │   ├── src/talker.py
│   │   └── tests/test_talker.py
│   ├── python_agent_bridge/
│   └── humanoid_urdf/
├── module-2-digital-twin/
│   ├── gazebo_worlds/
│   └── unity_projects/
└── docker/
    ├── isaac-sim.Dockerfile
    └── ros2-gazebo.Dockerfile
```

**References**:
- Git branching strategies: https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows
- Docker best practices: https://docs.docker.com/develop/dev-best-practices/

---

### 6. Deployment Strategy

**Research Question**: Where to deploy Docusaurus frontend and FastAPI backend with zero cost and minimal setup?

**Options Evaluated**:
- **GitHub Pages (frontend) + AWS Lambda (backend)**: Free tiers, serverless
- **GitHub Pages (frontend) + Render Free Tier (backend)**: Simpler setup
- **Vercel (frontend + serverless functions)**: Unified platform, 10-second timeout risk

**Decision**: **GitHub Pages (frontend) + Render Free Tier (backend)**

**Rationale**:
1. **GitHub Pages**: Free for public repos, automatic deployment from `gh-pages` branch
2. **Render Free Tier**: 512MB RAM (sufficient for FastAPI + LangChain), no cold starts (always warm)
3. **Simple Setup**: GitHub Actions for Docusaurus build, Render deploys on Git push
4. **No Timeout Issues**: Render has no hard timeout limit (unlike Vercel's 10 seconds)

**Alternatives Rejected**:
- **AWS Lambda**: Complex setup (IAM roles, API Gateway), cold starts (1-3 seconds)
- **Vercel Functions**: 10-second timeout too short for LLM inference (risk of failures)

**Best Practices**:
- Use GitHub Actions workflow for Docusaurus build and deploy
- Set up Render environment variables via dashboard (OPENAI_API_KEY, QDRANT_URL, NEON_DATABASE_URL)
- Enable CORS in FastAPI for cross-origin requests from GitHub Pages

**Deployment Workflow**:
```
1. Developer pushes to `main` branch
2. GitHub Actions triggers:
   - Run tests (pytest, Docusaurus build)
   - Build Docusaurus site (`npm run build`)
   - Deploy to `gh-pages` branch (gh-pages-deploy action)
3. Render auto-deploys backend on `main` branch push
4. Live site: https://username.github.io/robotics-textbook/
5. Backend API: https://robotics-textbook-api.onrender.com/api/
```

**References**:
- GitHub Pages: https://docs.github.com/en/pages
- Render deployment: https://render.com/docs/deploy-fastapi
- GitHub Actions: https://docs.github.com/en/actions

---

### 7. Bonus Feature Prioritization

**Research Question**: In what order should we implement bonus features (+200 points) to maximize points with minimal risk?

**Options Evaluated**:
- **Parallel Implementation**: All 4 bonuses simultaneously
- **Sequential by Complexity**: Easiest → Hardest
- **Sequential by Dependencies**: Prerequisites first

**Decision**: **Sequential by Dependencies + ROI**

**Priority Order**:
1. **Claude Subagents** (+50 points, Days 11-12)
   - **Why First**: Already using Claude Code for content generation; refactor into reusable subagents
   - **ROI**: Immediate benefit for content review and citation validation
   - **Risk**: Low (existing code to refactor)

2. **Better-Auth** (+50 points, Day 12)
   - **Why Second**: Prerequisite for personalization (need user profiles)
   - **ROI**: Unlocks user data collection for adaptive content
   - **Risk**: Moderate (integration with Neon Postgres)

3. **Personalization** (+50 points, Day 13)
   - **Why Third**: Depends on Better-Auth for user profiles
   - **ROI**: Differentiator feature (adaptive chapter content)
   - **Risk**: Moderate (content adaptation logic)

4. **Urdu Translation** (+50 points, Day 14)
   - **Why Fourth**: Independent of other bonuses, lowest complexity
   - **ROI**: Accessibility for Urdu-speaking students
   - **Risk**: Low (i18next + GPT-4 translation)

**Alternatives Rejected**:
- **Parallel Implementation**: High risk of incomplete features
- **By Complexity**: Misses dependency chains (Better-Auth enables Personalization)

**Best Practices**:
- Allocate 1-1.5 days per bonus feature
- Test each bonus independently before integrating
- Document bonus features separately for easy removal if timeline tight

**References**:
- Claude Agent SDK: https://github.com/anthropics/anthropic-sdk-python
- Better-Auth: https://www.better-auth.com/docs
- i18next for Docusaurus: https://docusaurus.io/docs/i18n/introduction

---

## Summary of Decisions

| Decision Area | Selected Option | Key Rationale |
|---------------|----------------|---------------|
| Content Generation | Claude Code + Spec-Kit Plus | Speed (1 chapter/hour), reusability (bonus feature), cost (<$100) |
| Static Site Generator | Docusaurus 3.x | MDX support, plugin ecosystem, GitHub Pages deployment |
| RAG Architecture | LangChain + OpenAI + Qdrant | Industry standard, free tiers, <3 second response |
| Citation Management | BibTeX + Pandoc + Validation Script | Automated enforcement, CI integration, APA compliance |
| Code Packaging | Git Branches + Docker | Separation of concerns, reproducibility, testability |
| Deployment | GitHub Pages + Render Free Tier | Zero cost, no cold starts, simple setup |
| Bonus Prioritization | Sequential by Dependencies | Claude Subagents → Better-Auth → Personalization → Translation |

**Total Estimated Cost**: <$100 (OpenAI API for content generation + RAG queries)

**Risk Mitigation**:
- All critical decisions use free tiers (Qdrant, Neon, GitHub Pages, Render)
- Fallback options documented (e.g., Vercel if Render unavailable)
- Bonus features optional (base deliverable = 100 points guaranteed)

**Next Phase**: Generate data-model.md, contracts/, quickstart.md (Phase 1 Design & Contracts)
