# Data Model: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-10
**Feature**: 001-robotics-textbook
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the data entities for the textbook content system (Modules, Chapters, Code Examples, Exercises) and RAG chatbot system (User Profiles, User Queries). All entities are designed to support the constitution principles: accuracy, clarity, reproducibility, interactivity, comprehensive coverage, and citation standards.

## Content Entities

### 1. Module

**Purpose**: Represents a major topic area in the curriculum (e.g., "ROS 2 Fundamentals", "Digital Twins")

**Fields**:
- `id` (integer, PK): Unique module identifier (1-5)
- `title` (string, max 100 chars): Module display name
- `description` (text): 2-3 sentence overview of module purpose
- `order` (integer): Sequential position in curriculum (1-5)
- `prerequisites` (array of integers): Module IDs that must be completed first (e.g., Module 2 requires Module 1)
- `chapters` (array of integers): Chapter IDs belonging to this module
- `estimated_hours` (integer): Total time to complete all chapters
- `state` (enum): Draft | Published | Archived

**Relationships**:
- Module 1:N Chapters (one module contains 3-4 chapters)

**Validation Rules**:
- `order` must be unique across all modules
- `prerequisites` must reference existing Module IDs
- `chapters` must contain 3-4 Chapter IDs (per specification)
- Sequential ordering enforced: Module N cannot be accessed until Module N-1 completed (checked via user progress)

**State Transitions**:
- Draft → Published (all chapters published, manual approval)
- Published → Archived (module deprecated, new version released)

**Example**:
```json
{
  "id": 1,
  "title": "The Robotic Nervous System (ROS 2)",
  "description": "Learn the middleware powering modern robots. Master ROS 2 nodes, topics, services, and URDF for humanoid control.",
  "order": 1,
  "prerequisites": [],
  "chapters": [1, 2, 3, 4],
  "estimated_hours": 8,
  "state": "Published"
}
```

---

### 2. Chapter

**Purpose**: A single learning unit (30-45 minute hands-on tutorial) with structured content

**Fields**:
- `id` (integer, PK): Unique chapter identifier (1-18)
- `module_id` (integer, FK → Module.id): Parent module
- `title` (string, max 150 chars): Chapter display name
- `slug` (string): URL-friendly identifier (e.g., "1.1-nodes-topics-services")
- `content_path` (string): File path to Markdown content (e.g., "textbook/docs/module-1-ros2/1.1-nodes-topics-services.md")
- `difficulty` (enum): beginner | intermediate | advanced
- `learning_objectives` (array of strings): 3-5 measurable outcomes (e.g., "Create a ROS 2 node in Python")
- `prerequisites` (array of integers): Chapter IDs that must be completed first
- `estimated_time_minutes` (integer): Time to complete (30-60 minutes)
- `order_in_module` (integer): Sequential position within module (1-4)
- `flesch_kincaid_grade` (float): Readability score (must be 10-14)
- `official_source_percentage` (float): % of citations from official docs (must be ≥0.5)
- `code_examples` (array of integers): CodeExample IDs referenced in chapter
- `exercises` (array of integers): Exercise IDs for practice
- `state` (enum): Draft | Review | Published

**Relationships**:
- Chapter N:1 Module (each chapter belongs to one module)
- Chapter 1:N CodeExamples (chapter contains multiple code examples)
- Chapter 1:N Exercises (chapter has 3 exercises: basic, intermediate, challenge)

**Validation Rules**:
- `content_path` must exist and contain valid Markdown
- Must have 8 mandatory sections: Learning Objectives, Prerequisites, Conceptual Overview, Hands-On Tutorial, Worked Example, Exercises, Troubleshooting, References (validated via regex)
- `flesch_kincaid_grade` must be 10-14 (calculated via textstat library)
- `official_source_percentage` must be ≥0.5 (validated via citation checker script)
- `learning_objectives` must have 3-5 items
- `code_examples` must have at least 1 item
- `exercises` must have exactly 3 items (basic, intermediate, challenge)

**State Transitions**:
- Draft → Review (content written, automated validation passed)
- Review → Published (manual review approved, all code examples tested)
- Review → Draft (validation failed, need revisions)

