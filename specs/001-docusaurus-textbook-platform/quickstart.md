# Quickstart Guide: Physical AI & Humanoid Robotics Textbook Platform

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+ for backend services
- Access to OpenAI API key
- Qdrant vector database (local or cloud)
- Neon PostgreSQL database

## Setup Instructions

### 1. Clone and Initialize
```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Install dependencies
cd docs
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `docs` directory:
```env
OPENAI_API_KEY=your_openai_api_key
NEON_DATABASE_URL=your_neon_database_url
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
```

### 3. Backend Services Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up authentication
# Configure Better-Auth with hardware profiling fields
```

### 4. Run Development Server
```bash
# From the docs directory
npm run start
```

## Key Components

### Content Structure
- Chapters are located in `docs/content/docs/`
- Each chapter follows the pattern: `/chapter-number-title/`
- MDX files contain content with React components

### Personalization Features
- The "Personalize to my hardware" button uses user's hardware profile
- Content blocks are conditionally rendered based on hardware specs
- Implementation uses React state and context API

### Language Toggle
- Urdu/English toggle implemented with Docusaurus i18n
- Separate content files for each language
- Language-specific routing and components

### RAG Chatbot
- Integration with OpenAI for natural language processing
- Qdrant for vector storage and similarity search
- Content ingestion pipeline for textbook materials

## Development Workflow

### Adding a New Chapter
1. Create a new directory in `docs/content/docs/`
2. Add an `index.mdx` file with the chapter content
3. Include required components: diagrams, code examples, exercises, quizzes
4. Update the sidebar configuration in `docusaurus.config.js`

### Content Personalization
1. Identify content that should be personalized
2. Add conditional rendering based on user's hardware profile
3. Use the `PersonalizeButton` component to toggle personalization

### Quiz Creation
1. Add quiz questions to the chapter's MDX file
2. Use the `QuizComponent` with appropriate props
3. Ensure both English and Urdu versions are provided

## Deployment
```bash
# Build the static site
npm run build

# Deploy to GitHub Pages
# Configure GitHub Actions or use manual deployment
```

## Testing
- Unit tests: `npm run test:unit`
- Integration tests: `npm run test:integration`
- End-to-end tests: `npm run test:e2e`