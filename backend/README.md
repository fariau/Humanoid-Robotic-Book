# Textbook RAG Backend

This backend system ingests content from the Humanoid Robotics textbook deployed at https://fariau.github.io/Humanoid-Robotic-Book/ and creates a vector database for RAG (Retrieval Augmented Generation) functionality.

## Features

- Fetches all pages from the deployed textbook website
- Extracts and cleans text content from each page
- Chunks text into manageable pieces
- Creates embeddings using Cohere
- Stores embeddings in Qdrant vector database

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables in a `.env` file:
   ```
   COHERE_API_KEY=your_cohere_api_key
   QDRANT_URL=your_qdrant_url
   QDRANT_API_KEY=your_qdrant_api_key
   ```

3. Run the ingestion:
   ```bash
   python main.py
   ```

## Architecture

The system follows this pipeline:
1. Get all URLs from the textbook website
2. Extract clean text from each URL
3. Chunk text into smaller pieces
4. Generate embeddings using Cohere
5. Create a Qdrant collection named "chatbot_embedding"
6. Store chunks with metadata in Qdrant