**Example**:
```json
{
  "id": 1,
  "module_id": 1,
  "title": "Introduction to ROS 2 Nodes, Topics, and Services",
  "slug": "1.1-nodes-topics-services",
  "content_path": "textbook/docs/module-1-ros2/1.1-nodes-topics-services.md",
  "difficulty": "beginner",
  "learning_objectives": [
    "Explain the ROS 2 computational graph architecture",
    "Create a simple ROS 2 node in Python using rclpy",
    "Publish and subscribe to topics using standard message types",
    "Call ROS 2 services for request-response communication"
  ],
  "prerequisites": [],
  "estimated_time_minutes": 45,
  "order_in_module": 1,
  "flesch_kincaid_grade": 12.3,
  "official_source_percentage": 0.65,
  "code_examples": [1, 2, 3],
  "exercises": [1, 2, 3],
  "state": "Published"
}
```

---

### 3. CodeExample

**Purpose**: Executable code snippet or full package demonstrating a concept

**Fields**:
- `id` (integer, PK): Unique code example identifier
- `chapter_id` (integer, FK → Chapter.id): Parent chapter
- `title` (string, max 100 chars): Example name (e.g., "Talker-Listener ROS 2 Nodes")
- `description` (text): 1-2 sentences explaining what code demonstrates
- `language` (enum): Python | C++ | Bash | YAML
- `code` (text): Full code content (for inline examples <50 LOC)
- `repo_path` (string): Path to code in repository (e.g., "code-examples/module-1-ros2/talker_listener/")
- `test_command` (string): Command to run tests (e.g., "pytest tests/test_talker.py")
- `expected_output` (text): Sample output for verification
- `license` (enum): BSD-3-Clause | Apache-2.0
- `dependencies` (array of strings): Required packages (e.g., ["rclpy", "std_msgs"])
- `state` (enum): Draft | Tested | Published

**Relationships**:
- CodeExample N:1 Chapter (each example belongs to one chapter)

**Validation Rules**:
- `code` OR `repo_path` must be present (not both for large examples)
- If `repo_path` provided, directory must exist and contain README.md
- `test_command` must pass in CI (exit code 0)
- `license` must be BSD-3 (ROS 2 code) or Apache-2.0 (Isaac code)
- `dependencies` must be installable via pip/apt

**State Transitions**:
- Draft → Tested (automated tests passed in CI)
- Tested → Published (manual verification of expected output)

**Example**:
```json
{
  "id": 1,
  "chapter_id": 1,
  "title": "Simple Talker Node (Publisher)",
  "description": "ROS 2 node that publishes 'Hello World' messages to a topic every second.",
  "language": "Python",
  "code": null,
  "repo_path": "code-examples/module-1-ros2/talker_listener/src/talker.py",
  "test_command": "pytest code-examples/module-1-ros2/talker_listener/tests/test_talker.py",
  "expected_output": "[INFO] [talker]: Publishing: 'Hello World: 0'\n[INFO] [talker]: Publishing: 'Hello World: 1'",
  "license": "BSD-3-Clause",
  "dependencies": ["rclpy", "std_msgs"],
  "state": "Tested"
}
```

---

### 4. Exercise

**Purpose**: Practice problem for students with starter code and solution

**Fields**:
- `id` (integer, PK): Unique exercise identifier
- `chapter_id` (integer, FK → Chapter.id): Parent chapter
- `title` (string, max 100 chars): Exercise name
- `description` (text): Problem statement and requirements
- `difficulty` (enum): basic | intermediate | challenge
- `starter_code_path` (string): Path to starter code (students begin here)
- `solution_path` (string): Path to complete solution (in `solutions` branch)
- `hints` (array of strings): Graduated hints for students (3-5 hints)
- `estimated_time_minutes` (integer): Time to complete (15-60 minutes)
- `learning_objective` (string): What skill this exercise reinforces
- `state` (enum): Draft | Published

**Relationships**:
- Exercise N:1 Chapter (each exercise belongs to one chapter)

