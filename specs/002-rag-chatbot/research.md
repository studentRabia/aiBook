# Research & Technical Decisions: RAG Chatbot

**Feature**: 002-rag-chatbot
**Date**: 2025-12-10
**Purpose**: Resolve technical unknowns and document architectural decisions

## Overview

This document resolves all "NEEDS CLARIFICATION" items from the Technical Context and provides research-backed decisions for the RAG chatbot implementation.

---

## Decision 1: Frontend Framework

**Decision**: Use **vanilla JavaScript** with Web Components for the chat widget

**Rationale**:
- **Embedding Flexibility**: Vanilla JS/Web Components can be embedded in any textbook platform (React, Vue, static HTML) without framework conflicts
- **Bundle Size**: Minimal dependencies (~10-20 KB) vs React (~40+ KB) improves load time
- **Isolation**: Shadow DOM provides style isolation from host textbook styles
- **Simplicity**: Chat widget has limited interactivity; React/Vue overhead not justified

**Alternatives Considered**:
- **React**: Better developer experience, larger ecosystem, but adds bundle size and potential version conflicts with host app
- **Vue**: Similar to React; adds dependency management complexity
- **Svelte**: Compiles to vanilla JS but adds build step complexity

**Implementation**:
- Custom element: `<chatbot-widget>`
- CSS Module/Shadow DOM for style encapsulation
- Fetch API for backend communication

---

## Decision 2: Document Processing & Chunking Library

**Decision**: Use **LangChain** text splitters with **Markdown** as primary format

**Rationale**:
- **LangChain Splitters**: Battle-tested chunking logic (RecursiveCharacterTextSplitter) with semantic awareness
- **Markdown Support**: Preserves structure (headings, code blocks, lists) better than plain text
- **Metadata Extraction**: Heading hierarchy automatically captured for citations
- **Chunk Size**: 512 tokens with 50 token overlap (balances context vs retrieval precision)

**Alternatives Considered**:
- **Manual Chunking**: More control but requires extensive testing for edge cases
- **Semantic Chunking**: Better quality but computationally expensive; overkill for structured textbook
- **PDF Direct**: Complex parsing; prefer Markdown conversion pipeline (Pandoc/pdftotext → Markdown)

**Implementation**:
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""]
)
```

---

## Decision 3: Embedding Model

**Decision**: Use **text-embedding-3-small** (OpenAI)

**Rationale**:
- **Cost**: $0.02/1M tokens vs $0.10/1M for ada-002 (5x cheaper)
- **Performance**: 1536 dimensions, comparable quality to ada-002
- **Dimension Flexibility**: Can reduce to 512/1024 dimensions for storage optimization
- **Estimated Cost**: ~500 pages × 1000 tokens/page = 500K tokens → $0.01 for initial embedding

**Alternatives Considered**:
- **text-embedding-ada-002**: Legacy model, more expensive, no dimension reduction
- **Open Source (SBERT, Instructor)**: Free but requires hosting/compute; adds infrastructure complexity
- **text-embedding-3-large**: Better quality but $0.13/1M tokens; not justified for educational content

**Implementation**:
- Use 1024 dimensions (good balance of quality vs storage)
- Batch embed: 100 chunks per API call to optimize rate limits

---

## Decision 4: LLM Model for Generation

**Decision**: Use **GPT-3.5-turbo** for production, with GPT-4o-mini as fallback

**Rationale**:
- **Cost**: $0.50/1M input + $1.50/1M output (GPT-3.5) vs $2.50/$10.00 (GPT-4 Turbo)
- **Speed**: ~1-2s response time for GPT-3.5 vs 3-5s for GPT-4 (meets SC-001: <3s)
- **Quality**: Sufficient for fact-based Q&A from retrieved context; GPT-4 gains diminish for RAG
- **Estimated Cost**: 100 users × 10 queries/day × 1000 tokens avg → $2-3/day with GPT-3.5

**Alternatives Considered**:
- **GPT-4 Turbo**: Higher quality but 5-10x cost; not justified for textbook Q&A
- **GPT-4o-mini**: $0.15/$0.60 per 1M tokens; good fallback option
- **Open Source (Llama, Mistral)**: Free but requires hosting; inference latency challenges

**Implementation**:
- Primary: GPT-3.5-turbo-1106 (latest stable)
- Temperature: 0.3 (low variance for factual accuracy)
- Max tokens: 800 (concise answers with citations)
- System prompt: Enforce citation format and anti-hallucination rules

---

## Decision 5: Chunking Strategy Details

**Decision**: **Recursive splitting with heading hierarchy preservation**

**Rationale**:
- **Semantic Units**: Split on headings first (##, ###) to keep sections intact
- **Chunk Size**: 512 tokens (~400 words) balances context and retrieval precision
- **Overlap**: 50 tokens captures cross-section references
- **Metadata**: Store heading path (Chapter > Section > Subsection) for citations

**Process**:
1. Parse Markdown → Extract heading hierarchy
2. Split on headings (`\n## `, `\n### `, etc.)
3. If chunk > 512 tokens → recursive split on paragraphs (`\n\n`)
4. Store metadata: `{chapter, section, page_num, heading_path}`

