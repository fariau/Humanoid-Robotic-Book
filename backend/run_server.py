import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_server():
    """Run the FastAPI server"""
    print("Starting Textbook RAG API server...")
    print("Make sure you have set the required environment variables:")
    print("- COHERE_API_KEY")
    print("- QDRANT_URL")
    print("- QDRANT_API_KEY")
    print("\nServer will be available at http://localhost:3000")

    uvicorn.run(
        "main_fastapi:app",
        host="0.0.0.0",
        port=3000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    run_server()