**Validation Rules**:
- `starter_code_path` must exist and compile/run without errors
- `solution_path` must exist in `solutions` branch
- `hints` must have 3-5 items, ordered by specificity (vague → specific)
- Each chapter must have exactly 1 basic, 1 intermediate, 1 challenge exercise

**State Transitions**:
- Draft → Published (starter code validated, solution tested)

**Example**:
```json
{
  "id": 1,
  "chapter_id": 1,
  "title": "Create a Listener Node",
  "description": "Write a ROS 2 subscriber node that listens to the '/chatter' topic and prints received messages to the console.",
  "difficulty": "basic",
  "starter_code_path": "code-examples/module-1-ros2/talker_listener/exercises/listener_starter.py",
  "solution_path": "code-examples/module-1-ros2/talker_listener/solutions/listener_solution.py",
  "hints": [
    "Remember to initialize the ROS 2 node with rclpy.init()",
    "Use rclpy.create_node() to create a node instance",
    "Subscribe to '/chatter' topic with String message type",
    "Implement a callback function to handle incoming messages",
    "Don't forget to call rclpy.spin() to keep the node running"
  ],
  "estimated_time_minutes": 20,
  "learning_objective": "Apply knowledge of ROS 2 subscribers to create a functional listener node",
  "state": "Published"
}
```

---

## User & RAG Entities

### 5. UserProfile

**Purpose**: Persistent user data for authentication, personalization, and progress tracking

**Fields**:
- `id` (UUID, PK): Unique user identifier
- `email` (string, unique): User email address
- `created_at` (timestamp): Account creation datetime
- `last_active` (timestamp): Last login/activity
- `background` (JSON object): User questionnaire responses
  - `prior_ros_experience` (boolean): Has used ROS 1 or ROS 2 before
  - `robotics_level` (enum): beginner | intermediate | advanced
  - `programming_languages` (array of strings): Known languages (e.g., ["Python", "C++"])
  - `learning_goal` (string): Why taking this course (e.g., "university course", "career change")
- `language_preference` (enum): en | ur (English or Urdu)
- `completed_chapters` (array of integers): Chapter IDs user has completed
- `current_module` (integer, FK → Module.id, nullable): Module user is currently studying
- `total_study_time_minutes` (integer): Cumulative time spent on platform
- `state` (enum): Active | Inactive

**Relationships**:
- UserProfile 1:N UserQueries (user asks multiple questions over time)

**Validation Rules**:
- `email` must be valid format and unique across all users
- `background` required for personalization features (bonus feature)
- `completed_chapters` must reference existing Chapter IDs
- `current_module` must reference existing Module ID or be null

**State Transitions**:
- Active (default after creation)
- Inactive (user deactivated account or 6+ months no activity)

