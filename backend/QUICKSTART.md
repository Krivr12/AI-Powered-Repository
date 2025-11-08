# Quick Start Guide

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB Atlas** account
3. **Ollama** installed locally (for development)
4. **Groq API Key** (for production)

## Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your credentials:

```env
NODE_ENV=development
PORT=5000

# Get this from MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thesis-repository?retryWrites=true&w=majority

# For development (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# For production (Groq)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.2-90b-text-preview
```

### 3. Start Ollama (Development)

Make sure Ollama is running with Llama 3.2:

```bash
# Pull the model if you haven't already
ollama pull llama3.2

# Run Ollama (it should start automatically on Mac)
ollama serve
```

Test Ollama:
```bash
curl http://localhost:11434/api/tags
```

### 4. Set Up MongoDB Atlas

Follow the instructions in `docs/ATLAS_SETUP.md` to:
- Create a MongoDB Atlas cluster
- Get your connection string
- (Optional) Create a vector search index after adding theses

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

### 6. Test the API

Check if the server is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-11-08T10:30:00.000Z"
}
```

## Testing the Application

### Method 1: Using cURL

See `docs/API_EXAMPLES.md` for detailed examples.

Quick test - Create a thesis:
```bash
curl -X POST http://localhost:5000/api/theses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Machine Learning in Healthcare",
    "abstract": "This thesis explores the application of machine learning algorithms in healthcare, focusing on predictive diagnostics and personalized treatment recommendations."
  }'
```

### Method 2: Using Postman

1. Import the endpoints from `docs/API_EXAMPLES.md`
2. Test each endpoint

### Method 3: Create a Simple Test Script

Create `test-api.js`:
```javascript
const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testAPI() {
  try {
    // Health check
    const health = await axios.get(`${API_URL}/health`);
    console.log('✓ Health check:', health.data);

    // Create thesis
    const thesis = await axios.post(`${API_URL}/api/theses`, {
      title: 'Test Thesis',
      abstract: 'This is a test thesis about artificial intelligence and machine learning.'
    });
    console.log('✓ Thesis created:', thesis.data);

    // Search
    const search = await axios.post(`${API_URL}/api/search/semantic`, {
      query: 'artificial intelligence'
    });
    console.log('✓ Search results:', search.data);
  } catch (error) {
    console.error('✗ Error:', error.response?.data || error.message);
  }
}

testAPI();
```

Run it:
```bash
node test-api.js
```

## Common Issues

### Issue 1: "AI service health check failed"
- **Solution**: Make sure Ollama is running (`ollama serve`)
- Check if the model is available: `ollama list`

### Issue 2: "Error connecting to MongoDB"
- **Solution**: Check your connection string in `.env`
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify username and password are correct

### Issue 3: "Embeddings generation takes too long"
- **Solution**: First-time model loading can be slow
- Consider using a smaller model or increase timeout
- For production, use Groq which is faster

### Issue 4: "Vector search not working"
- **Solution**: The system will fall back to manual search
- For Atlas Vector Search, follow `docs/ATLAS_SETUP.md`
- You need at least a few theses in the database first

## Development Workflow

1. **Start the server**: `npm run dev`
2. **Add theses**: Use POST `/api/theses` endpoint
3. **Test search**: Use POST `/api/search/semantic`
4. **Test chat**: Use POST `/api/chat`
5. **Monitor logs**: Check console for AI operations

## Switching from Development to Production

1. Set environment to production:
```env
NODE_ENV=production
```

2. Add Groq API key:
```env
GROQ_API_KEY=your_actual_groq_api_key
```

3. The system will automatically switch from Ollama to Groq!

## Next Steps

1. Add sample theses to the database
2. Test semantic search functionality
3. Test the RAG chatbot
4. Set up MongoDB Atlas Vector Search index (optional but recommended)
5. Generate ~50 AI-generated theses for demo (later)

## API Documentation

Full API documentation is available in:
- `docs/API_EXAMPLES.md` - Example requests and responses
- `docs/ATLAS_SETUP.md` - MongoDB Atlas configuration

## Need Help?

Check the logs in the console - they show detailed information about:
- Database connections
- AI service status
- Request processing
- Errors and warnings

Happy coding! 🚀

