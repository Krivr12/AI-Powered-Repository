# API Testing Examples

This document contains example requests for testing the API using Postman, curl, or any HTTP client.

## Base URL
```
http://localhost:5000
```

---

## 1. Health Check

**GET** `/health`

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-11-08T10:30:00.000Z"
}
```

---

## 2. Create a Thesis

**POST** `/api/theses`

```bash
curl -X POST http://localhost:5000/api/theses \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Deep Learning Approaches for Natural Language Processing",
    "abstract": "This thesis explores various deep learning architectures and their applications in natural language processing tasks. We investigate transformer models, attention mechanisms, and their effectiveness in tasks such as machine translation, text summarization, and sentiment analysis. Our experiments demonstrate that pre-trained language models significantly improve performance across multiple NLP benchmarks."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Thesis created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Deep Learning Approaches for Natural Language Processing",
    "abstract": "This thesis explores...",
    "tags": ["deep learning", "nlp", "transformers", "machine translation"],
    "embeddingDimensions": 768,
    "createdAt": "2024-11-08T10:30:00.000Z",
    "updatedAt": "2024-11-08T10:30:00.000Z"
  }
}
```

---

## 3. Get All Theses

**GET** `/api/theses?page=1&limit=10`

```bash
curl "http://localhost:5000/api/theses?page=1&limit=10"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Deep Learning Approaches for Natural Language Processing",
      "abstract": "This thesis explores...",
      "tags": ["deep learning", "nlp", "transformers"],
      "createdAt": "2024-11-08T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50,
    "limit": 10
  }
}
```

---

## 4. Get Thesis by ID

**GET** `/api/theses/:id`

```bash
curl http://localhost:5000/api/theses/507f1f77bcf86cd799439011
```

---

## 5. Get Theses by Tag

**GET** `/api/theses/tag/:tag`

```bash
curl http://localhost:5000/api/theses/tag/machine-learning
```

---

## 6. Get Similar Theses

**GET** `/api/theses/:id/similar?limit=5`

```bash
curl "http://localhost:5000/api/theses/507f1f77bcf86cd799439011/similar?limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Attention Mechanisms in Neural Networks",
      "abstract": "...",
      "tags": ["neural networks", "attention", "deep learning"],
      "score": 0.89,
      "createdAt": "2024-11-08T10:30:00.000Z"
    }
  ]
}
```

---

## 7. Semantic Search

**POST** `/api/search/semantic`

```bash
curl -X POST http://localhost:5000/api/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "machine learning applications in healthcare",
    "limit": 10,
    "threshold": 0.5
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "machine learning applications in healthcare",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "AI in Medical Diagnosis",
      "abstract": "...",
      "tags": ["ai", "healthcare", "diagnosis"],
      "score": 0.87,
      "createdAt": "2024-11-08T10:30:00.000Z"
    }
  ],
  "count": 5
}
```

---

## 8. Search by Multiple Tags

**POST** `/api/search/tags`

```bash
curl -X POST http://localhost:5000/api/search/tags \
  -H "Content-Type: application/json" \
  -d '{
    "tags": ["machine learning", "healthcare"],
    "operator": "OR",
    "limit": 10
  }'
```

---

## 9. Combined Search (Text + Tags)

**POST** `/api/search/combined`

```bash
curl -X POST http://localhost:5000/api/search/combined \
  -H "Content-Type: application/json" \
  -d '{
    "query": "neural networks",
    "tags": ["deep learning", "computer vision"],
    "limit": 10
  }'
```

---

## 10. Chat with AI

**POST** `/api/chat`

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What theses are available about machine learning?",
    "topK": 3
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Based on the repository, there are several theses about machine learning...",
    "sources": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "Deep Learning Approaches for Natural Language Processing",
        "tags": ["deep learning", "nlp", "transformers"],
        "relevanceScore": 0.87
      }
    ],
    "conversationHistory": [
      {
        "role": "user",
        "content": "What theses are available about machine learning?"
      },
      {
        "role": "assistant",
        "content": "Based on the repository..."
      }
    ]
  }
}
```

---

## 11. Chat with Conversation History

**POST** `/api/chat`

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me more about the first one",
    "conversationHistory": [
      {
        "role": "user",
        "content": "What theses are about AI?"
      },
      {
        "role": "assistant",
        "content": "There are several theses about AI..."
      }
    ],
    "topK": 3
  }'
```

---

## 12. Get Suggested Questions

**GET** `/api/chat/suggestions`

```bash
curl http://localhost:5000/api/chat/suggestions
```

**Response:**
```json
{
  "success": true,
  "data": [
    "What theses are related to machine learning?",
    "Can you summarize theses about healthcare?",
    "What are the most recent theses in the repository?",
    "Tell me about research on artificial intelligence."
  ]
}
```

---

## 13. Summarize a Thesis

**GET** `/api/chat/summarize/:id`

```bash
curl http://localhost:5000/api/chat/summarize/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "thesisId": "507f1f77bcf86cd799439011",
    "summary": "This research investigates deep learning methods for NLP tasks, focusing on transformer architectures and their applications in translation and sentiment analysis."
  }
}
```

---

## 14. Get All Unique Tags

**GET** `/api/theses/tags/all`

```bash
curl http://localhost:5000/api/theses/tags/all
```

---

## 15. Get Repository Statistics

**GET** `/api/theses/stats`

```bash
curl http://localhost:5000/api/theses/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTheses": 50,
    "totalUniqueTags": 87,
    "topTags": ["machine learning", "deep learning", "nlp", "computer vision", "ai"]
  }
}
```

---

## Example Thesis Data for Testing

Here are some example theses you can add:

```json
{
  "title": "Convolutional Neural Networks for Image Classification",
  "abstract": "This research presents novel architectures for image classification using convolutional neural networks. We propose improvements to the standard CNN architecture and demonstrate state-of-the-art results on ImageNet and CIFAR-10 datasets."
}
```

```json
{
  "title": "Reinforcement Learning in Robotics",
  "abstract": "An investigation into the application of reinforcement learning algorithms for robotic control tasks. We implement Q-learning and policy gradient methods for autonomous navigation and manipulation tasks, showing significant improvements over traditional control methods."
}
```

```json
{
  "title": "Blockchain Technology for Secure Healthcare Data Management",
  "abstract": "This thesis proposes a blockchain-based framework for secure and decentralized healthcare data management. We address privacy concerns, interoperability, and data integrity issues in electronic health records through smart contracts and distributed ledger technology."
}
```

