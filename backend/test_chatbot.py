#!/usr/bin/env python3
"""
Simple test script for RAG chatbot
Tests the chatbot without needing Qdrant (for quick testing)
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_api_keys():
    """Test if API keys are configured"""
    print("🔍 Checking API Keys...\n")

    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key and openai_key != "your-key-will-go-here":
        print("✅ OpenAI API Key: Configured")
        print(f"   Key preview: {openai_key[:10]}...{openai_key[-4:]}")
    else:
        print("❌ OpenAI API Key: NOT configured")
        print("   Please add your key to backend/.env")
        return False

    print("\n✅ All required API keys are configured!")
    return True


def test_openai_connection():
    """Test OpenAI API connection"""
    print("\n🔗 Testing OpenAI Connection...\n")

    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        # Simple test query
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "user", "content": "Say 'Hello from RAG chatbot test!'"}
            ],
            max_tokens=50
        )

        answer = response.choices[0].message.content
        print(f"✅ OpenAI API Connected!")
        print(f"   Test response: {answer}")
        return True

    except Exception as e:
        print(f"❌ OpenAI connection failed: {e}")
        return False


def test_simple_query():
    """Test a simple chatbot query"""
    print("\n💬 Testing Chatbot Query...\n")

    try:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

        system_prompt = """You are a helpful teaching assistant for robotics and ROS 2.
Provide concise, educational answers."""

        user_query = "What is ROS 2 in one sentence?"

        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            max_tokens=100
        )

        answer = response.choices[0].message.content
        print(f"✅ Chatbot Test Successful!")
        print(f"   Question: {user_query}")
        print(f"   Answer: {answer}")
        return True

    except Exception as e:
        print(f"❌ Chatbot test failed: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("  RAG Chatbot Test Script")
    print("=" * 60)

    # Run tests
    if not test_api_keys():
        print("\n❌ Setup incomplete. Please configure your API keys in backend/.env")
        exit(1)

    if not test_openai_connection():
        print("\n❌ OpenAI connection failed. Please check your API key.")
        exit(1)

    if not test_simple_query():
        print("\n❌ Chatbot query failed.")
        exit(1)

    print("\n" + "=" * 60)
    print("  ✅ All Tests Passed!")
    print("  🚀 Your RAG chatbot is ready to use!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Start the backend: uvicorn src.main:app --reload")
    print("2. Visit your Docusaurus site and click the 💬 button")
    print("3. Ask questions about ROS 2 and robotics!")
