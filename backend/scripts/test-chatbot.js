/**
 * Chatbot Testing Script
 * 
 * This script allows you to test the chatbot capabilities from the terminal.
 * It tests the RAG-based chatbot with semantic search integration.
 * 
 * Usage: 
 *   node scripts/test-chatbot.js
 *   node scripts/test-chatbot.js --interactive
 *   node scripts/test-chatbot.js --test-all
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const connectDB = require('../src/config/database');
const chatService = require('../src/services/chatService');
const logger = require('../src/utils/logger');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Print colored text
 */
function print(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

/**
 * Print a separator line
 */
function printSeparator() {
  console.log('\n' + '='.repeat(80) + '\n');
}

/**
 * Format and display chat response
 */
function displayResponse(userMessage, response) {
  printSeparator();
  print('cyan', `👤 USER: ${userMessage}`);
  printSeparator();
  
  print('green', `🤖 ASSISTANT:`);
  console.log(response.answer);
  
  if (response.sources && response.sources.length > 0) {
    print('yellow', `\n📚 Sources (${response.sources.length}):`);
    response.sources.forEach((source, index) => {
      console.log(`  ${index + 1}. ${source.title}`);
      console.log(`     Tags: ${source.tags.join(', ')}`);
      console.log(`     Relevance Score: ${source.relevanceScore?.toFixed(4) || 'N/A'}`);
      console.log(`     ID: ${source.id}`);
    });
  } else {
    print('dim', '\n📚 No sources found');
  }
  
  printSeparator();
}

/**
 * Run predefined test cases
 */
async function runTestCases() {
  print('bright', '🧪 Running Predefined Test Cases\n');
  
  const testCases = [
    {
      name: 'General Query',
      message: 'What theses are available in the repository?',
    },
    {
      name: 'Topic-Specific Query',
      message: 'Tell me about machine learning research',
    },
    {
      name: 'Specific Technology',
      message: 'What research exists on neural networks?',
    },
    {
      name: 'Abstract Question',
      message: 'What are the latest research trends?',
    },
  ];

  let conversationHistory = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    print('magenta', `\n[Test ${i + 1}/${testCases.length}] ${testCase.name}`);
    
    try {
      const response = await chatService.processMessage(testCase.message, {
        conversationHistory,
        topK: 3,
      });

      displayResponse(testCase.message, response);
      conversationHistory = response.conversationHistory;

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      print('red', `❌ Error: ${error.message}`);
      console.error(error);
    }
  }

  print('green', '\n✅ All test cases completed!');
}

/**
 * Interactive mode - chat with the bot
 */
