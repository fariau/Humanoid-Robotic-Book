# RAG System for Physical AI & Humanoid Robotics Textbook

This backend system implements a Retrieval-Augmented Generation (RAG) system for the Physical AI & Humanoid Robotics textbook using OpenAI and Qdrant.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
QDRANT_URL=your-qdrant-cloud-url
QDRANT_API_KEY=your-qdrant-api-key
OPENAI_API_KEY=your-openai-api-key
PORT=3001
```

## Running the System

### 1. Ingest Content
First, ingest all textbook content into the vector database:

```bash
npm run ingest
# or
npm run rag:ingest
```

This will:
- Read all MDX files from the `docs/` directory
- Extract text content (excluding frontmatter and code blocks)
- Create embeddings using OpenAI
- Store in Qdrant vector database

### 2. Start the API Server
Start the RAG API server:

```bash
node backend/server.js
```

The server will be available at `http://localhost:3001`

### 3. Use the Chatbot
The chatbot is integrated into the Docusaurus site. When you run the Docusaurus site with `npm start`, it will connect to the backend server.

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/query` - Query the RAG system
  - Request body: `{ "question": "your question", "selectedText": "optional selected text" }`
  - Response: `{ "answer": "answer", "sources": [...] }`

## Architecture

- `backend/rag/ingestion.js` - Content ingestion system
- `backend/rag/query.js` - Query and retrieval system
- `backend/server.js` - Express API server
- `src/components/RAGChatbot/index.js` - Frontend chatbot component