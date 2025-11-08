/**
 * Sample Test Script
 * Run this after starting the server to test basic functionality
 * 
 * Usage: node examples/test-api.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

// Sample thesis data
const sampleTheses = [
  {
    title: 'Deep Learning for Natural Language Processing',
    abstract: 'This research investigates state-of-the-art deep learning architectures for natural language processing tasks. We explore transformer models, attention mechanisms, and pre-trained language models. Our experiments demonstrate significant improvements in machine translation, sentiment analysis, and text summarization tasks across multiple benchmarks.',
  },
  {
    title: 'Blockchain Technology in Supply Chain Management',
    abstract: 'This thesis proposes a blockchain-based framework for enhancing transparency and traceability in supply chain systems. We address challenges related to data integrity, security, and interoperability. The proposed solution uses smart contracts to automate processes and ensure immutable record-keeping throughout the supply chain.',
  },
  {
    title: 'Computer Vision for Autonomous Vehicles',
    abstract: 'An investigation into computer vision techniques for autonomous driving systems. This research focuses on object detection, semantic segmentation, and depth estimation using convolutional neural networks. We present a real-time system capable of identifying pedestrians, vehicles, and road signs with high accuracy.',
  },
];

/**
 * Test API Health
 */
async function testHealth() {
  try {
    console.log('\n🔍 Testing Health Endpoint...');
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', response.data.message);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

/**
 * Create Sample Theses
 */
async function createTheses() {
  console.log('\n📚 Creating Sample Theses...');
  const createdTheses = [];

  for (const thesis of sampleTheses) {
    try {
      const response = await axios.post(`${API_URL}/api/theses`, thesis);
      console.log(`✅ Created: "${thesis.title}"`);
      console.log(`   Tags: ${response.data.data.tags.join(', ')}`);
      createdTheses.push(response.data.data);
    } catch (error) {
      console.error(`❌ Failed to create thesis: ${error.response?.data?.message || error.message}`);
    }
  }

  return createdTheses;
}

/**
 * Test Get All Theses
 */
async function getAllTheses() {
  try {
    console.log('\n📖 Getting All Theses...');
    const response = await axios.get(`${API_URL}/api/theses?limit=10`);
    console.log(`✅ Found ${response.data.data.length} theses`);
    console.log(`   Total in database: ${response.data.pagination.total}`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Failed to get theses:', error.message);
    return [];
  }
}

/**
 * Test Semantic Search
 */
async function testSemanticSearch() {
  try {
    console.log('\n🔍 Testing Semantic Search...');
    const queries = [
      'machine learning and neural networks',
      'blockchain and distributed systems',
      'computer vision and autonomous driving',
    ];

    for (const query of queries) {
      const response = await axios.post(`${API_URL}/api/search/semantic`, {
        query,
        limit: 3,
        threshold: 0.3,
      });
      console.log(`\n  Query: "${query}"`);
      console.log(`  Found ${response.data.count} results:`);
      response.data.data.forEach((result, idx) => {
        console.log(`    ${idx + 1}. ${result.title} (score: ${result.score?.toFixed(3) || 'N/A'})`);
      });
    }
  } catch (error) {
    console.error('❌ Semantic search failed:', error.response?.data?.message || error.message);
  }
}

/**
 * Test Chat Functionality
 */
async function testChat() {
  try {
    console.log('\n💬 Testing Chat...');
    const messages = [
      'What theses are available in the repository?',
      'Tell me about research related to artificial intelligence',
    ];

    for (const message of messages) {
      const response = await axios.post(`${API_URL}/api/chat`, {
        message,
        topK: 3,
      });
      console.log(`\n  User: "${message}"`);
      console.log(`  AI: ${response.data.data.answer.substring(0, 200)}...`);
      console.log(`  Sources: ${response.data.data.sources.length} relevant theses`);
    }
  } catch (error) {
    console.error('❌ Chat failed:', error.response?.data?.message || error.message);
  }
}

/**
 * Test Get Stats
 */
async function testStats() {
  try {
    console.log('\n📊 Getting Repository Statistics...');
    const response = await axios.get(`${API_URL}/api/theses/stats`);
    console.log('✅ Statistics:');
    console.log(`   Total Theses: ${response.data.data.totalTheses}`);
    console.log(`   Unique Tags: ${response.data.data.totalUniqueTags}`);
    console.log(`   Top Tags: ${response.data.data.topTags.slice(0, 5).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to get stats:', error.message);
  }
}

/**
 * Test Get All Tags
 */
async function testGetAllTags() {
  try {
    console.log('\n🏷️  Getting All Tags...');
    const response = await axios.get(`${API_URL}/api/theses/tags/all`);
    console.log(`✅ Found ${response.data.count} unique tags:`);
    console.log(`   ${response.data.data.slice(0, 10).join(', ')}...`);
  } catch (error) {
    console.error('❌ Failed to get tags:', error.message);
  }
}

/**
 * Test Similar Theses
 */
async function testSimilarTheses(thesisId) {
  try {
    console.log('\n🔗 Finding Similar Theses...');
    const response = await axios.get(`${API_URL}/api/theses/${thesisId}/similar?limit=3`);
    console.log(`✅ Found ${response.data.data.length} similar theses:`);
    response.data.data.forEach((thesis, idx) => {
      console.log(`   ${idx + 1}. ${thesis.title} (similarity: ${thesis.score?.toFixed(3) || 'N/A'})`);
    });
  } catch (error) {
    console.error('❌ Failed to find similar theses:', error.message);
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  console.log('='.repeat(60));
  console.log('🚀 AI-Powered Thesis Repository - API Test Suite');
  console.log('='.repeat(60));

  // Test health
  const isHealthy = await testHealth();
  if (!isHealthy) {
    console.error('\n❌ Server is not responding. Make sure it is running!');
    process.exit(1);
  }

  // Wait a bit for server to be fully ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Create sample theses
  const createdTheses = await createTheses();

  // Wait for AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Get all theses
  const allTheses = await getAllTheses();

  // Test stats
  await testStats();

  // Test get all tags
  await testGetAllTags();

  // Test semantic search
  await testSemanticSearch();

  // Test similar theses (if we have any)
  if (allTheses.length > 0) {
    await testSimilarTheses(allTheses[0]._id);
  }

  // Test chat
  await testChat();

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test Suite Completed!');
  console.log('='.repeat(60));
  console.log('\nNext steps:');
  console.log('1. Check the created theses in MongoDB Atlas');
  console.log('2. Set up Vector Search index (see docs/ATLAS_SETUP.md)');
  console.log('3. Try the API endpoints in Postman (see docs/API_EXAMPLES.md)');
  console.log('4. Explore the chat functionality with different questions');
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  process.exit(1);
});

