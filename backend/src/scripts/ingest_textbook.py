"""
Textbook content ingestion script for RAG chatbot.
Chunks textbook content using LangChain, generates embeddings with OpenAI, uploads to Qdrant.
Per research.md Decision 5: 512 tokens, 50 overlap, heading-hierarchy aware chunking.
Per research.md Decision 3: text-embedding-3-small with 1024 dimensions.
"""
import os
import uuid
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

load_dotenv()

# Initialize clients
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Configure text splitter (per research.md Decision 5)
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,  # tokens
    chunk_overlap=50,  # tokens
    separators=["\n## ", "\n### ", "\n\n", "\n", " ", ""],  # Heading-hierarchy aware
    length_function=len
)


def extract_metadata(text: str, filename: str) -> tuple[str, str | None]:
    """
    Extract chapter and section from markdown headings.

    Args:
        text: Chunk text content
        filename: Source file name

    Returns:
        Tuple of (chapter, section)
    """
    lines = text.split('\n')
    chapter = None
    section = None

    for line in lines:
        if line.startswith('# '):
            chapter = line[2:].strip()
        elif line.startswith('## '):
            section = line[3:].strip()
            break

    return chapter or filename, section


def ingest_file(filepath: Path, textbook_id: str = "robotics-101"):
    """
    Process a single markdown file and upload chunks to Qdrant.

    Args:
        filepath: Path to markdown file
        textbook_id: Identifier for textbook
    """
    print(f"Processing {filepath.name}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    filename = filepath.stem
    chunks = text_splitter.split_text(content)

    print(f"  Generated {len(chunks)} chunks")

    points = []
    for idx, chunk_text in enumerate(chunks):
        chapter, section = extract_metadata(chunk_text, filename)

        # Generate embedding with OpenAI text-embedding-3-small (1024 dims)
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk_text,
            dimensions=1024  # Per research.md Decision 3
        )
        embedding = response.data[0].embedding

        # Prepare Qdrant point
        point_id = str(uuid.uuid4())
        point = PointStruct(
            id=point_id,
            vector=embedding,
            payload={
                "text": chunk_text,
                "textbook_id": textbook_id,
                "chapter": chapter,
                "section": section,
                "chunk_index": idx,
                "filename": filename,
                "contains_equation": "$$" in chunk_text or "$" in chunk_text,
                "contains_code": "```" in chunk_text,
                "created_at": datetime.utcnow().isoformat()
            }
        )
        points.append(point)

        # Batch upload every 100 chunks to optimize API calls
        if len(points) >= 100:
            qdrant_client.upsert(
                collection_name="textbook_chunks",
                points=points
            )
            print(f"  Uploaded {len(points)} chunks")
            points = []

    # Upload remaining chunks
    if points:
        qdrant_client.upsert(
            collection_name="textbook_chunks",
            points=points
        )
        print(f"  Uploaded {len(points)} chunks")


def ingest_directory(directory: str | Path, textbook_id: str = "robotics-101"):
    """
    Ingest all markdown files from a directory.

    Args:
        directory: Path to textbook content directory
        textbook_id: Identifier for textbook
    """
    textbook_dir = Path(directory)

    if not textbook_dir.exists():
        print(f"❌ Directory not found: {textbook_dir}")
        return

    md_files = list(textbook_dir.glob("*.md"))

    if not md_files:
        print(f"⚠️  No markdown files found in {textbook_dir}")
        return

    print(f"Found {len(md_files)} markdown files")
    print(f"Textbook ID: {textbook_id}")
    print(f"Collection: textbook_chunks")
    print()

    for md_file in md_files:
        try:
            ingest_file(md_file, textbook_id)
        except Exception as e:
            print(f"  ❌ Error processing {md_file.name}: {e}")

    print()
    print("✅ Textbook ingestion complete")


if __name__ == "__main__":
    import sys

    # Default to textbook/content/ directory
    content_dir = sys.argv[1] if len(sys.argv) > 1 else "textbook/content"
    textbook_id = sys.argv[2] if len(sys.argv) > 2 else "robotics-101"

    ingest_directory(content_dir, textbook_id)
