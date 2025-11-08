# AI-Powered Thesis Repository - Backend

Backend server for an AI-powered thesis repository using MERN stack and LLAMA 3.2 models.

## Features

- 📚 Store thesis documents (title and abstract)
- 🧠 AI-generated vector embeddings for semantic search
- 🏷️ Automatic tag generation (3-5 tags per thesis)
- 🔍 Semantic search functionality
- 💬 RAG-based AI chatbot for thesis queries

## Tech Stack

- **Runtime**: Node.js + Express.js
- **Database**: MongoDB Atlas (with Vector Search)
- **AI Models**: LLAMA 3.2 (Ollama for dev, Groq for prod)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

3. Make sure Ollama is running locally (for development):
```bash
ollama run llama3.2
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Thesis Management
- `POST /api/theses` - Create new thesis
- `GET /api/theses` - Get all theses
- `GET /api/theses/:id` - Get specific thesis
- `GET /api/theses/tags/:tag` - Filter by tag

### Search
- `POST /api/search/semantic` - Semantic search

### Chat
- `POST /api/chat` - RAG-based chatbot

## MongoDB Atlas Vector Search Setup

After creating your cluster, you need to create a vector search index:

1. Go to Atlas Search in your cluster
2. Create a new search index with this configuration:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embeddings",
      "numDimensions": 768,
      "similarity": "cosine"
    }
  ]
}
```

## Project Structure

```
backend/
├── src/
│   ├── config/        # Configuration files
│   ├── models/        # Mongoose models
│   ├── controllers/   # Route controllers
│   ├── services/      # Business logic
│   ├── routes/        # API routes
│   ├── middleware/    # Express middleware
│   ├── utils/         # Helper functions
│   └── app.js         # Express app setup
├── server.js          # Entry point
└── package.json
```

