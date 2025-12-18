import cohere from 'cohere-ai';
import { QdrantClient } from '@qdrant/js-client-rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, context = {}, language = 'en' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check if required environment variables are set
    const cohereApiKey = process.env.COHERE_API_KEY;
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;

    if (!cohereApiKey) {
      console.error('COHERE_API_KEY is not set');
      return res.status(500).json({
        error: 'COHERE_API_KEY is not configured',
        message: 'Please set the COHERE_API_KEY environment variable'
      });
    }

    if (!qdrantUrl || !qdrantApiKey) {
      console.error('QDRANT_URL or QDRANT_API_KEY is not set');
      return res.status(500).json({
        error: 'QDRANT configuration is not complete',
        message: 'Please set both QDRANT_URL and QDRANT_API_KEY environment variables'
      });
    }

    // Initialize clients inside the handler to avoid issues during server startup
    const cohereClient = cohere.initialize(cohereApiKey);
    const qdrantClient = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });

    // Create embedding for the query
    let queryEmbedding;
    try {
      const queryEmbeddingResponse = await cohereClient.embed({
        texts: [query],
        model: 'embed-english-v3.0',
        input_type: 'search_query'
      });
      queryEmbedding = queryEmbeddingResponse.embeddings[0];
    } catch (embeddingError) {
      console.error('Error creating query embedding:', embeddingError);
      return res.status(500).json({
        error: 'Failed to create query embedding',
        message: embeddingError.message
      });
    }

    // Search in Qdrant for relevant chunks
    let searchResult;
    try {
      searchResult = await qdrantClient.search('chatbot_embedding', {
        vector: queryEmbedding,
        limit: 5, // Get top 5 most relevant chunks
        with_payload: true
      });
    } catch (searchError) {
      console.error('Error searching in Qdrant:', searchError);
      console.error('Search error details:', {
        message: searchError.message,
        stack: searchError.stack,
        name: searchError.name
      });
      // If Qdrant search fails, return a generic response instead of failing completely
      return res.status(200).json({
        response: 'I\'m having trouble accessing the textbook database right now. Please make sure the RAG system has been properly set up with the textbook content.',
        sources: [],
        queryId: `query_${Date.now()}`
      });
    }

    // Extract relevant text chunks and sources
    const relevantChunks = searchResult.map(hit => ({
      text: hit.payload?.text || '',
      url: hit.payload?.url || '',
      similarityScore: hit.score
    }));

    // If we have relevant chunks, generate a response using Cohere
    let responseText = 'I couldn\'t find relevant information in the textbook to answer your question.';
    const sources = [];

    if (relevantChunks.length > 0) {
      // Create context from the most relevant chunks
      const contextText = relevantChunks.slice(0, 3).map(chunk => chunk.text).join('\n\n'); // Use top 3 chunks

      try {
        // Generate response using Cohere's chat functionality
        const chatResponse = await cohereClient.chat({
          message: `Based on the following textbook content, please answer the question: "${query}"\n\nTextbook content:\n${contextText}\n\nQuestion: ${query}`,
          max_tokens: 500
        });

        responseText = chatResponse.text;
      } catch (generationError) {
        console.error('Error generating response:', generationError);
        // Fallback to using the raw context if generation fails
        responseText = `Based on the textbook content:\n\n${contextText.substring(0, 500)}...`;
      }
    }

    // Format sources from the relevant chunks
    sources.push(...relevantChunks.map(chunk => ({
      chapterId: 'unknown', // This would need to be stored in the payload during ingestion
      chapterTitle: 'Textbook Content',
      section: chunk.url.split('/').pop() || 'Section',
      similarityScore: chunk.similarityScore
    })));

    // Return the response according to the API contract
    res.status(200).json({
      response: responseText,
      sources: sources,
      queryId: `query_${Date.now()}`
    });
  } catch (error) {
    console.error('Unexpected error in RAG API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}