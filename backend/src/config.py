"""
Configuration management using Pydantic BaseSettings.
Loads environment variables for OpenAI, Qdrant, Postgres, and application settings.
"""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # OpenAI Configuration (required for chatbot)
    openai_api_key: str = "your-key-will-go-here"

    # Qdrant Cloud Configuration (optional, can run locally)
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: Optional[str] = None

    # Cohere API Configuration (optional, for future use)
    cohere_api_key: Optional[str] = None

    # Neon Postgres Configuration (optional)
    database_url: Optional[str] = None

    # Application Configuration
    environment: str = "development"
    log_level: str = "INFO"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:8080"]

    # Textbook Configuration
    textbook_id: str = "robotics-101"

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
