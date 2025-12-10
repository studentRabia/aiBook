# Developer Quickstart: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-10
**Feature**: 001-robotics-textbook
**Purpose**: Onboarding guide for content contributors and developers

## Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.11+ ([download](https://www.python.org/downloads/))
- **Docker** ([download](https://www.docker.com/get-started))
- **Git** ([download](https://git-scm.com/downloads))
- **Text Editor**: VS Code recommended with extensions: Markdown All in One, Python, ESLint

## 1. Setup Local Environment

### Clone Repository

```bash
git clone https://github.com/username/robotics-textbook.git
cd robotics-textbook
```

### Install Frontend Dependencies (Docusaurus)

```bash
cd textbook
npm install
```

**Expected Output**: `added XXX packages in YYs`

### Install Backend Dependencies (FastAPI + RAG)

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Expected Output**: `Successfully installed fastapi langchain qdrant-client ...`

### Install Content Generation Scripts

```bash
cd ../scripts
pip install -r requirements.txt
```

### Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
OPENAI_API_KEY=sk-...
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=...
NEON_DATABASE_URL=postgres://user:pass@ep-xxx.neon.tech/db
```

**Note**: Get API keys from:
- OpenAI: https://platform.openai.com/api-keys
- Qdrant: https://cloud.qdrant.io/
- Neon: https://neon.tech/

### Start Local Servers

**Terminal 1 - Docusaurus Frontend**:
```bash
cd textbook
npm start
```
Visit: http://localhost:3000

**Terminal 2 - FastAPI Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --reload
```
Visit API docs: http://localhost:8000/docs

---

## 2. Content Contribution Workflow

### Create Feature Branch

```bash
git checkout -b feature/module-X-chapter-Y
# Example: feature/module-1-chapter-1.2
```

### Add New Chapter

1. **Create Markdown File**: `textbook/docs/module-X/Y.Z-chapter-name.md`

2. **Use 8-Section Template**:
   ```markdown
   ---
   id: chapter-id
   title: Chapter Title
   difficulty: beginner | intermediate | advanced
   ---

   # Chapter Title

   ## 1. Learning Objectives
   - Objective 1
   - Objective 2
   ...

   ## 2. Prerequisites
   - Prerequisite 1
   ...

   ## 3. Conceptual Overview
   [Theory and background]

   ## 4. Hands-On Tutorial
   [Step-by-step guide]

   ## 5. Worked Example
   [Complete solution with explanation]

   ## 6. Exercises
   ### Exercise 1 (Basic)
   ### Exercise 2 (Intermediate)
   ### Exercise 3 (Challenge)

   ## 7. Troubleshooting
   [Common errors and solutions]

   ## 8. References
   [APA citations]
   ```

3. **Add Code Examples** to `code-examples/module-X/`:
   ```
   code-examples/module-1-ros2/talker_listener/
   ├── README.md
   ├── setup.sh
   ├── src/
   │   ├── talker.py
   │   └── listener.py
   └── tests/
       └── test_talker.py
   ```

### Validate Chapter

**Check Readability** (Flesch-Kincaid grade 10-14):
```bash
python scripts/content-generation/check_readability.py textbook/docs/module-X/Y.Z-chapter-name.md
```

**Expected Output**: `Flesch-Kincaid Grade: 12.3 ✓ PASS`

**Validate Citations** (APA format, <5 years, 50%+ official sources):
```bash
python scripts/content-generation/validate_citations.py textbook/docs/module-X/Y.Z-chapter-name.md
```

**Expected Output**:
```
Checking 15 citations...
✓ APA format valid
✓ Source dates within 5 years
✓ 60% from official sources (9/15)
✓ All URLs accessible
PASS
```

### Commit and Push

```bash
git add textbook/docs/module-X/Y.Z-chapter-name.md code-examples/module-X/
git commit -m "Add Chapter X.Y: Chapter Title

- Implements 8-section template
- Includes 3 code examples with tests
- Passes readability and citation validation"
git push origin feature/module-X-chapter-Y
```

### Open Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill PR template:
   ```markdown
   ## Chapter Summary
   Module X, Chapter Y: [Brief description]

   ## Validation Results
   - [ ] Flesch-Kincaid grade 10-14
   - [ ] 50%+ official sources
   - [ ] All code examples tested
   - [ ] 3 exercises (basic, intermediate, challenge)

   ## Checklist
   - [ ] 8 mandatory sections complete
   - [ ] Citations in APA format
   - [ ] Code examples in separate directory
   - [ ] README.md in code example directory
   ```

---

## 3. Testing Code Examples

### Navigate to Example Directory

```bash
cd code-examples/module-1-ros2/talker_listener
```

### Run Tests

**Python Examples** (pytest):
```bash
pytest tests/
```

**ROS 2 Examples** (colcon test - requires ROS 2 installed):
```bash
colcon test
```

**Expected Output**: `X passed in Ys`

### Verify Expected Output

Run example and compare to documented output in chapter:

```bash
python src/talker.py
```

**Expected Output** (from Chapter 1.1):
```
[INFO] [talker]: Publishing: 'Hello World: 0'
[INFO] [talker]: Publishing: 'Hello World: 1'
...
```

### Update Chapter if Output Differs

If actual output doesn't match documentation, update chapter Markdown and re-commit.

---

## 4. RAG Chatbot Local Testing

### Generate Chapter Embeddings

**One-Time Setup** (run after adding/updating chapters):
```bash
cd scripts/data-processing
python embed_chapters.py
```

**Expected Output**:
```
Processing 18 chapters...
Chunking Chapter 1.1 → 12 chunks
Embedding chunks → Qdrant upload
...
Total: 216 chunks embedded
```

### Test Chatbot Query

**Via API**:
```bash
curl -X POST http://localhost:8000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is a ROS 2 node?", "chapter_id": 1}'
```

**Expected Response**:
```json
{
  "answer": "A ROS 2 node is a process that performs computation...",
  "sources": ["1.1-nodes-topics-services", "https://docs.ros.org/..."],
  "confidence": 0.92,
  "response_time_ms": 1850
}
```

**Via Python Script**:
```python
import requests

response = requests.post(
    "http://localhost:8000/api/chatbot/query",
    json={"query": "How do I create a ROS 2 service?"}
)
print(response.json()["answer"])
```

### Inspect Response Quality

- **Sources**: Should reference relevant chapters
- **Confidence**: Should be >0.7 for good answers
- **Response Time**: Should be <3 seconds

If quality is low, check:
1. Are embeddings up-to-date? (re-run `embed_chapters.py`)
2. Is query too vague? (add more context)
3. Are retrieved chunks relevant? (check Qdrant query results)

---

## 5. Deployment

### Deploy Frontend (GitHub Pages)

**Automatic** (via GitHub Actions):
```bash
git push origin main
# GitHub Actions triggers:
# 1. npm run build
# 2. Deploy to gh-pages branch
# 3. Live at https://username.github.io/robotics-textbook/
```

**Manual**:
```bash
cd textbook
npm run build
npm run deploy
```

### Deploy Backend (Render)

1. **Connect GitHub Repo** to Render:
   - Go to https://dashboard.render.com/
   - Click "New +" → "Web Service"
   - Connect GitHub repo `robotics-textbook`

2. **Configure Service**:
   - Name: `robotics-textbook-api`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn src.main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables** (in Render dashboard):
   - `OPENAI_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `NEON_DATABASE_URL`

4. **Deploy**: Click "Create Web Service"
   - **Expected**: Deploys in 5-10 minutes
   - **Live URL**: `https://robotics-textbook-api.onrender.com`

### Verify Deployment

**Frontend**:
```bash
curl https://username.github.io/robotics-textbook/
# Should return HTML
```

**Backend**:
```bash
curl https://robotics-textbook-api.onrender.com/health
# Should return: {"status": "healthy"}
```

**Chatbot Integration**:
- Visit https://username.github.io/robotics-textbook/docs/module-1-ros2/1.1-nodes-topics-services
- Click chatbot widget
- Ask: "What is a ROS 2 node?"
- Should get response in <3 seconds

---

## Common Issues

### Issue 1: Docusaurus Build Fails

**Error**: `Error: Duplicate routes found`

**Solution**: Check for duplicate `id` fields in Markdown frontmatter. Each chapter must have unique ID.

---

### Issue 2: RAG Query Returns Empty Answer

**Error**: `"answer": "", "sources": []`

**Solution**:
1. Check embeddings exist in Qdrant: `curl $QDRANT_URL/collections/chapters`
2. Re-run `embed_chapters.py` to regenerate embeddings
3. Verify OpenAI API key is valid

---

### Issue 3: Code Example Tests Fail

**Error**: `ModuleNotFoundError: No module named 'rclpy'`

**Solution**: Install ROS 2 Humble or run tests in Docker:
```bash
docker build -f docker/ros2-gazebo.Dockerfile -t ros2-env .
docker run -v $(pwd)/code-examples:/code ros2-env pytest /code/module-1-ros2/talker_listener/tests/
```

---

## Next Steps

- **For Content Contributors**: Start with Module 1, Chapter 1.1 template
- **For Developers**: Review `plan.md` for system architecture
- **For Testers**: Run full validation suite: `./scripts/run_all_validations.sh`

**Need Help?** Open GitHub issue or contact maintainers.
