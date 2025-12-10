"""LLM service for generating chatbot responses using OpenAI."""
import time
from typing import List, Tuple, Optional, Dict
from openai import OpenAI

from src.config import settings
from src.api.models.chunk import ContentChunk


class LLMService:
    """Service for generating AI responses using OpenAI GPT models.

    Per research.md Decision 4: Uses GPT-3.5-turbo for response generation.
    Per FR-010: Responses must be grounded in retrieved chunks.
    Per FR-009: Detect and handle out-of-scope questions.
    """

    def __init__(self):
        """Initialize OpenAI client."""
        self.openai_client = OpenAI(api_key=settings.openai_api_key)
        self.model = "gpt-3.5-turbo"
        self.max_tokens = 500
        self.temperature = 0.7

    def generate_response(
        self,
        query: str,
        retrieved_chunks: List[ContentChunk],
        query_mode: str = "general",
        selected_text: Optional[str] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> Tuple[str, bool, int, str]:
        """Generate AI response grounded in retrieved context.

        Args:
            query: User's question
            retrieved_chunks: Relevant textbook chunks from vector search
            query_mode: "general" or "selected_text"
            selected_text: User-selected text (if query_mode is "selected_text")
            conversation_history: Previous messages for multi-turn context (T035, FR-008)

        Returns:
            Tuple of (response_text, is_out_of_scope, generation_time_ms, model_used)

        Raises:
            ValueError: If query is empty
            OpenAI API errors
        """
        if not query or not query.strip():
            raise ValueError("query cannot be empty")

        start_time = time.time()

        # Build context from retrieved chunks
        context = self._build_context(retrieved_chunks, selected_text)

        # Determine if query is in-scope based on retrieval quality
        is_out_of_scope = len(retrieved_chunks) == 0

        # Build system prompt
        system_prompt = self._build_system_prompt(is_out_of_scope)

        # Build user prompt
        user_prompt = self._build_user_prompt(query, context, query_mode, selected_text)

        # T035: Build messages array with conversation history (FR-008)
        messages = [{"role": "system", "content": system_prompt}]

        # Include previous conversation for multi-turn context
        if conversation_history:
            for msg in conversation_history[-5:]:  # Last 5 messages
                if msg.get("message_type") == "user":
                    messages.append({
                        "role": "user",
                        "content": msg.get("message_text", "")
                    })
                elif msg.get("message_type") == "chatbot":
                    messages.append({
                        "role": "assistant",
                        "content": msg.get("response_text", "")
                    })

        # Add current query
        messages.append({"role": "user", "content": user_prompt})

        # Call OpenAI Chat Completion API
        response = self.openai_client.chat.completions.create(
            model=self.model,
            messages=messages,
            max_tokens=self.max_tokens,
            temperature=self.temperature
        )

        generation_time_ms = int((time.time() - start_time) * 1000)

        response_text = response.choices[0].message.content.strip()
        model_used = response.model

        return response_text, is_out_of_scope, generation_time_ms, model_used

    def _build_context(
        self,
        chunks: List[ContentChunk],
        selected_text: Optional[str] = None
    ) -> str:
        """Build context string from retrieved chunks.

        Args:
            chunks: Retrieved textbook chunks
            selected_text: Optional selected text (for SELECTED_TEXT mode)

        Returns:
            Formatted context string
        """
        if not chunks and not selected_text:
            return "No relevant context found."

        context_parts = []

        if selected_text:
            context_parts.append(f"**Selected Text from Textbook:**\n{selected_text}\n")

        if chunks:
            context_parts.append("**Relevant Textbook Sections:**\n")
            for i, chunk in enumerate(chunks, 1):
                section_ref = f"{chunk.chapter}"
                if chunk.section:
                    section_ref += f" > {chunk.section}"

                context_parts.append(f"[{i}] {section_ref}")
                if chunk.page_number:
                    context_parts.append(f" (Page {chunk.page_number})")
                context_parts.append(f"\n{chunk.text}\n")

        return "\n".join(context_parts)

    def _build_system_prompt(self, is_out_of_scope: bool) -> str:
        """Build system prompt for OpenAI.

        Args:
            is_out_of_scope: Whether query is outside textbook scope

        Returns:
            System prompt string
        """
        if is_out_of_scope:
            return """You are a helpful teaching assistant for a robotics textbook.
The user's question appears to be outside the scope of the textbook content.
Politely inform them that their question is not covered in the textbook, and suggest:
1. Rephrasing their question to relate to robotics topics
2. Checking if they're looking for content in a specific chapter
3. General robotics resources if their question is related but not in this book

Be friendly and encouraging."""

        return """You are a helpful teaching assistant for a robotics textbook.
Your role is to answer student questions based ONLY on the provided textbook context.

Guidelines:
1. Answer questions directly and clearly using the textbook content
2. Reference specific sections and page numbers when citing information
3. If the textbook provides equations, code, or diagrams, mention them
4. If the question asks about something not in the provided context, say so
5. Keep answers concise but complete (2-4 paragraphs max)
6. Use technical terms from the textbook, but explain them if needed
7. DO NOT add information from outside the textbook context

Remember: You are helping students learn from THIS textbook, so ground all answers in the provided context."""

    def _build_user_prompt(
        self,
        query: str,
        context: str,
        query_mode: str,
        selected_text: Optional[str]
    ) -> str:
        """Build user prompt with query and context.

        Args:
            query: User's question
            context: Formatted textbook context
            query_mode: "general" or "selected_text"
            selected_text: Optional selected text

        Returns:
            User prompt string
        """
        if query_mode == "selected_text" and selected_text:
            prompt = f"""I'm reading this section of the textbook:

{context}

My question about this text: {query}

Please answer based on the textbook content provided above."""
        else:
            prompt = f"""Context from the textbook:

{context}

Student question: {query}

Please provide a clear answer based on the textbook content above. Include section and page references when possible."""

        return prompt

    def detect_out_of_scope(
        self,
        query: str,
        max_retrieval_score: float
    ) -> bool:
        """Determine if query is outside textbook scope (FR-009).

        Args:
            query: User's question
            max_retrieval_score: Highest similarity score from vector search

        Returns:
            True if query is out of scope, False otherwise
        """
        # Simple heuristic: if best match has very low score, likely out of scope
        OUT_OF_SCOPE_THRESHOLD = 0.3

        if max_retrieval_score < OUT_OF_SCOPE_THRESHOLD:
            return True

        # Additional heuristics could be added here:
        # - Check for keywords completely unrelated to robotics
        # - Use a classifier model
        # - Check query length and complexity

        return False

    def health_check(self) -> bool:
        """Check if OpenAI API is accessible.

        Returns:
            True if healthy, False otherwise
        """
        try:
            # Simple test: list available models (lightweight call)
            self.openai_client.models.list()
            return True
        except Exception:
            return False
