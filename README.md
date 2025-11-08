# AI-Powered Thesis Repository

Complete full-stack application with AI-powered semantic search and RAG chatbot.

## 🚀 **Live Demo**

- **Frontend:** https://your-frontend.vercel.app
- **Backend API:** https://your-backend.vercel.app

## 📁 **Project Structure**

```
AI-ThesisRepository/
├── backend/          # Node.js + Express API
│   ├── src/
│   ├── server.js
│   └── package.json
│
└── frontend/         # React + Vite
    ├── src/
    ├── package.json
    └── vite.config.js
```

## 🛠️ **Tech Stack**

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

### AI/ML
- LLAMA 3.2 (Ollama for dev, Groq for prod)
- Vector Embeddings (3072 dimensions)
- Semantic Search
- RAG (Retrieval Augmented Generation)

## 🚀 **Quick Start**

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Ollama (for development)
- Groq API key (for production)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/AI-ThesisRepository.git
cd AI-ThesisRepository
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Frontend Setup** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access the app**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 📖 **Documentation**

- [Deployment Guide](DEPLOYMENT.md) - How to deploy to Vercel
- [Backend README](backend/README.md) - Backend documentation
- [Frontend README](frontend/README.md) - Frontend documentation
- [API Examples](backend/docs/API_EXAMPLES.md) - All API endpoints

## 🎯 **Features**

- ✅ Semantic search for theses
- ✅ AI-generated tags
- ✅ Vector embeddings
- ✅ Similar thesis recommendations
- ✅ RAG-powered chatbot
- ✅ Responsive design
- ✅ MongoDB Atlas integration
- ✅ Production-ready

## 📝 **Environment Variables**

### Backend
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_key
FRONTEND_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
```

## 🚀 **Deployment**

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete Vercel deployment guide.

## 📊 **API Endpoints**

- `POST /api/theses` - Create thesis
- `GET /api/theses` - Get all theses
- `POST /api/search/semantic` - Semantic search
- `POST /api/chat` - Chat with AI
- See [API_EXAMPLES.md](backend/docs/API_EXAMPLES.md) for full list

## 🤝 **Contributing**

This is a portfolio/demo project. Feel free to fork and customize!

## 📄 **License**

ISC

## 👤 **Author**

Your Name - Thesis Project

## 🙏 **Acknowledgments**

- LLAMA 3.2 by Meta
- Ollama for local AI
- Groq for production AI API
- MongoDB Atlas for database
- Vercel for hosting
