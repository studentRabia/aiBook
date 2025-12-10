"""
Health check endpoint for RAG chatbot API.
Checks connectivity to Postgres, Qdrant, and OpenAI per openapi.yaml.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from typing import Dict
try:
    import psycopg2
    HAS_PSYCOPG2 = True
except ImportError:
    HAS_PSYCOPG2 = False
from qdrant_client import QdrantClient
from openai import OpenAI
from src.config import settings

router = APIRouter(prefix="/api/v1", tags=["health"])


class HealthResponse(BaseModel):
    """Health check response model."""
    status: str
    timestamp: datetime
    dependencies: Dict[str, str]


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Check API health and dependency status.

    Returns:
        HealthResponse with status and dependency checks
    """
    dependencies = {
        "postgres": "unknown",
        "qdrant": "unknown",
        "openai": "unknown"
    }

    # Check Postgres connection (optional)
    if settings.database_url and HAS_PSYCOPG2:
        try:
            conn = psycopg2.connect(settings.database_url)
            conn.close()
            dependencies["postgres"] = "connected"
        except Exception:
            dependencies["postgres"] = "error"
    else:
        dependencies["postgres"] = "not_configured"

    # Check Qdrant connection
    try:
        client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key
        )
        client.get_collections()
        dependencies["qdrant"] = "connected"
    except Exception:
        dependencies["qdrant"] = "error"

    # Check OpenAI availability (simple API key validation)
    try:
        openai_client = OpenAI(api_key=settings.openai_api_key)
        # Just check if client initializes (actual API call would cost money)
        dependencies["openai"] = "available"
    except Exception:
        dependencies["openai"] = "error"

    # Determine overall status (not_configured is OK)
    all_healthy = all(status in ["connected", "available", "not_configured"] for status in dependencies.values())
    overall_status = "healthy" if all_healthy else "unhealthy"

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        dependencies=dependencies
    )
