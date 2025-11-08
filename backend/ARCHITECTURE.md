# AI-Powered Thesis Repository - Backend Architecture

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # MongoDB connection setup
│   │   └── ai.config.js     # AI service configuration (Ollama/Groq switching)
│   │
│   ├── models/              # Data models
│   │   └── Thesis.js        # Thesis schema with embeddings and tags
│   │
│   ├── services/            # Business logic layer
│   │   ├── aiService.js     # Core AI service (Ollama/Groq integration)
│   │   ├── embeddingService.js     # Vector embedding generation
│   │   ├── tagService.js           # AI tag generation
│   │   ├── searchService.js        # Semantic search logic
│   │   └── chatService.js          # RAG chatbot implementation
│   │
│   ├── controllers/         # Request handlers
│   │   ├── thesisController.js     # CRUD operations for theses
│   │   ├── searchController.js     # Search operations
│   │   └── chatController.js       # Chat operations
│   │
│   ├── routes/              # API route definitions
│   │   ├── thesisRoutes.js
│   │   ├── searchRoutes.js
│   │   └── chatRoutes.js
│   │
│   ├── middleware/          # Express middleware
│   │   ├── errorHandler.js  # Global error handling
│   │   └── validator.js     # Request validation
│   │
│   ├── utils/              # Helper utilities
│   │   ├── logger.js       # Logging utility
│   │   └── vectorUtils.js  # Vector math (cosine similarity, etc.)
│   │
│   └── app.js              # Express app configuration
│
├── docs/                    # Documentation
│   ├── API_EXAMPLES.md      # API usage examples
│   └── ATLAS_SETUP.md       # MongoDB Atlas configuration guide
│
├── examples/                # Example scripts
│   └── test-api.js          # Complete API test suite
│
├── server.js                # Application entry point
├── package.json             # Dependencies and scripts
├── README.md                # Main documentation
├── QUICKSTART.md            # Quick setup guide
├── .env.example             # Environment variables template
├── .env                     # Your actual environment variables
└── .gitignore              # Git ignore rules
```

## 🏗️ Architecture Overview

### Layer 1: API Routes
- Define endpoints and HTTP methods
- Apply validation middleware
- Forward requests to controllers

### Layer 2: Controllers
- Handle HTTP requests/responses
- Validate and sanitize input
- Call appropriate services
- Format responses

### Layer 3: Services
- Implement business logic
- AI model interactions
- Complex operations (search, embeddings, chat)
- Database queries through models

### Layer 4: Models
- Define data schemas
- Database interactions
- Data validation rules

### Layer 5: Utilities
- Reusable helper functions
- Logging
- Vector calculations
- Error handling

## 🔄 Data Flow: Creating a Thesis

```
1. Client Request
   POST /api/theses
   { title, abstract }
         ↓
2. Route Layer
   thesisRoutes.js → validateThesisCreation middleware
         ↓
3. Controller Layer
   thesisController.createThesis()
         ↓
4. Service Layer (Parallel)
   ├─→ embeddingService.generateEmbedding(title, abstract)
   │    └─→ aiService.generateEmbeddings() → Ollama/Groq
   │
   └─→ tagService.generateTags(title, abstract)
        └─→ aiService.generateText() → Ollama/Groq
         ↓
5. Model Layer
   Thesis.create({ title, abstract, embeddings, tags })
         ↓
6. Response
   { success, data: { thesis with tags, no embeddings } }
```

## 🔍 Data Flow: Semantic Search

```
1. Client Request
   POST /api/search/semantic
   { query: "machine learning" }
         ↓
2. Search Service
   ├─→ Generate query embedding
   │    └─→ embeddingService.generateQueryEmbedding(query)
   │
   ├─→ Try MongoDB Atlas Vector Search
   │    └─→ $vectorSearch aggregation pipeline
   │
   └─→ Fallback: Manual cosine similarity
        └─→ Calculate similarity for all theses
         ↓
3. Response
   { data: [ { thesis, score }, ... ] }
```

## 💬 Data Flow: RAG Chatbot

```
1. Client Request
   POST /api/chat
   { message: "What theses are about AI?" }
         ↓
2. Chat Service
   ├─→ Retrieve relevant context
   │    └─→ searchService.semanticSearch(message)
   │         └─→ Returns top 3-5 relevant theses
   │
   ├─→ Build RAG prompt
   │    └─→ Combine: context + conversation history + user message
   │
   └─→ Generate AI response
        └─→ aiService.generateText(prompt)
         ↓
3. Response
   { 
     answer: "...", 
     sources: [...],
     conversationHistory: [...]
   }
```

## 🧠 AI Service Architecture

### Development Mode (Ollama)
```javascript
Environment: NODE_ENV=development
Provider: Ollama (localhost:11434)
Model: llama3.2

Capabilities:
✅ Text generation
✅ Native embeddings
✅ Free, local, private
⚠️  Slower on CPU
⚠️  First-time model load
```

### Production Mode (Groq)
```javascript
Environment: NODE_ENV=production
Provider: Groq Cloud API
Model: llama-3.2-90b-text-preview

