/**
 * Simple Chatbot Terminal Interface
 * 
 * A simple terminal-based chatbot using only Llama 3.2 (no semantic search/RAG).
 * 
 * Usage: 
 *   node scripts/simple-chatbot.js
 *   npm run simple-chatbot
 */

require('dotenv').config();

// Force development mode to use Ollama (unless explicitly set to production)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}
const readline = require('readline');
const simpleChatService = require('../src/services/simpleChatService');

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
  // Initialize readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Welcome message
  console.log();
  print('bright', '🤖 Simple Llama 3.2 Chatbot');
  print('dim', '='.repeat(70));
  print('green', 'Ready to chat! This chatbot uses only Llama 3.2 (no semantic search).');
  print('dim', 'Type "help" for commands or "exit" to quit.\n');

  let conversationHistory = [];

  // Get initial greeting
  try {
    print('dim', '⏳ Loading...');
    const greeting = await simpleChatService.getGreeting();
    print('green', `🤖 ${greeting}\n`);
  } catch (error) {
    print('yellow', "🤖 Hello! I'm your AI assistant. How can I help you today?\n");
  }

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
        
        const response = await simpleChatService.processMessage(message, {
          conversationHistory,
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
process.on('SIGINT', () => {
  print('yellow', '\n\n👋 Interrupted. Goodbye!');
  process.exit(0);
});

// Start the chatbot
startChat().catch((error) => {
  print('red', `\n❌ Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});

