import asyncio
import os
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import re
from typing import List, Dict, Any
import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextbookRAGIngestor:
    def __init__(self):
        # Initialize Cohere client
        self.cohere_client = cohere.Client(os.getenv("COHERE_API_KEY"))

        # Initialize Qdrant client
        self.qdrant_client = QdrantClient(
            url=os.getenv("QDRANT_URL"),
            api_key=os.getenv("QDRANT_API_KEY")
        )

        # Deployed URL
        self.base_url = "https://fariau.github.io/Humanoid-Robotic-Book/"

    def get_all_urls(self) -> List[str]:
        """
        Get all URLs from the deployed site by scraping the main page and following links
        """
        logger.info(f"Fetching URLs from {self.base_url}")

        response = requests.get(self.base_url)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')
        urls = set()

        # Add the base URL
        urls.add(self.base_url)

        # Find all links on the page
        for link in soup.find_all('a', href=True):
            href = link['href']
            full_url = urljoin(self.base_url, href)

            # Only add URLs from the same domain and that are HTML pages
            if urlparse(full_url).netloc == urlparse(self.base_url).netloc:
                if full_url.endswith(('.html', '/')) or not '.' in urlparse(full_url).path:
                    urls.add(full_url)

        # Also check for links in the sidebar structure
        sidebar_response = requests.get(f"{self.base_url}sidebar.json")  # This might not exist, so we'll handle it
        try:
            if sidebar_response.status_code == 200:
                # If sidebar.json exists, extract URLs from there too
                pass
        except:
            logger.info("No sidebar.json found, using main navigation links only")

        logger.info(f"Found {len(urls)} URLs to process")
        return list(urls)

    def extract_text_from_url(self, url: str) -> str:
        """
        Extract clean text content from a given URL
        """
        logger.info(f"Extracting text from {url}")

        try:
            response = requests.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
                script.decompose()

            # Get text content
            text = soup.get_text()

            # Clean up the text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)

            return text
        except Exception as e:
            logger.error(f"Error extracting text from {url}: {str(e)}")
            return ""

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into chunks of specified size with overlap
        """
        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size

            # If we're near the end, include the remainder
            if end >= len(text):
                end = len(text)
            else:
                # Try to break at sentence boundary
                temp_end = end
                while temp_end > start + chunk_size // 2 and temp_end < len(text):
                    if text[temp_end] in '.!?':
                        end = temp_end + 1
                        break
                    temp_end -= 1
                # If no sentence boundary found in reasonable range, just cut at chunk_size
                # but ensure we're not cutting in the middle of a word
                else:
                    # Look for whitespace to avoid cutting words
                    while end < len(text) and end < start + chunk_size and text[end] != ' ' and text[end].isalnum():
                        end += 1

            chunk = text[start:end].strip()
            if chunk:  # Only add non-empty chunks
                chunks.append(chunk)

            # Move start with overlap, but ensure progress
            start = min(end, start + chunk_size - overlap)
            if start >= end:  # Ensure we make progress
                start = end
                if start >= len(text):  # Prevent infinite loop
                    break

        # Filter out empty chunks
        chunks = [chunk for chunk in chunks if chunk.strip()]

        return chunks

    def create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Create embeddings for a list of texts using Cohere
        """
        logger.info(f"Creating embeddings for {len(texts)} text chunks")

        try:
            response = self.cohere_client.embed(
                texts=texts,
                model="embed-english-v3.0",
                input_type="search_document"
            )

            return [item for item in response.embeddings]
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            return []

    def create_collection(self, collection_name: str = "chatbot_embedding"):
        """
        Create a Qdrant collection for storing embeddings
        """
        logger.info(f"Creating Qdrant collection: {collection_name}")

        try:
            # Check if collection already exists
            collections = self.qdrant_client.get_collections()
            collection_exists = any(col.name == collection_name for col in collections.collections)

            if collection_exists:
                logger.info(f"Collection {collection_name} already exists, recreating...")
                self.qdrant_client.delete_collection(collection_name)

            # Create new collection
            self.qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE)  # Cohere embeddings are 1024-dim
            )

            logger.info(f"Collection {collection_name} created successfully")
        except Exception as e:
            logger.error(f"Error creating collection: {str(e)}")
            raise

    def upsert_to_qdrant(self, collection_name: str, chunks: List[str], urls: List[str], embeddings: List[List[float]]):
        """
        Upsert text chunks with metadata to Qdrant
        """
        logger.info(f"Upserting {len(chunks)} chunks to Qdrant collection: {collection_name}")

        points = []
        for i, (chunk, url, embedding) in enumerate(zip(chunks, urls, embeddings)):
            point = models.PointStruct(
                id=i,
                vector=embedding,
                payload={
                    "text": chunk,
                    "url": url,
                    "chunk_id": i,
                    "source": "Humanoid-Robotic-Book"
                }
            )
            points.append(point)

        try:
            self.qdrant_client.upsert(
                collection_name=collection_name,
                points=points
            )

            logger.info(f"Successfully upserted {len(points)} points to Qdrant")
        except Exception as e:
            logger.error(f"Error upserting to Qdrant: {str(e)}")
            raise

    def process_textbook(self):
        """
        Main function to process the entire textbook
        """
        logger.info("Starting textbook processing pipeline...")

        # Step 1: Get all URLs
        urls = self.get_all_urls()

        # For memory management, limit to a few URLs during testing
        # urls = urls[:3]  # Limit to first 3 URLs to manage memory

        # Step 2: Extract text from all URLs
        all_text_chunks = []
        all_urls_for_chunks = []

        for i, url in enumerate(urls):
            logger.info(f"Processing URL {i+1}/{len(urls)}: {url}")
            text = self.extract_text_from_url(url)
            if text.strip():
                logger.info(f"Extracted text of length {len(text)} from {url}")

                # Step 3: Chunk the text
                chunks = self.chunk_text(text)
                logger.info(f"Created {len(chunks)} chunks from {url}")

                # Add each chunk with its corresponding URL
                for chunk in chunks:
                    if chunk.strip():  # Only add non-empty chunks
                        all_text_chunks.append(chunk)
                        all_urls_for_chunks.append(url)

                # Optional: Limit chunks to avoid memory issues during testing
                # if len(all_text_chunks) > 50:  # Stop after 50 chunks for testing
                #     logger.info("Reached chunk limit for testing, stopping...")
                #     break

        logger.info(f"Total chunks created: {len(all_text_chunks)}")

        if not all_text_chunks:
            logger.warning("No text chunks were created. Exiting.")
            return

        # Step 4: Create embeddings (process in batches to manage memory)
        logger.info("Starting embedding creation...")
        embeddings = []

        # Process in smaller batches to manage memory
        batch_size = 10  # Reduced batch size for memory management
        for i in range(0, len(all_text_chunks), batch_size):
            batch = all_text_chunks[i:i + batch_size]
            logger.info(f"Processing embedding batch {i//batch_size + 1}/{(len(all_text_chunks)-1)//batch_size + 1}")
            batch_embeddings = self.create_embeddings(batch)
            embeddings.extend(batch_embeddings)

            # Optional: Add small delay to manage API rate limits
            import time
            time.sleep(0.1)

        if len(embeddings) != len(all_text_chunks):
            logger.error("Number of embeddings doesn't match number of text chunks")
            return

        # Step 5: Create Qdrant collection
        collection_name = "chatbot_embedding"
        self.create_collection(collection_name)

        # Step 6: Upsert to Qdrant
        self.upsert_to_qdrant(collection_name, all_text_chunks, all_urls_for_chunks, embeddings)

        logger.info("Textbook processing pipeline completed successfully!")


def main():
    """
    Main execution function
    """
    logger.info("Initializing Textbook RAG Ingestor...")

    # Check for required environment variables
    required_env_vars = ["COHERE_API_KEY", "QDRANT_URL", "QDRANT_API_KEY"]
    for var in required_env_vars:
        if not os.getenv(var):
            raise ValueError(f"Required environment variable {var} is not set")

    # Create and run the ingestor
    ingestor = TextbookRAGIngestor()
    ingestor.process_textbook()


if __name__ == "__main__":
    main()