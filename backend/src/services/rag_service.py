"""
RAG Service for Physical AI & Humanoid Robotics Textbook
Handles document retrieval and answer generation using OpenAI + Qdrant
"""
import os
from typing import List, Dict, Optional
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
import hashlib
import time


class RAGService:
    """RAG service for textbook chatbot"""

    def __init__(self):
        """Initialize RAG service with OpenAI and Qdrant clients"""
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Qdrant setup
        qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if qdrant_api_key:
            self.qdrant_client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        else:
            # Local Qdrant without API key
            self.qdrant_client = QdrantClient(url=qdrant_url)

        self.collection_name = "textbook_chapters"
        self.embedding_model = "text-embedding-3-small"
        self.chat_model = "gpt-4-turbo-preview"

    def _get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI"""
        response = self.openai_client.embeddings.create(
            model=self.embedding_model,
            input=text
        )
        return response.data[0].embedding

    def query_chatbot(
        self,
        query: str,
        chapter_id: Optional[str] = None,
        selected_text: Optional[str] = None,
        top_k: int = 3
    ) -> Dict:
        """
        Query the RAG chatbot

        Args:
            query: User's question
            chapter_id: Optional chapter ID to scope retrieval
            selected_text: Optional text selected by user for context
            top_k: Number of relevant chunks to retrieve

        Returns:
            Dictionary with answer, sources, confidence, and response time
        """
        start_time = time.time()

        try:
            # Build context from selected text if provided
            context_prefix = ""
            if selected_text:
                context_prefix = f"Based on this selected text:\n\"{selected_text}\"\n\n"
                # Use selected text as primary context instead of vector search
                query_embedding = self._get_embedding(query)
                retrieved_chunks = []
            else:
                # Generate query embedding
                query_embedding = self._get_embedding(query)

                # Retrieve relevant chunks from Qdrant
                search_params = {
                    "collection_name": self.collection_name,
                    "query_vector": query_embedding,
                    "limit": top_k
                }

                # Add chapter filter if specified
                if chapter_id:
                    search_params["query_filter"] = Filter(
                        must=[
                            FieldCondition(
                                key="chapter_id",
                                match=MatchValue(value=chapter_id)
                            )
                        ]
                    )

                # Search Qdrant
                search_results = self.qdrant_client.search(**search_params)
                retrieved_chunks = [hit.payload.get("text", "") for hit in search_results]

            # Build context for GPT
            if retrieved_chunks:
                context = "\n\n".join([f"[Context {i+1}]: {chunk}" for i, chunk in enumerate(retrieved_chunks)])
            else:
                context = "No additional context available from the textbook."

            # Generate answer using GPT
            system_prompt = """You are a helpful teaching assistant for the Physical AI & Humanoid Robotics textbook.
Your role is to answer questions about ROS 2, Gazebo, Unity, NVIDIA Isaac, Vision-Language-Action models, and humanoid robotics.

Guidelines:
- Provide accurate, helpful answers based on the provided context
- If the context doesn't contain enough information, acknowledge this
- Use clear, educational language appropriate for students
- Include code examples when relevant
- Cite specific sections when referring to textbook content
"""

            user_prompt = f"""{context_prefix}Question: {query}

Context from textbook:
{context}

Please provide a clear, accurate answer based on the context above."""

            response = self.openai_client.chat.completions.create(
                model=self.chat_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )

            answer = response.choices[0].message.content

            # Calculate confidence score (simplified)
            confidence = 0.85 if retrieved_chunks else 0.5
            if selected_text:
                confidence = 0.9  # Higher confidence for selected text queries

            # Extract sources
            sources = []
            if chapter_id:
                sources.append(f"Chapter {chapter_id}")
            if selected_text:
                sources.append("Selected text")

            response_time_ms = int((time.time() - start_time) * 1000)

            return {
                "answer": answer,
                "sources": sources if sources else ["Textbook content"],
                "confidence": confidence,
                "response_time_ms": response_time_ms
            }

        except Exception as e:
            # Fallback response on error
            response_time_ms = int((time.time() - start_time) * 1000)
            return {
                "answer": f"I apologize, but I encountered an error processing your question. Please try again or rephrase your question. Error: {str(e)}",
                "sources": [],
                "confidence": 0.0,
                "response_time_ms": response_time_ms
            }

    def create_collection_if_not_exists(self):
        """Create Qdrant collection for textbook chapters if it doesn't exist"""
        try:
            collections = self.qdrant_client.get_collections().collections
            collection_names = [col.name for col in collections]

            if self.collection_name not in collection_names:
                self.qdrant_client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=1536,  # text-embedding-3-small dimension
                        distance=Distance.COSINE
                    )
                )
                print(f"Created collection: {self.collection_name}")
        except Exception as e:
            print(f"Error creating collection: {e}")


# Singleton instance
_rag_service = None

def get_rag_service() -> RAGService:
    """Get or create RAG service singleton"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
        _rag_service.create_collection_if_not_exists()
    return _rag_service
