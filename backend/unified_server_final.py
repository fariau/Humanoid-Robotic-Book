from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import os
import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv
import logging
import sqlite3
import hashlib
import secrets
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the main FastAPI app
app = FastAPI(title="Unified Textbook RAG & Auth API", description="API for RAG-based textbook queries and authentication")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Cohere client
cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

# Initialize Qdrant client
qdrant_client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

# Database setup for authentication
def init_auth_db():
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            software_background TEXT DEFAULT 'Beginner',
            has_nvidia_rtx_gpu BOOLEAN DEFAULT 0,
            has_jetson_kit BOOLEAN DEFAULT 0,
            has_robotics_experience BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

# Initialize database
init_auth_db()

# Pydantic models for authentication
class UserRegistration(BaseModel):
    email: str
    password: str
    name: str
    software_background: Optional[str] = "Beginner"
    has_nvidia_rtx_gpu: Optional[bool] = False
    has_jetson_kit: Optional[bool] = False
    has_robotics_experience: Optional[bool] = False

class UserLogin(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    message: str
    user_id: Optional[int] = None
    token: Optional[str] = None

# Pydantic models for RAG
class RAGQueryRequest(BaseModel):
    query: str
    context: Optional[dict] = {}
    language: Optional[str] = "en"

class Source(BaseModel):
    chapterId: str
    chapterTitle: str
    section: str
    similarityScore: float

class RAGQueryResponse(BaseModel):
    response: str
    sources: List[Source]
    queryId: Optional[str] = None

# Helper functions for authentication
def hash_password(password: str) -> str:
    """Hash a password with a random salt"""
    salt = secrets.token_hex(16)
    pwdhash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return f"{salt}${pwdhash.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify a password against its hash"""
    try:
        salt, pwdhash = stored_hash.split('$')
        pwdhash_bytes = bytes.fromhex(pwdhash)
        new_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return new_hash == pwdhash_bytes
    except:
        return False

def generate_token(user_id: int) -> str:
    """Generate a simple token (in production, use JWT)"""
    token_data = f"{user_id}:{datetime.utcnow().isoformat()}"
    return hashlib.sha256(token_data.encode()).hexdigest()

# Authentication routes
@app.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegistration):
    """Register a new user"""
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    try:
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (user_data.email,))
        existing_user = cursor.fetchone()

        if existing_user:
            raise HTTPException(status_code=400, detail="User with this email already exists")

        # Hash the password
        password_hash = hash_password(user_data.password)

        # Insert new user
        cursor.execute("""
            INSERT INTO users
            (email, password_hash, name, software_background, has_nvidia_rtx_gpu, has_jetson_kit, has_robotics_experience)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_data.email,
            password_hash,
            user_data.name,
            user_data.software_background,
            int(user_data.has_nvidia_rtx_gpu),
            int(user_data.has_jetson_kit),
            int(user_data.has_robotics_experience)
        ))

        user_id = cursor.lastrowid
        conn.commit()

        # Generate token
        token = generate_token(user_id)

        return AuthResponse(
            success=True,
            message="User registered successfully",
            user_id=user_id,
            token=token
        )

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")
    finally:
        conn.close()

@app.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    """Login a user"""
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    try:
        # Find user by email
        cursor.execute("SELECT id, password_hash FROM users WHERE email = ?", (credentials.email,))
        user = cursor.fetchone()

        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user_id, stored_hash = user

        # Verify password
        if not verify_password(credentials.password, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Generate token
        token = generate_token(user_id)

        return AuthResponse(
            success=True,
            message="Login successful",
            user_id=user_id,
            token=token
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
    finally:
        conn.close()

@app.get("/auth/profile")
async def get_profile():
    """Get user profile (for testing purposes, returns sample data)"""
    return {
        "message": "Profile endpoint - authentication would be verified here",
        "endpoints": {
            "register": "/auth/register (POST)",
            "login": "/auth/login (POST)"
        }
    }

# RAG routes
@app.get("/")
def read_root():
    return {"message": "Unified Textbook RAG & Auth API is running"}

@app.post("/api/rag/query", response_model=RAGQueryResponse)
async def rag_query(request: RAGQueryRequest):
    """
    Process a RAG query and return a response with sources
    """
    try:
        query = request.query
        context = request.context or {}
        language = request.language

        if not query:
            raise HTTPException(status_code=400, detail="Query is required")

        # Check if required environment variables are set
        cohere_api_key = os.getenv("COHERE_API_KEY")
        qdrant_url = os.getenv("QDRANT_URL")
        qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if not cohere_api_key:
            logger.error("COHERE_API_KEY is not set")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "COHERE_API_KEY is not configured",
                    "message": "Please set the COHERE_API_KEY environment variable"
                }
            )

        if not qdrant_url or not qdrant_api_key:
            logger.error("QDRANT_URL or QDRANT_API_KEY is not set")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "QDRANT configuration is not complete",
                    "message": "Please set both QDRANT_URL and QDRANT_API_KEY environment variables"
                }
            )

        # Create embedding for the query
        query_embedding = None
        try:
            query_embedding_response = cohere_client.embed(
                texts=[query],
                model="embed-english-v3.0",
                input_type="search_query"
            )
            query_embedding = query_embedding_response.embeddings[0]
        except Exception as embedding_error:
            logger.error(f"Error creating query embedding: {str(embedding_error)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to create query embedding",
                    "message": str(embedding_error)
                }
            )

        # Search in Qdrant for relevant chunks
        search_result = None
        try:
            search_result = qdrant_client.search(
                collection_name="chatbot_embedding",
                query_vector=query_embedding,
                limit=5  # Get top 5 most relevant chunks
            )
        except Exception as search_error:
            logger.error(f"Error searching in Qdrant: {str(search_error)}")
            logger.error("Search error details:", extra={
                "message": str(search_error),
                "stack": str(search_error.__traceback__) if search_error.__traceback__ else None,
                "name": type(search_error).__name__
            })
            # If Qdrant search fails, return a generic response instead of failing completely
            return RAGQueryResponse(
                response="I'm having trouble accessing the textbook database right now. Please make sure the RAG system has been properly set up with the textbook content.",
                sources=[],
                queryId=f"query_{hash(query) % 1000000}"
            )

        # Extract relevant text chunks and sources
        relevant_chunks = []
        for hit in search_result:
            relevant_chunks.append({
                "text": hit.payload.get("text", ""),
                "url": hit.payload.get("url", ""),
                "similarity_score": hit.score
            })

        # If we have relevant chunks, generate a response using Cohere
        response_text = "I couldn't find relevant information in the textbook to answer your question."
        sources = []

        if relevant_chunks:
            # Create context from the most relevant chunks
            context_text = "\n\n".join([chunk["text"] for chunk in relevant_chunks[:3]])  # Use top 3 chunks

            try:
                # Generate response using Cohere's chat functionality
                chat_response = cohere_client.chat(
                    message=f"Based on the following textbook content, please answer the question: \"{query}\"\n\nTextbook content:\n{context_text}\n\nQuestion: {query}",
                    max_tokens=500
                )

                response_text = chat_response.text
            except Exception as generation_error:
                logger.error(f"Error generating response: {str(generation_error)}")
                # Fallback to using the raw context if generation fails
                response_text = f"Based on the textbook content:\n\n{context_text[:500]}..."

        # Format sources from the relevant chunks
        for chunk in relevant_chunks:
            sources.append(Source(
                chapterId="unknown",  # This would need to be stored in the payload during ingestion
                chapterTitle="Textbook Content",
                section=chunk["url"].split("/")[-1] or "Section",
                similarityScore=chunk["similarity_score"]
            ))

        # Return the response according to the API contract
        return RAGQueryResponse(
            response=response_text,
            sources=sources,
            queryId=f"query_{hash(query) % 1000000}"
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as error:
        logger.error(f"Unexpected error in RAG API: {str(error)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Internal server error",
                "message": str(error)
            }
        )

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3025)