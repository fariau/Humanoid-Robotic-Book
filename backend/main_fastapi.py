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

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the FastAPI app
app = FastAPI(title="Textbook RAG API", description="API for RAG-based textbook queries")

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

# Define request and response models
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

@app.get("/")
def read_root():
    return {"message": "Textbook RAG API is running"}

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)