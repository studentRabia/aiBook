"""ContentChunk model for textbook content stored in Qdrant."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


class ContentChunk(BaseModel):
    """Textbook content chunk with embedding for semantic search.

    Per data-model.md: Represents a segment of textbook content stored in
    Qdrant vector database for semantic retrieval (512 tokens, 1024-dim embedding).
    """

    # Identifiers
    id: str = Field(..., description="UUID for chunk")
    textbook_id: str = Field(..., description="ID of source textbook")

    # Content
    text: str = Field(..., min_length=1, max_length=4000, description="Actual chunk text (512 tokens max)")
    embedding: List[float] = Field(..., description="1024-dim vector from text-embedding-3-small")

    # Metadata for citations (FR-005)
    chapter: str = Field(..., max_length=200, description='e.g., "Chapter 3: Kinematics"')
    section: Optional[str] = Field(None, description='e.g., "3.2 Inverse Kinematics"')
    subsection: Optional[str] = Field(None, description='e.g., "3.2.1 Analytical Solutions"')
    heading_path: str = Field(..., description='Full path: "Ch3 > 3.2 > 3.2.1"')
    page_number: Optional[int] = Field(None, description="Page number in original book")

    # Chunk metadata
    chunk_index: int = Field(..., ge=0, description="Sequential index in document")
    prev_chunk_id: Optional[str] = Field(None, description="ID of previous chunk (for overlap context)")
    next_chunk_id: Optional[str] = Field(None, description="ID of next chunk")

    # Content type flags
    contains_equation: bool = Field(False, description="True if chunk has LaTeX math")
    contains_code: bool = Field(False, description="True if chunk has code blocks")
    contains_table: bool = Field(False, description="True if chunk has tables")

    # Timestamps
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    @field_validator("embedding")
    @classmethod
    def validate_embedding_dims(cls, v: List[float]) -> List[float]:
        """Validate embedding has exactly 1024 dimensions per research.md Decision 3."""
        if len(v) != 1024:
            raise ValueError(f"Embedding must have exactly 1024 dimensions, got {len(v)}")
        return v

    @field_validator("heading_path")
    @classmethod
    def validate_heading_path_format(cls, v: str) -> str:
        """Validate heading_path follows 'Chapter > Section > Subsection' format."""
        if not v or ">" not in v:
            raise ValueError("heading_path must follow format 'Ch3 > 3.2 > 3.2.1'")
        return v
