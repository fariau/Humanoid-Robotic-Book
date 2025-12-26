import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_server():
    """Run the unified FastAPI server with both RAG and Auth functionality"""
    print("Starting Unified Textbook RAG & Auth API server...")
    print("Make sure you have set the required environment variables:")
    print("- COHERE_API_KEY")
    print("- QDRANT_URL")
    print("- QDRANT_API_KEY")
    print("\nServer will be available at http://localhost:3025")
    print("Authentication endpoints:")
    print("- Register: POST /auth/register")
    print("- Login: POST /auth/login")
    print("- Profile: GET /auth/profile")
    print("\nRAG endpoints:")
    print("- Query: POST /api/rag/query")

    uvicorn.run(
        "unified_server_final:app",
        host="0.0.0.0",
        port=3025,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    run_server()