**Edge Cases**:
- **Equations**: Keep LaTeX blocks intact (custom separator)
- **Code Blocks**: Don't split mid-block (detect ``` markers)
- **Tables**: Treat as atomic unit (don't split)

---

## Decision 6: Document Source Format

**Decision**: **Markdown** as canonical format, with PDF → Markdown conversion pipeline

**Rationale**:
- **Structured**: Heading hierarchy, code blocks, equations preserved
- **Parseable**: Easy to extract metadata (frontmatter, headings)
- **Conversion Tools**: Pandoc for PDF → Markdown with good fidelity
- **Version Control**: Text format enables diff tracking for content updates

**Pipeline**:
```
PDF → (Pandoc/pdftotext) → Markdown → (LangChain Splitter) → Chunks → (OpenAI Embedding) → Qdrant
```

**Alternatives Considered**:
- **Direct PDF Parsing**: PyPDF2/pdfplumber complex; loses structure
- **HTML**: Good structure but heavier parsing; Markdown cleaner
- **DOCX**: Requires conversion; Markdown is final format

---

## Decision 7: Frontend Testing Framework

**Decision**: **Playwright** for E2E tests, no unit testing for vanilla JS widget

**Rationale**:
- **E2E Focus**: Chat widget behavior is integration-heavy (user input → API → display)
- **Playwright**: Cross-browser testing (Chrome, Firefox, Safari), headless CI support
- **Vanilla JS**: Component logic is minimal; E2E tests provide better ROI than mocking

**Test Scenarios**:
- Open/close toggle
- Send message → verify API call → verify response rendering
- Text selection → verify selected context sent to backend
- Multi-turn conversation → verify context maintained

**Alternatives Considered**:
- **Jest + Testing Library**: Better for component unit tests (React/Vue); overkill for vanilla JS
- **Cypress**: Good E2E but Playwright has better multi-browser support

---

## Decision 8: Deployment Platform

**Decision**: **Railway** (backend) + **Netlify** (frontend widget)

**Rationale**:
- **Railway**:
  - Easy Docker deployment (FastAPI containerization)
  - Built-in Postgres (can use for Neon alternative if needed)
  - $5/month free tier (500 hours)
  - Auto-scaling to 100 concurrent users
- **Netlify**:
  - CDN distribution for chat widget JS/CSS
  - Free tier sufficient for static assets
  - Easy integration via `<script>` tag in textbook

**Alternatives Considered**:
- **Vercel**: Good for Next.js; FastAPI support less mature
- **Docker on VPS**: More control but requires maintenance
- **Serverless (AWS Lambda)**: Cold start latency (~1-2s) violates SC-001

**Architecture**:
```
[Textbook HTML]
    ↓ loads
[Netlify CDN: chat-widget.js]
    ↓ calls
[Railway: FastAPI backend]
    ↓ queries
[Qdrant Cloud + Neon Postgres]
```

---

## Decision 9: Conversation History Retention

**Decision**: **90 days** with automatic archival

**Rationale**:
- **User Expectations**: Students may return to textbook across semester (~3-4 months)
- **Privacy**: Auto-delete after semester ends (GDPR-friendly)
- **Storage**: Neon free tier: 10 GB; 90 days × 100 users × ~1 KB/message → ~10 MB (well within limit)

**Implementation**:
- Cron job (daily): DELETE FROM sessions WHERE last_activity < NOW() - INTERVAL '90 days'
- Export option: Allow users to download conversation history (JSON)

**Alternatives Considered**:
- **30 days**: Too short for semester-long use
- **365 days**: Privacy concerns; storage waste
- **Indefinite**: GDPR risk; storage bloat

---

## Decision 10: Total User Base Size Assumption

**Decision**: **1,000 total users**, **100 concurrent** (per SC-005)

**Rationale**:
- **Educational Context**: Single textbook → estimate 2-3 courses × 200-300 students
- **Concurrent Load**: 10% active at peak (exam prep, assignment deadlines)
- **Scalability Checkpoint**: At 1,000 users, reevaluate free tier limits

**Free Tier Validation**:
- **Qdrant**: 1 GB storage → ~2M vectors (1024 dims) → sufficient for 1 textbook
- **Neon Postgres**: 10 GB → ~10M messages → sufficient for 1,000 users × 10 sessions
- **OpenAI**: Rate limits: 60 requests/min → 100 concurrent users need connection pooling

---

## Decision 11: Vector DB Size Estimation

**Decision**: **~5,000 chunks** for 500-page textbook → **~20 MB** in Qdrant

**Calculation**:
- 500 pages × 500 words/page = 250,000 words
- 250,000 words ÷ 400 words/chunk = 625 chunks (minimum)
- Account for overlap & metadata → ~5,000 chunks (conservative)
- Storage: 5,000 chunks × 1024 dims × 4 bytes/float = ~20 MB

**Free Tier Check**:
- Qdrant Cloud Free: 1 GB storage
- 20 MB <<  GB → ✅ Sufficient headroom for multiple textbooks

---

## Summary Table

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend Framework | Vanilla JS + Web Components | Embeddability, minimal bundle size |
| Document Processing | LangChain + Markdown | Semantic chunking, metadata extraction |
| Embedding Model | text-embedding-3-small (1024 dims) | Cost-effective, sufficient quality |
| LLM Model | GPT-3.5-turbo | Speed/cost balance for RAG |
| Chunking | 512 tokens, 50 overlap, hierarchy-aware | Context balance, citation metadata |
| Document Source | Markdown (convert from PDF) | Structure preservation, parseability |
| Frontend Testing | Playwright E2E | Integration-focused testing |
| Deployment | Railway (backend) + Netlify (frontend) | Easy scaling, free tiers |
| Conversation Retention | 90 days | Semester use case, privacy balance |
| User Scale | 1,000 total, 100 concurrent | Free tier headroom validation |
| Vector DB Size | ~5,000 chunks, ~20 MB | Well within 1 GB limit |

---

## Next Steps

All "NEEDS CLARIFICATION" items resolved. Proceed to:
1. **Phase 1**: data-model.md (entity schemas)
2. **Phase 1**: contracts/ (API OpenAPI spec)
3. **Phase 1**: quickstart.md (developer guide)
