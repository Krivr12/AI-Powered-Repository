/**
 * Interactive Chatbot Terminal Interface
 * 
 * A simple terminal-based interface to chat with the AI thesis repository chatbot.
 * 
 * Usage: 
 *   node scripts/chatbot.js
 *   npm run chatbot
 */

require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');
const chatService = require('../src/services/chatService');

// ANSI color codes
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

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function print(color, text) {
  console.log(colorize(color, text));
}

function printSeparator() {
  console.log(colorize('dim', '─'.repeat(70)));
}

/**
 * Display chat response
 */
function displayResponse(userMessage, response) {
  console.log();
  printSeparator();
  print('cyan', `👤 You: ${userMessage}`);
  printSeparator();
  
  print('green', '🤖 Assistant:');
  console.log(response.answer);
  
  if (response.sources && response.sources.length > 0) {
    console.log();
    print('yellow', `📚 Sources (${response.sources.length}):`);
    response.sources.forEach((source, index) => {
      console.log(`   ${index + 1}. ${colorize('bright', source.title)}`);
      if (source.tags && source.tags.length > 0) {
        console.log(`      Tags: ${source.tags.join(', ')}`);
      }
      if (source.relevanceScore !== undefined) {
        console.log(`      Relevance: ${(source.relevanceScore * 100).toFixed(1)}%`);
      }
    });
  }
  
  console.log();
}

/**
 * Show help message
 */
function showHelp() {
  console.log();
  print('bright', 'Available Commands:');
  console.log('  help, ?          - Show this help message');
  console.log('  clear, cls        - Clear conversation history');
  console.log('  history           - Show conversation history');
  console.log('  exit, quit, bye   - Exit the chatbot');
  console.log();
}

/**
 * Show conversation history
 */
function showHistory(conversationHistory) {
  console.log();
  print('blue', '📜 Conversation History:');
  if (conversationHistory.length === 0) {
    print('dim', '  (No messages yet)');
  } else {
    conversationHistory.forEach((msg, idx) => {
      const role = msg.role === 'user' ? '👤 User' : '🤖 Assistant';
      const color = msg.role === 'user' ? 'cyan' : 'green';
      const preview = msg.content.length > 80 
        ? msg.content.substring(0, 80) + '...' 
        : msg.content;
      print(color, `  ${idx + 1}. ${role}: ${preview}`);
    });
  }
  console.log();
}

/**
 * Main interactive chat function
 */
async function startChat() {
  // Connect to database
  print('blue', '📡 Connecting to MongoDB...');
  try {
    await connectDB();
    print('green', '✅ Connected to MongoDB\n');
  } catch (error) {
    print('red', `❌ Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }

  // Initialize readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Welcome message
  console.log();
  print('bright', '🤖 AI Thesis Repository Chatbot');
  print('dim', '='.repeat(70));
  print('green', 'Ready to chat! Type your questions about the thesis repository.');
  print('dim', 'Type "help" for commands or "exit" to quit.\n');

  let conversationHistory = [];

  // Main chat loop
  const askQuestion = () => {
    rl.question(colorize('cyan', 'You: '), async (input) => {
      const message = input.trim();

      // Handle empty input
      if (!message) {
        askQuestion();
        return;
      }

      // Handle commands
      const lowerMessage = message.toLowerCase();
      
      if (['exit', 'quit', 'bye', 'q'].includes(lowerMessage)) {
        print('yellow', '\n👋 Goodbye!');
        rl.close();
        await mongoose.connection.close();
        process.exit(0);
        return;
      }

      if (['clear', 'cls'].includes(lowerMessage)) {
        conversationHistory = [];
        print('yellow', '🗑️  Conversation history cleared!\n');
        askQuestion();
        return;
      }

      if (['help', '?'].includes(lowerMessage)) {
        showHelp();
        askQuestion();
        return;
      }

      if (lowerMessage === 'history') {
        showHistory(conversationHistory);
        askQuestion();
        return;
      }

      // Process chat message
      try {
        print('dim', '⏳ Thinking...');
        
        const response = await chatService.processMessage(message, {
          conversationHistory,
          topK: 3,
        });

        displayResponse(message, response);
        conversationHistory = response.conversationHistory;

      } catch (error) {
        print('red', `\n❌ Error: ${error.message}`);
        console.error(error);
        console.log();
      }

      // Continue the conversation
      askQuestion();
    });
  };

  // Start the chat
  askQuestion();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', async () => {
  print('yellow', '\n\n👋 Interrupted. Closing...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the chatbot
startChat().catch(async (error) => {
  print('red', `\n❌ Fatal error: ${error.message}`);
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});

