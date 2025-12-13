const fs = require('fs');
const path = require('path');
const { QdrantClient } = require('@qdrant/js-client-rest');
const OpenAI = require('openai');
require('dotenv').config();

class RAGIngestion {
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

  async initializeCollection() {
    try {
      // Check if collection exists
      await this.client.getCollection(this.collectionName);
      console.log(`Collection ${this.collectionName} already exists`);
    } catch (error) {
      // Collection doesn't exist, create it
      await this.client.createCollection(this.collectionName, {
        vector_size: 1536, // OpenAI embedding dimension
        distance: 'Cosine',
      });
      console.log(`Created collection ${this.collectionName}`);
    }
  }

  async extractTextFromMDX(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Remove frontmatter
    const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
    let textContent = content.replace(frontmatterRegex, '');

    // Remove code blocks and mermaid diagrams
    textContent = textContent.replace(/```[\s\S]*?```/g, '');
    textContent = textContent.replace(/```[\s\S]*?```/g, '');
    textContent = textContent.replace(/<.*?>/g, ''); // Remove HTML-like tags

    // Remove markdown formatting but keep the text
    textContent = textContent.replace(/[#*_[\]]/g, '');
    textContent = textContent.replace(/\n{3,}/g, '\n\n'); // Normalize newlines

    return textContent.trim();
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

  async chunkText(text, maxLength = 1000) {
    const chunks = [];
    const paragraphs = text.split('\n\n');

    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (paragraph.length > maxLength) {
        // Split large paragraphs into sentences
        const sentences = paragraph.match(/[^\.!?]*[\.!?]+/g) || [paragraph];
        let tempChunk = '';

        for (const sentence of sentences) {
          if ((tempChunk + sentence).length > maxLength) {
            if (tempChunk.trim()) {
              chunks.push(tempChunk.trim());
            }
            tempChunk = sentence;
          } else {
            tempChunk += sentence;
          }
        }

        if (tempChunk.trim()) {
          chunks.push(tempChunk.trim());
        }
      } else {
        if ((currentChunk + paragraph).length > maxLength) {
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = paragraph;
        } else {
          currentChunk += '\n\n' + paragraph;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  async ingestDocuments() {
    try {
      await this.initializeCollection();

      // Get all MDX files from docs directory
      const docsDir = path.join(__dirname, '../../docs');
      const mdxFiles = this.getAllMdxFiles(docsDir);

      console.log(`Found ${mdxFiles.length} MDX files to process`);

      let processedCount = 0;

      for (const filePath of mdxFiles) {
        console.log(`Processing: ${filePath}`);

        try {
          const content = this.extractTextFromMDX(filePath);
          const chunks = await this.chunkText(content);
          const fileName = path.basename(filePath, '.mdx');
          const relativePath = path.relative(docsDir, filePath).replace(/\\/g, '/');

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (chunk.trim().length < 10) continue; // Skip very short chunks

            const embedding = await this.createEmbedding(chunk);

            await this.client.upsert(this.collectionName, {
              wait: true,
              points: [
                {
                  id: `${fileName}-${i}-${Date.now()}-${Math.random()}`,
                  vector: embedding,
                  payload: {
                    content: chunk,
                    source_file: relativePath,
                    chunk_index: i,
                    title: this.extractTitle(content, fileName),
                    page_content: chunk,
                  },
                },
              ],
            });
          }

          processedCount++;
          console.log(`Processed ${processedCount}/${mdxFiles.length}: ${filePath}`);
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error.message);
        }
      }

      console.log(`Successfully ingested ${processedCount} files into Qdrant`);
    } catch (error) {
      console.error('Error during ingestion:', error);
      throw error;
    }
  }

  extractTitle(content, fallback) {
    // Try to extract title from the content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return fallback;
  }

  getAllMdxFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getAllMdxFiles(fullPath));
      } else if (item.endsWith('.mdx')) {
        files.push(fullPath);
      }
    }

    return files;
  }
}

// Run ingestion if this file is executed directly
if (require.main === module) {
  const ingestion = new RAGIngestion();

  ingestion.ingestDocuments()
    .then(() => {
      console.log('Ingestion completed successfully!');
    })
    .catch((error) => {
      console.error('Ingestion failed:', error);
      process.exit(1);
    });
}

module.exports = RAGIngestion;