import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thesis API
export const thesisAPI = {
  // Get all theses with pagination
  getAll: async (page = 1, limit = 10) => {
    const response = await api.get(`/api/theses?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get thesis by ID
  getById: async (id) => {
    const response = await api.get(`/api/theses/${id}`);
    return response.data;
  },

  // Get theses by tag
  getByTag: async (tag) => {
    const response = await api.get(`/api/theses/tag/${tag}`);
    return response.data;
  },

  // Get all unique tags
  getAllTags: async () => {
    const response = await api.get(`/api/theses/tags/all`);
    return response.data;
  },

  // Get repository statistics
  getStats: async () => {
    const response = await api.get(`/api/theses/stats`);
    return response.data;
  },

  // Get similar theses
  getSimilar: async (id, limit = 5) => {
    const response = await api.get(`/api/theses/${id}/similar?limit=${limit}`);
    return response.data;
  },
};

// Search API
export const searchAPI = {
  // Semantic search
  semantic: async (query, limit = 10, threshold = 0.1) => {
    const response = await api.post('/api/search/semantic', {
      query,
      limit,
      threshold,
    });
    return response.data;
  },

  // Search by tags
  byTags: async (tags, operator = 'OR', limit = 10) => {
    const response = await api.post('/api/search/tags', {
      tags,
      operator,
      limit,
    });
    return response.data;
  },

  // Combined search
  combined: async (query, tags, limit = 10) => {
    const response = await api.post('/api/search/combined', {
      query,
      tags,
      limit,
    });
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  // Send chat message
  sendMessage: async (message, conversationHistory = [], topK = 3) => {
    const response = await api.post('/api/chat', {
      message,
      conversationHistory,
      topK,
    });
    return response.data;
  },

  // Get suggested questions
  getSuggestions: async () => {
    const response = await api.get('/api/chat/suggestions');
    return response.data;
  },

  // Summarize thesis
  summarize: async (id) => {
    const response = await api.get(`/api/chat/summarize/${id}`);
    return response.data;
  },
};

export default api;