**Privacy Considerations**:
- Store only essential data (email, background, progress)
- No PII beyond email
- Users can request data export or deletion (GDPR compliance)

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.com",
  "created_at": "2025-12-10T10:00:00Z",
  "last_active": "2025-12-10T15:30:00Z",
  "background": {
    "prior_ros_experience": false,
    "robotics_level": "beginner",
    "programming_languages": ["Python", "JavaScript"],
    "learning_goal": "university course"
  },
  "language_preference": "en",
  "completed_chapters": [1, 2, 3],
  "current_module": 1,
  "total_study_time_minutes": 180,
  "state": "Active"
}
```

---

### 6. UserQuery

**Purpose**: RAG chatbot query log for analytics, feedback, and personalization

**Fields**:
- `id` (UUID, PK): Unique query identifier
- `user_id` (UUID, FK → UserProfile.id, nullable): User who asked (null for anonymous)
- `query_text` (text, max 500 chars): Natural language question
- `selected_context` (text, nullable): User-highlighted text for context
- `chapter_id` (integer, FK → Chapter.id, nullable): Chapter user was viewing
- `response_text` (text): RAG-generated answer
- `response_sources` (array of strings): Chapter slugs/URLs used to generate answer
- `confidence_score` (float, 0-1): RAG model confidence in answer quality
- `response_time_ms` (integer): Time to generate answer (target: <3000)
- `created_at` (timestamp): Query submission datetime
- `feedback` (enum, nullable): helpful | not_helpful | null (user rating)
- `feedback_comment` (text, nullable): Optional user explanation of feedback
- `state` (enum): Answered | Pending | Failed

**Relationships**:
- UserQuery N:1 UserProfile (many queries belong to one user)
- UserQuery N:1 Chapter (query asked while viewing specific chapter)

**Validation Rules**:
- `query_text` must be non-empty and ≤500 characters
- `response_time_ms` should be <3000 (logged for performance monitoring)
- `response_sources` must reference valid chapters or external URLs
- `confidence_score` must be 0-1 (calculated by RAG model)

**State Transitions**:
- Pending (query submitted, awaiting RAG response)
- Answered (response generated successfully)
- Failed (RAG error, timeout, or invalid query)

**Analytics Use Cases**:
- Identify common questions → Add to FAQs or improve chapter clarity
- Track response times → Optimize RAG pipeline
- Monitor confidence scores → Flag low-confidence answers for manual review
- User feedback → Improve retrieval relevance

**Example**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "query_text": "How do I create a ROS 2 service client in Python?",
  "selected_context": "Services provide request-response communication between nodes",
  "chapter_id": 1,
  "response_text": "To create a ROS 2 service client in Python, use rclpy.create_client(). First, import the service type (e.g., from example_interfaces.srv import AddTwoInts). Then create a client with: client = node.create_client(AddTwoInts, 'add_two_ints'). Wait for the service with client.wait_for_service(), create a request object, and call client.call_async(request). See Chapter 1.1 Section 4 for a complete example.",
  "response_sources": ["1.1-nodes-topics-services", "https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Service-And-Client.html"],
  "confidence_score": 0.92,
  "response_time_ms": 1850,
  "created_at": "2025-12-10T15:30:00Z",
  "feedback": "helpful",
  "feedback_comment": "Clear explanation with code example!",
  "state": "Answered"
}
```

---

## Entity Relationships Diagram

```
Module (1) ──────< (N) Chapter
                       │
                       ├──< (N) CodeExample
                       └──< (N) Exercise

UserProfile (1) ──────< (N) UserQuery
                             │
                             └──> (1) Chapter (nullable)
```

---

## Database Schema (Neon Serverless Postgres)

**Tables**:
1. `modules` (stores Module entities)
2. `chapters` (stores Chapter entities with FK to modules)
3. `code_examples` (stores CodeExample entities with FK to chapters)
4. `exercises` (stores Exercise entities with FK to chapters)
5. `user_profiles` (stores UserProfile entities)
6. `user_queries` (stores UserQuery entities with FK to user_profiles and chapters)

**Indexes**:
- `chapters.module_id` (foreign key index)
- `code_examples.chapter_id` (foreign key index)
- `exercises.chapter_id` (foreign key index)
- `user_queries.user_id` (foreign key index)
- `user_queries.chapter_id` (foreign key index)
- `user_queries.created_at` (for analytics queries)

**Migrations**:
- Use Alembic (Python) for schema migrations
- Version control all migrations in `backend/migrations/`

---

## Content Storage (Git Repository)

**Markdown Content** (not in database):
- Chapter Markdown files stored in `textbook/docs/`
- Code examples stored in `code-examples/`
- Referenced by `content_path` and `repo_path` fields in database
- Database stores metadata only, content in Git for version control

**Vector Embeddings** (Qdrant):
- Chapter content chunked into 512-token segments
- Each chunk embedded with OpenAI text-embedding-3-small
- Stored in Qdrant with metadata (chapter_id, module_id, difficulty)
- Not in Postgres (vector search in Qdrant is more efficient)

---

## Next Steps

1. **Create OpenAPI Contracts**: Define REST APIs for chatbot, user profiles, content metadata (contracts/)
2. **Generate Quickstart Guide**: Developer onboarding documentation (quickstart.md)
3. **Initialize Postgres Schema**: Create tables with Alembic migrations
4. **Seed Sample Data**: Populate Module, Chapter entities for testing

**Dependencies for Implementation**:
- SQLAlchemy (Python ORM for Postgres)
- Alembic (database migrations)
- Pydantic (request/response validation)
- Qdrant Python Client (vector search)
