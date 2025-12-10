"""
Initialize Qdrant vector database collection for textbook content.
Creates textbook_chunks collection with 1024-dim vectors, COSINE distance per research.md Decision 3.
"""
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import os
from dotenv import load_dotenv

load_dotenv()


def init_qdrant():
    """Create Qdrant collection for textbook embeddings."""

    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if not qdrant_url or not qdrant_api_key:
        raise ValueError("QDRANT_URL and QDRANT_API_KEY environment variables must be set")

    client = QdrantClient(
        url=qdrant_url,
        api_key=qdrant_api_key
    )

    collection_name = "textbook_chunks"

    try:
        # Check if collection already exists
        collections = client.get_collections().collections
        if any(col.name == collection_name for col in collections):
            print(f"ℹ️  Collection '{collection_name}' already exists")
            return

        print(f"Creating collection '{collection_name}'...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=1024,  # text-embedding-3-small dimensions
                distance=Distance.COSINE
            )
        )

        print(f"✅ Qdrant collection '{collection_name}' created successfully")
        print(f"   Vector dimensions: 1024")
        print(f"   Distance metric: COSINE")

    except Exception as e:
        print(f"❌ Error creating Qdrant collection: {e}")
        raise


if __name__ == "__main__":
    init_qdrant()
