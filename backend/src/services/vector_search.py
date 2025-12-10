"""Vector search service for semantic retrieval from Qdrant."""
import time
from typing import List, Optional, Dict, Tuple
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from src.config import settings
from src.api.models.chunk import ContentChunk


class VectorSearchService:
    """Service for semantic search against textbook content in Qdrant.

    Per research.md Decision 3: Uses text-embedding-3-small (1024 dims) with COSINE distance.
    Per FR-003: Vector search is mandatory for all queries (except SELECTED_TEXT mode).
    """

    def __init__(self):
        """Initialize OpenAI and Qdrant clients."""
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        self.qdrant_client = QdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key
        )
        self.collection_name = "textbook_chunks"
        self.embedding_model = "text-embedding-3-small"
        self.embedding_dimensions = 1024

    def embed_query(self, query_text: str) -> List[float]:
        """Generate embedding for user query.

        Args:
            query_text: User's question

        Returns:
            1024-dimensional embedding vector

        Raises:
            OpenAI API errors
        """
        response = self.openai_client.embeddings.create(
            model=self.embedding_model,
            input=query_text,
            dimensions=self.embedding_dimensions
        )
        return response.data[0].embedding

    def search(
        self,
        query_text: str,
        top_k: int = 5,
        textbook_id: Optional[str] = None,
        chapter_filter: Optional[str] = None,
        min_score: float = 0.0
    ) -> Tuple[List[ContentChunk], List[float], int]:
        """Perform semantic search for relevant textbook chunks.

        Args:
            query_text: User's question
            top_k: Number of results to return (default 5)
            textbook_id: Filter by textbook ID (default from settings)
            chapter_filter: Optional chapter name filter
            min_score: Minimum similarity score threshold (0.0-1.0)

        Returns:
            Tuple of (chunks, scores, retrieval_time_ms)

        Raises:
            ValueError: If query_text is empty
            Qdrant API errors
        """
        if not query_text or not query_text.strip():
            raise ValueError("query_text cannot be empty")

        start_time = time.time()

        # Generate query embedding
        query_embedding = self.embed_query(query_text)

        # Build filters
        filter_conditions = []
        if textbook_id or settings.textbook_id:
            filter_conditions.append(
                FieldCondition(
                    key="textbook_id",
                    match=MatchValue(value=textbook_id or settings.textbook_id)
                )
            )
        if chapter_filter:
            filter_conditions.append(
                FieldCondition(
                    key="chapter",
                    match=MatchValue(value=chapter_filter)
                )
            )

        query_filter = Filter(must=filter_conditions) if filter_conditions else None

        # Execute vector search
        search_result = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            query_filter=query_filter,
            limit=top_k,
            score_threshold=min_score
        )

        retrieval_time_ms = int((time.time() - start_time) * 1000)

        # Convert Qdrant results to ContentChunk models
        chunks = []
        scores = []
        for hit in search_result:
            payload = hit.payload
            chunk = ContentChunk(
                id=payload["id"],
                textbook_id=payload["textbook_id"],
                text=payload["text"],
                embedding=[],  # Don't return full embedding in results (large payload)
                chapter=payload["chapter"],
                section=payload.get("section"),
                subsection=payload.get("subsection"),
                heading_path=payload["heading_path"],
                page_number=payload.get("page_number"),
                chunk_index=payload["chunk_index"],
                prev_chunk_id=payload.get("prev_chunk_id"),
                next_chunk_id=payload.get("next_chunk_id"),
                contains_equation=payload.get("contains_equation", False),
                contains_code=payload.get("contains_code", False),
                contains_table=payload.get("contains_table", False),
                created_at=payload["created_at"],
                updated_at=payload.get("updated_at", payload["created_at"])
            )
            chunks.append(chunk)
            scores.append(hit.score)

        return chunks, scores, retrieval_time_ms

    def search_with_selected_text(
        self,
        query_text: str,
        selected_text: str,
        top_k: int = 3
    ) -> Tuple[List[ContentChunk], List[float], int]:
        """Search for chunks similar to selected text (FR-007 SELECTED_TEXT mode).

        Args:
            query_text: User's question about the selected text
            selected_text: Text highlighted by user
            top_k: Number of results (reduced to 3 for selected text)

        Returns:
            Tuple of (chunks, scores, retrieval_time_ms)
        """
        # For selected text queries, embed the selected text itself
        # This helps find similar content in the textbook
        combined_query = f"{selected_text}\n\nQuestion: {query_text}"
        return self.search(query_text=combined_query, top_k=top_k)

    def get_chunk_by_id(self, chunk_id: str) -> Optional[ContentChunk]:
        """Retrieve a specific chunk by ID.

        Args:
            chunk_id: UUID of chunk

        Returns:
            ContentChunk if found, None otherwise
        """
        try:
            result = self.qdrant_client.retrieve(
                collection_name=self.collection_name,
                ids=[chunk_id]
            )
            if result:
                payload = result[0].payload
                return ContentChunk(
                    id=payload["id"],
                    textbook_id=payload["textbook_id"],
                    text=payload["text"],
                    embedding=[],
                    chapter=payload["chapter"],
                    section=payload.get("section"),
                    subsection=payload.get("subsection"),
                    heading_path=payload["heading_path"],
                    page_number=payload.get("page_number"),
                    chunk_index=payload["chunk_index"],
                    prev_chunk_id=payload.get("prev_chunk_id"),
                    next_chunk_id=payload.get("next_chunk_id"),
                    contains_equation=payload.get("contains_equation", False),
                    contains_code=payload.get("contains_code", False),
                    contains_table=payload.get("contains_table", False),
                    created_at=payload["created_at"],
                    updated_at=payload.get("updated_at", payload["created_at"])
                )
        except Exception:
            return None

    def health_check(self) -> bool:
        """Check if Qdrant connection and collection are healthy.

        Returns:
            True if healthy, False otherwise
        """
        try:
            collections = self.qdrant_client.get_collections()
            return any(c.name == self.collection_name for c in collections.collections)
        except Exception:
            return False
