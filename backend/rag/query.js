const { QdrantClient } = require('@qdrant/js-client-rest');
const OpenAI = require('openai');
require('dotenv').config();

class RAGQuery {
  constructor() {
    this.client = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.collectionName = 'textbook_content';
  }

  async createEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  async search(query, limit = 5) {
    try {
      const queryEmbedding = await this.createEmbedding(query);

      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit: limit,
        with_payload: true,
      });

      return searchResult;
    } catch (error) {
      console.error('Error during search:', error);
      throw error;
    }
  }

  async queryWithContext(question, contextTexts, selectedText = null) {
    try {
      // If there's selected text, use it as context for the question
      let prompt;
      if (selectedText) {
        prompt = `Based on the following selected text, please answer the question:

Selected text: ${selectedText}

Question: ${question}

Please provide a comprehensive answer based on the provided text.`;
      } else {
        // Use retrieved context
        const context = contextTexts.join('\n\n');
        prompt = `Based on the following context from the Physical AI & Humanoid Robotics textbook, please answer the question:

Context: ${context}

Question: ${question}

Please provide a comprehensive answer based on the provided context. If the context doesn't contain enough information, please say so.`;
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert assistant for the Physical AI & Humanoid Robotics textbook. Provide accurate, helpful answers based on the textbook content. Be concise but comprehensive, and maintain a professional educational tone.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error during query:', error);
      throw error;
    }
  }

  async answerQuestion(question, selectedText = null) {
    try {
      let answer;

      if (selectedText) {
        // If there's selected text, just use the selected-text-only approach
        answer = await this.queryWithContext(question, [], selectedText);
      } else {
        // Otherwise, search the vector database and use retrieved context
        const searchResults = await this.search(question);
        const contextTexts = searchResults.map(result => result.payload.content);

        answer = await this.queryWithContext(question, contextTexts);
      }

      return {
        answer: answer,
        question: question,
        selectedText: selectedText,
        sources: selectedText ? [] : searchResults.map(result => ({
          content: result.payload.content.substring(0, 200) + '...',
          source_file: result.payload.source_file,
          score: result.score
        }))
      };
    } catch (error) {
      console.error('Error answering question:', error);
      throw error;
    }
  }
}

module.exports = RAGQuery;