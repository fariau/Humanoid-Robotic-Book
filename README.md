# Physical AI & Humanoid Robotics Textbook

A comprehensive Docusaurus-based textbook on Physical AI and Humanoid Robotics with integrated RAG chatbot functionality.

## Features

- **13 Comprehensive Chapters**: Complete textbook on Physical AI & Humanoid Robotics
- **Interactive Content**: Code examples, diagrams, and exercises
- **Multilingual Support**: English and Urdu with toggle functionality
- **Hardware Personalization**: Content adapts based on user's hardware profile
- **RAG Chatbot**: Retrieval-Augmented Generation chatbot with OpenAI and Qdrant
- **Selected-Text Queries**: Ask questions about highlighted text on any page

## Chapters

1. Introduction to Physical AI & Humanoid Robotics
2. ROS 2 Fundamentals
3. Gazebo Simulation Environment
4. NVIDIA Isaac Platform
5. Vision Language Action (VLA) Models
6. Conversational Robotics
7. Hardware Integration
8. Motion Planning & Control
9. Perception Systems
10. Learning & Adaptation
11. Safety & Ethics in Robotics
12. Deployment & Optimization
13. Capstone: Autonomous Humanoid Project

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

## Running the Application

### Start the development server:
```bash
npm start
```

### Build for production:
```bash
npm run build
```

## RAG System Setup

The RAG (Retrieval-Augmented Generation) system uses OpenAI and Qdrant to provide intelligent answers based on the textbook content.

### 1. Install backend dependencies:
```bash
npm install
```

### 2. Configure environment variables:
Create a `.env` file with:
```
QDRANT_URL=your-qdrant-cloud-url
QDRANT_API_KEY=your-qdrant-api-key
OPENAI_API_KEY=your-openai-api-key
PORT=3001
```

### 3. Ingest textbook content:
```bash
npm run ingest
# or
npm run rag:ingest
```

### 4. Start the RAG API server:
```bash
node backend/server.js
```

### 5. Run the Docusaurus site:
```bash
npm start
```

## Deployment

### Deploy to GitHub Pages:
```bash
npm run deploy
```

## Project Structure

```
docs/                    # Textbook content (13 chapters)
src/components/         # React components (including RAG chatbot)
backend/               # RAG system backend
  └── rag/            # Ingestion and query logic
backend/server.js     # Express API server
```

## Technologies Used

- **Docusaurus**: Static site generator
- **React**: Frontend components
- **OpenAI**: Language model for responses
- **Qdrant**: Vector database for content retrieval
- **Node.js**: Backend services
- **Express**: API server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.