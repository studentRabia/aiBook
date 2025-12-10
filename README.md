# Physical AI & Humanoid Robotics Textbook

An interactive, AI-native textbook covering ROS 2, digital twins, NVIDIA Isaac, and Vision-Language-Action (VLA) integration for humanoid robotics.

## 📚 Content Modules

1. **Module 1: ROS 2 Fundamentals** - Nodes, topics, services, Python-ROS bridge, URDF, controllers
2. **Module 2: Digital Twin (Gazebo & Unity)** - Physics simulation, rendering, sensor simulation, custom environments
3. **Module 3: NVIDIA Isaac** - Synthetic data generation, Isaac ROS perception, Nav2 for bipedal navigation
4. **Module 4: Vision-Language-Action (VLA)** - Multimodal learning, command understanding, sim-to-real transfer
5. **Module 5: Capstone Project** - Full humanoid system integration (pickup-and-place with VLA control)

## 🚀 Quick Start

For detailed setup instructions, see **[Developer Quickstart Guide](specs/001-robotics-textbook/quickstart.md)**.

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.11+ ([download](https://www.python.org/downloads/))
- **Docker** ([download](https://www.docker.com/get-started))
- **Git** ([download](https://git-scm.com/downloads))

### Installation

```bash
# Clone repository
git clone https://github.com/username/robotics-textbook.git
cd robotics-textbook

# Install frontend (Docusaurus)
cd textbook
npm install
npm start  # Visit http://localhost:3000

# Install backend (FastAPI)
cd ../backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload  # Visit http://localhost:8000/docs
```

## 🤖 Features

- **18 Chapters** across 5 modules with hands-on tutorials
- **100+ Code Examples** tested on Ubuntu 22.04 with ROS 2 Humble
- **RAG Chatbot** for context-aware Q&A (FastAPI + Qdrant + OpenAI)
- **Interactive Simulations** with Gazebo, Unity, and NVIDIA Isaac Sim
- **APA Citations** with 50%+ from official documentation
- **Reproducible Code** with Docker containers and test scripts

## 📖 Documentation

- **[Specification](specs/001-robotics-textbook/spec.md)** - Feature requirements and user stories
- **[Implementation Plan](specs/001-robotics-textbook/plan.md)** - Technical architecture and strategy
- **[Developer Quickstart](specs/001-robotics-textbook/quickstart.md)** - Contribution workflow
- **[API Contracts](specs/001-robotics-textbook/contracts/)** - OpenAPI specifications

## 🧪 Testing

```bash
# Content validation
python scripts/content-generation/check_readability.py textbook/docs/module-1-ros2/1.1-nodes-topics-services.md
python scripts/content-generation/validate_citations.py textbook/docs/module-1-ros2/1.1-nodes-topics-services.md

# Code examples
pytest code-examples/module-1-ros2/talker_listener/tests/

# Backend API
cd backend
pytest
```

## 🌐 Deployment

- **Frontend**: GitHub Pages (https://username.github.io/robotics-textbook/)
- **Backend**: Render Free Tier (https://robotics-textbook-api.onrender.com)

## 📝 License

- **Content**: CC BY-SA 4.0 (Creative Commons Attribution-ShareAlike)
- **Code Examples**: MIT License (see LICENSE)

## 🤝 Contributing

See [Developer Quickstart](specs/001-robotics-textbook/quickstart.md) for contribution workflow.

## 📧 Contact

For questions or feedback, open a GitHub issue or contact maintainers.
