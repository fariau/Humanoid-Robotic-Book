const express = require('express');
const cors = require('cors');
const RAGQuery = require('./rag/query');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize RAG system
let ragQuery;
try {
  ragQuery = new RAGQuery();
} catch (error) {
  console.error('Failed to initialize RAG system:', error.message);
  process.exit(1);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RAG API is running' });
});

// Query endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { question, selectedText } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await ragQuery.answerQuestion(question, selectedText);
    res.json(result);
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    // Simple test to verify the system is working
    res.json({
      message: 'RAG system is connected and ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: 'Test failed' });
  }
});

app.listen(PORT, () => {
  console.log(`RAG API server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;