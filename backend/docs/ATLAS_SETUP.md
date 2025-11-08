# MongoDB Atlas Vector Search Setup Guide

## Step 1: Create a MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier is sufficient for development)
3. Set up database access (username/password)
4. Configure network access (allow your IP or 0.0.0.0/0 for development)

## Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add it to your `.env` file as `MONGODB_URI`

Example:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/thesis-repository?retryWrites=true&w=majority
```

## Step 3: Create Vector Search Index

After you've added some theses to your database, create a vector search index:

1. In MongoDB Atlas, navigate to your cluster
2. Click on "Atlas Search" in the left sidebar
3. Click "Create Search Index"
4. Choose "JSON Editor"
5. Select your database: `thesis-repository`
6. Select your collection: `theses`
7. Paste this JSON configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embeddings",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "tags"
    }
  ]
}
```

8. Name your index: `thesis_vector_index`
9. Click "Create Search Index"

## Step 4: Wait for Index to Build

The index will take a few minutes to build. You can check the status in the Atlas Search tab.

## Step 5: Test Vector Search

Once the index is built, the semantic search will automatically use Atlas Vector Search. If the index is not available, the system will fall back to manual cosine similarity search.

## Note on Embedding Dimensions

- The default embedding dimension is set to 768
- If you're using Llama 3.2 with Ollama, check the actual embedding dimensions:
  ```bash
  curl http://localhost:11434/api/embeddings -d '{
    "model": "llama3.2",
    "prompt": "test"
  }'
  ```
- Update the `numDimensions` in the index configuration if needed
- Also update `EMBEDDING_DIMENSIONS` in your `.env` file

## Fallback Behavior

If Atlas Vector Search is not configured or fails:
- The system will automatically fall back to manual cosine similarity search
- This works but is slower for large datasets
- For production, always use Atlas Vector Search for better performance

