# RAG Chatbot Setup Guide

Complete guide to setting up the RAG-powered chatbot for the Physical AI & Humanoid Robotics Textbook.

## Overview

The chatbot uses:
- **OpenAI GPT-4 Turbo** for answer generation
- **OpenAI text-embedding-3-small** for embeddings
- **Qdrant Cloud** for vector storage
- **FastAPI** for backend API
- **React** chatbot widget in Docusaurus

## Prerequisites

1. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
2. **Qdrant Cloud Account** (Free Tier) - Sign up at https://cloud.qdrant.io/
3. **Neon Serverless Postgres** (Optional for user data) - Sign up at https://neon.tech/

## Step-by-Step Setup

### 1. Get API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

#### Qdrant Cloud
1. Sign up at https://cloud.qdrant.io/
2. Create a new cluster (Free tier: 1GB storage)
3. Copy the cluster URL (e.g., `https://xxx.qdrant.io:6333`)
4. Copy the API key from cluster settings

### 2. Configure Backend Environment

Create `.env` file in `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-key-here

# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your-qdrant-key-here

# Optional: Neon Postgres (for user data)
NEON_DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/robotics_textbook
```

### 3. Install Backend Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Start the Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn src.main:app --reload
```

The API will be available at:
- **API Docs**: http://localhost:8000/docs
- **Chatbot Endpoint**: http://localhost:8000/api/chatbot/query
- **Health Check**: http://localhost:8000/api/chatbot/health

### 5. Test the Backend

Using curl:

```bash
curl -X POST "http://localhost:8000/api/chatbot/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "What is ROS 2?"}'
```

Expected response:
```json
{
  "answer": "ROS 2 is the second generation of the Robot Operating System...",
  "sources": ["Textbook content"],
  "confidence": 0.5,
  "response_time_ms": 1850
}
```

### 6. Start Docusaurus (if not already running)

```bash
cd textbook
npm start
```

Visit http://localhost:3000/robotics-textbook/ and you should see:
- **💬 Chat button** in the bottom-right corner
- Click it to open the chatbot widget

## Features

### 1. General Questions
Ask anything about the textbook content:
- "What is ROS 2?"
- "How do I create a ROS 2 node?"
- "What's the difference between Gazebo and Unity?"

### 2. Selected Text Context
1. **Select text** on any page (highlight it)
2. Ask a question about it
3. The chatbot will use the selected text as context

Example:
- Select: "A ROS 2 node is a process that performs computation..."
- Ask: "Can you explain this in simpler terms?"

### 3. Chapter-Specific Questions
The chatbot can scope answers to specific chapters (when chapter_id is provided).

## Troubleshooting

### Error: "Couldn't process your question"

**Cause**: Backend server not running or wrong URL

**Solution**:
1. Check backend is running: `curl http://localhost:8000/health`
2. Verify `.env` file has correct API keys
3. Check browser console for error messages

### Error: "OpenAI API key not found"

**Solution**:
1. Verify `.env` file exists in `backend/` directory
2. Check `OPENAI_API_KEY` is set correctly
3. Restart the backend server

### Error: "Qdrant connection failed"

**Solution**:
1. Verify Qdrant cluster is running at https://cloud.qdrant.io/
2. Check `QDRANT_URL` and `QDRANT_API_KEY` in `.env`
3. Ensure your Qdrant free tier hasn't expired

### Chatbot button not appearing

**Solution**:
1. Hard refresh browser: `Ctrl+Shift+R` (or `Cmd+Shift+R`)
2. Check browser console for JavaScript errors
3. Verify `textbook/src/theme/Root.js` exists

## Cost Estimates

### OpenAI API Costs (approximate)

- **Embeddings** (text-embedding-3-small): ~$0.02 per 1M tokens
  - 18 chapters × 2000 words ≈ $0.10 total
- **Chat** (gpt-4-turbo-preview): ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
  - 100 queries × 500 tokens avg ≈ $2-5

**Estimated monthly cost**: $5-10 for light usage

### Free Tiers

- **Qdrant Cloud**: 1GB storage (sufficient for 50K+ text chunks)
- **Neon Postgres**: 500MB storage, 0.5 compute hours (sufficient for development)

## Advanced Configuration

### Custom System Prompt

Edit `backend/src/services/rag_service.py`:

```python
system_prompt = """Your custom teaching assistant prompt here"""
```

### Adjust Retrieval

Change number of context chunks:

```python
result = rag_service.query_chatbot(
    query=query.query,
    top_k=5  # Increase for more context
)
```

### Change Models

In `rag_service.py`:

```python
self.embedding_model = "text-embedding-3-large"  # Better quality
self.chat_model = "gpt-3.5-turbo"  # Lower cost
```

## Next Steps

1. **Populate Qdrant** with textbook content embeddings (see `scripts/data-processing/embed_chapters.py`)
2. **Add user authentication** with Better-Auth (bonus feature)
3. **Implement personalization** based on user background
4. **Add conversation history** storage in Neon Postgres

## Support

- **API Documentation**: http://localhost:8000/docs
- **OpenAI Help**: https://platform.openai.com/docs
- **Qdrant Docs**: https://qdrant.tech/documentation/
- **GitHub Issues**: Open an issue for bugs or questions
