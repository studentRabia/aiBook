# API Contracts for Physical AI & Humanoid Robotics Textbook

This directory contains OpenAPI 3.0 specifications for all REST APIs used by the textbook platform.

## API Endpoints

### 1. Chatbot API (`chatbot-api.openapi.yaml`)
- **Purpose**: RAG-powered Q&A system for student queries
- **Base URL**: `https://robotics-textbook-api.onrender.com/api`
- **Endpoints**:
  - `POST /chatbot/query`: Submit natural language question, get answer with sources

### 2. User Profile API (`user-profile-api.openapi.yaml`)
- **Purpose**: User authentication, background questionnaire, progress tracking
- **Base URL**: `https://robotics-textbook-api.onrender.com/api`
- **Endpoints**:
  - `POST /user/profile`: Create user profile with background
  - `PUT /user/progress`: Update chapter completion status

### 3. Content API (`content-api.openapi.yaml`)
- **Purpose**: Chapter metadata, personalization data
- **Base URL**: `https://robotics-textbook-api.onrender.com/api`
- **Endpoints**:
  - `GET /content/chapters`: List all chapters with metadata

## Testing

Use Postman or curl to test APIs locally:

```bash
# Test chatbot query
curl -X POST http://localhost:8000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is a ROS 2 node?"}'

# Test user profile creation
curl -X POST http://localhost:8000/api/user/profile \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "background": {"prior_ros_experience": false, "robotics_level": "beginner", "programming_languages": ["Python"]}}'
```

## Implementation

- **Backend**: FastAPI (Python 3.11+)
- **Validation**: Pydantic models for request/response schemas
- **Documentation**: Auto-generated Swagger UI at `/docs`

## Full Specifications

See individual `.openapi.yaml` files for complete API specifications with all request/response schemas, error codes, and examples. These specifications are referenced in `plan.md` Section "Phase 1: Design & Contracts".