async function interactiveMode() {
  print('bright', '💬 Interactive Chat Mode');
  print('dim', 'Type your questions. Type "exit", "quit", or "bye" to end.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.cyan + 'You: ' + colors.reset,
  });

  let conversationHistory = [];

  rl.prompt();

  rl.on('line', async (input) => {
    const message = input.trim();

    if (!message) {
      rl.prompt();
      return;
    }

    // Exit commands
    if (['exit', 'quit', 'bye', 'q'].includes(message.toLowerCase())) {
      print('yellow', '\n👋 Goodbye!');
      rl.close();
      return;
    }

    // Clear conversation
    if (message.toLowerCase() === 'clear') {
      conversationHistory = [];
      print('yellow', '🗑️  Conversation history cleared!\n');
      rl.prompt();
      return;
    }

    // Show history
    if (message.toLowerCase() === 'history') {
      print('blue', '\n📜 Conversation History:');
      if (conversationHistory.length === 0) {
        print('dim', '  (No messages yet)');
      } else {
        conversationHistory.forEach((msg, idx) => {
          const role = msg.role === 'user' ? '👤 USER' : '🤖 ASSISTANT';
          const color = msg.role === 'user' ? 'cyan' : 'green';
          print(color, `  ${idx + 1}. ${role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
        });
      }
      console.log();
      rl.prompt();
      return;
    }

    // Process message
    try {
      print('dim', '\n⏳ Processing...\n');
      
      const response = await chatService.processMessage(message, {
        conversationHistory,
        topK: 3,
      });

      displayResponse(message, response);
      conversationHistory = response.conversationHistory;
    } catch (error) {
      print('red', `\n❌ Error: ${error.message}`);
      console.error(error);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    print('yellow', '\n👋 Chat session ended.');
    process.exit(0);
  });
}

/**
 * Test specific features
 */
async function testFeatures() {
  print('bright', '🔍 Testing Chatbot Features\n');

  // Test 1: Basic query
  print('magenta', '[Test 1] Basic Query');
  try {
    const response1 = await chatService.processMessage('What theses are available?', {
      conversationHistory: [],
      topK: 3,
    });
    print('green', '✅ Basic query works');
    console.log(`   Answer length: ${response1.answer.length} characters`);
    console.log(`   Sources found: ${response1.sources.length}`);
  } catch (error) {
    print('red', `❌ Basic query failed: ${error.message}`);
  }

  // Test 2: Conversation history
  print('magenta', '\n[Test 2] Conversation History');
  try {
    const response1 = await chatService.processMessage('Tell me about AI research', {
      conversationHistory: [],
      topK: 2,
    });
    
    const response2 = await chatService.processMessage('What about the first one?', {
      conversationHistory: response1.conversationHistory,
      topK: 2,
    });
    
    print('green', '✅ Conversation history works');
    console.log(`   History length: ${response2.conversationHistory.length} messages`);
  } catch (error) {
    print('red', `❌ Conversation history failed: ${error.message}`);
  }

  // Test 3: No results handling
  print('magenta', '\n[Test 3] No Results Handling');
  try {
    const response = await chatService.processMessage('xyzabc123nonexistenttopic', {
      conversationHistory: [],
      topK: 3,
    });
    
    if (response.sources.length === 0) {
      print('green', '✅ No results handled correctly');
      console.log(`   Response: ${response.answer.substring(0, 100)}...`);
    } else {
      print('yellow', '⚠️  Unexpected: Found sources for nonexistent topic');
    }
  } catch (error) {
    print('red', `❌ No results test failed: ${error.message}`);
  }

  // Test 4: Suggested questions
  print('magenta', '\n[Test 4] Suggested Questions');
  try {
    const suggestions = await chatService.getSuggestedQuestions();
    print('green', '✅ Suggested questions generated');
    console.log(`   Suggestions: ${suggestions.length}`);
    suggestions.forEach((suggestion, idx) => {
      console.log(`   ${idx + 1}. ${suggestion}`);
    });
  } catch (error) {
    print('red', `❌ Suggested questions failed: ${error.message}`);
  }

  printSeparator();
  print('green', '✅ Feature testing completed!');
}

/**
 * Main function
 */
async function main() {
  try {
    print('bright', '🤖 Chatbot Testing Script');
    print('dim', '='.repeat(80));
    print('dim', `Time: ${new Date().toLocaleString()}\n`);

    // Connect to database
    print('blue', '📡 Connecting to MongoDB...');
    await connectDB();
    print('green', '✅ Connected to MongoDB\n');

    // Check command line arguments
    const args = process.argv.slice(2);
    const isInteractive = args.includes('--interactive') || args.includes('-i');
    const isTestAll = args.includes('--test-all') || args.includes('-a');
    const isFeatures = args.includes('--features') || args.includes('-f');

    if (isInteractive) {
      await interactiveMode();
    } else if (isFeatures) {
      await testFeatures();
      await mongoose.connection.close();
    } else if (isTestAll) {
      await runTestCases();
      await testFeatures();
      await mongoose.connection.close();
    } else {
      // Default: run test cases
      await runTestCases();
      await mongoose.connection.close();
    }

    print('green', '\n✅ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    print('red', `\n❌ Fatal error: ${error.message}`);
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  print('yellow', '\n\n👋 Interrupted by user. Closing...');
  await mongoose.connection.close();
  process.exit(0);
});

// Run the script
main();

