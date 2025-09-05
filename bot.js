const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'bot.log' })
  ]
});

// Validate environment variables
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Rate limiting storage
const userRequests = new Map();
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10; // 10 requests per minute
const MAX_MESSAGE_LENGTH = parseInt(process.env.MAX_MESSAGE_LENGTH) || 4000;

// Rate limiting function
function checkRateLimit(userId) {
  const now = Date.now();
  const userRequests = getUserRequests(userId);
  
  // Remove old requests outside the window
  const validRequests = userRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (validRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  // Add current request
  validRequests.push(now);
  setUserRequests(userId, validRequests);
  return true;
}

// Simple in-memory storage for rate limiting
const rateLimitStorage = new Map();

function getUserRequests(userId) {
  return rateLimitStorage.get(userId) || [];
}

function setUserRequests(userId, requests) {
  rateLimitStorage.set(userId, requests);
}

// Welcome message
const WELCOME_MESSAGE = `🤖 Welcome to ${process.env.BOT_NAME || 'OpenAI Assistant Bot'}!

I'm here to help you with any questions or conversations you'd like to have. I'm powered by OpenAI's advanced AI technology.

Available commands:
/start - Show this welcome message
/help - Get help and usage information

Just send me a message and I'll do my best to help you!`;

const HELP_MESSAGE = `📚 Help & Usage Information

How to use this bot:
• Simply send me any message or question
• I'll process it using OpenAI's AI and respond
• I can help with various topics including:
  - General questions and conversations
  - Creative writing and brainstorming
  - Problem solving and analysis
  - Educational content and explanations

Commands:
/start - Show welcome message
/help - Show this help message

Rate Limits:
• Maximum ${RATE_LIMIT_MAX} requests per minute per user
• This helps prevent API abuse and ensures fair usage

Tips:
• Be specific in your questions for better responses
• I can handle messages up to ${MAX_MESSAGE_LENGTH} characters
• If you encounter any issues, please try again later

Need more help? Just ask me anything!`;

// Error messages
const ERROR_MESSAGES = {
  RATE_LIMIT: '⏰ You\'re sending messages too quickly. Please wait a moment before trying again.',
  API_ERROR: '❌ Sorry, I encountered an error processing your request. Please try again later.',
  MESSAGE_TOO_LONG: `❌ Your message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
  INVALID_INPUT: '❌ I couldn\'t process your message. Please try rephrasing it.',
  OPENAI_ERROR: '❌ I\'m having trouble connecting to the AI service. Please try again later.'
};

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  logger.info(`User ${msg.from.id} started the bot`);
  
  bot.sendMessage(chatId, WELCOME_MESSAGE, {
    parse_mode: 'HTML'
  }).catch(error => {
    logger.error('Error sending start message:', error);
  });
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  logger.info(`User ${msg.from.id} requested help`);
  
  bot.sendMessage(chatId, HELP_MESSAGE, {
    parse_mode: 'HTML'
  }).catch(error => {
    logger.error('Error sending help message:', error);
  });
});

// Handle all other messages
bot.on('message', async (msg) => {
  // Skip if it's a command (already handled above)
  if (msg.text && msg.text.startsWith('/')) {
    return;
  }
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageText = msg.text;
  
  // Skip if no text content
  if (!messageText) {
    return;
  }
  
  logger.info(`Received message from user ${userId}: ${messageText.substring(0, 100)}...`);
  
  // Check message length
  if (messageText.length > MAX_MESSAGE_LENGTH) {
    bot.sendMessage(chatId, ERROR_MESSAGES.MESSAGE_TOO_LONG);
    return;
  }
  
  // Check rate limit
  if (!checkRateLimit(userId)) {
    logger.warn(`Rate limit exceeded for user ${userId}`);
    bot.sendMessage(chatId, ERROR_MESSAGES.RATE_LIMIT);
    return;
  }
  
  // Send typing indicator
  bot.sendChatAction(chatId, 'typing').catch(error => {
    logger.error('Error sending typing indicator:', error);
  });
  
  try {
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Respond in a friendly, helpful, and informative manner. Keep responses concise but comprehensive."
        },
        {
          role: "user",
          content: messageText
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('Empty response from OpenAI');
    }
    
    // Send response to user
    await bot.sendMessage(chatId, response, {
      parse_mode: 'HTML'
    });
    
    logger.info(`Successfully responded to user ${userId}`);
    
  } catch (error) {
    logger.error('Error processing message:', error);
    
    let errorMessage = ERROR_MESSAGES.API_ERROR;
    
    if (error.code === 'insufficient_quota') {
      errorMessage = '❌ API quota exceeded. Please try again later.';
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = '❌ API rate limit exceeded. Please try again later.';
    } else if (error.message.includes('OpenAI')) {
      errorMessage = ERROR_MESSAGES.OPENAI_ERROR;
    }
    
    bot.sendMessage(chatId, errorMessage).catch(sendError => {
      logger.error('Error sending error message:', sendError);
    });
  }
});

// Handle errors
bot.on('error', (error) => {
  logger.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  logger.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down bot...');
  bot.stopPolling();
  process.exit(0);
});

// Log bot startup
logger.info('Bot started successfully');
logger.info(`Rate limit: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW}ms`);
logger.info(`Max message length: ${MAX_MESSAGE_LENGTH} characters`);

module.exports = bot;