Capabilities:
✅ Fast text generation
✅ Scalable, cloud-based
⚠️  No native embeddings (simulated)
⚠️  Requires API key
💡 Tip: Consider using Ollama for embeddings even in prod
```

## 🎯 Key Features Implementation

### 1. Vector Embeddings
**Service**: `embeddingService.js`
**Purpose**: Convert text to numerical vectors for similarity comparison

```javascript
Input: title + abstract
Process: AI model generates vector representation
Output: Array of 768 numbers (embedding vector)
Usage: Semantic search, similarity calculation
```

### 2. AI Tag Generation
**Service**: `tagService.js`
**Purpose**: Automatically categorize theses

```javascript
Input: title + abstract
Process: AI generates 3-5 descriptive tags (1-2 words each)
Output: ["machine learning", "healthcare", "predictive models"]
Validation: Ensures 3-5 tags, lowercase, no duplicates
```

### 3. Semantic Search
**Service**: `searchService.js`
**Purpose**: Find relevant theses by meaning, not keywords

```javascript
Methods:
1. Atlas Vector Search (fast, scalable)
   - Uses MongoDB $vectorSearch
   - Requires index setup
   
2. Manual Cosine Similarity (fallback)
   - Calculates similarity for all documents
   - Works without special setup
```

### 4. RAG Chatbot
**Service**: `chatService.js`
**Purpose**: Answer questions using thesis repository as context

```javascript
Process:
1. Semantic search to find relevant theses
2. Build prompt with retrieved context
3. AI generates informed response
4. Return answer + sources

Supports:
- Conversation history
- Multi-turn dialogue
- Source citations
```

## 🔐 Environment Configuration

### Required Variables
```env
# Database
MONGODB_URI=mongodb+srv://...

# Development AI
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Production AI
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.2-90b-text-preview
```

### Environment Switching
The system automatically switches between Ollama and Groq based on `NODE_ENV`:
- `development` → Ollama (local)
- `production` → Groq (cloud)

## 📊 Database Schema

### Thesis Model
```javascript
{
  title: String (required, max 500 chars)
  abstract: String (required, max 5000 chars)
  embeddings: [Number] (required, 768 dimensions)
  tags: [String] (required, 3-5 tags)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}

Indexes:
- tags (for tag filtering)
- text index on title + abstract
- createdAt (for sorting)
- Vector index on embeddings (Atlas only)
```

## 🚀 API Endpoints Summary

### Thesis Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/theses` | Create new thesis |
| GET | `/api/theses` | Get all theses (paginated) |
| GET | `/api/theses/:id` | Get specific thesis |
| GET | `/api/theses/tag/:tag` | Get by tag |
| GET | `/api/theses/:id/similar` | Find similar theses |
| GET | `/api/theses/tags/all` | Get all unique tags |
| GET | `/api/theses/stats` | Repository statistics |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/search/semantic` | Semantic search |
| POST | `/api/search/tags` | Search by multiple tags |
| POST | `/api/search/combined` | Text + tag search |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Chat with RAG bot |
| GET | `/api/chat/suggestions` | Get suggested questions |
| GET | `/api/chat/summarize/:id` | Summarize thesis |

## 🛡️ Error Handling

### Global Error Handler
- Catches all unhandled errors
- Formats consistent error responses
- Logs errors with stack traces
- Handles Mongoose-specific errors

### Validation Middleware
- Request validation before processing
- Input sanitization
- Type checking
- Length limits

## 📝 Logging

### Logger Utility
```javascript
logger.info()   // General information
logger.error()  // Errors with stack traces
logger.warn()   // Warnings
logger.debug()  // Development debugging
```

All logs include timestamps and severity levels.

## 🧪 Testing

### Test Suite: `examples/test-api.js`
Comprehensive test coverage:
1. ✅ Health check
2. ✅ Create theses
3. ✅ Get all theses
4. ✅ Statistics
5. ✅ Get all tags
6. ✅ Semantic search
7. ✅ Similar theses
8. ✅ Chat functionality

Run with: `node examples/test-api.js`

## 🎓 Usage Examples

See detailed examples in:
- **API Examples**: `docs/API_EXAMPLES.md`
- **Atlas Setup**: `docs/ATLAS_SETUP.md`
- **Quick Start**: `QUICKSTART.md`
- **Test Script**: `examples/test-api.js`

## 🔄 Next Steps

1. ✅ Backend structure complete
2. ⏭️ Install dependencies: `npm install`
3. ⏭️ Configure `.env` file
4. ⏭️ Start Ollama locally
5. ⏭️ Run the server: `npm run dev`
6. ⏭️ Test with example script
7. ⏭️ Add sample theses
8. ⏭️ Set up Atlas Vector Search
9. ⏭️ Generate AI thesis data (later)
10. ⏭️ Build frontend (later)

## 📚 Documentation Files

- **README.md**: Overview and features
- **QUICKSTART.md**: Setup instructions
- **docs/API_EXAMPLES.md**: Request/response examples
- **docs/ATLAS_SETUP.md**: Vector search setup
- **ARCHITECTURE.md**: This file - system design

---

**Built with**: Node.js, Express, MongoDB Atlas, Llama 3.2, Groq
**Purpose**: AI-powered academic thesis repository with semantic search and RAG chatbot
**License**: ISC

