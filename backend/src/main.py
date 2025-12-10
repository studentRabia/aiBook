"""
FastAPI application entry point for RAG chatbot.
Sets up CORS middleware, health endpoint, and API routes.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.api.routes import health, chat, sessions

app = FastAPI(
    title="RAG Chatbot API",
    description="Retrieval-Augmented Generation chatbot for robotics textbook",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(sessions.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "RAG Chatbot API",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
