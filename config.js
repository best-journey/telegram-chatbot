require('dotenv').config();

const config = {
  // Telegram Bot Configuration
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    polling: true
  },
  
  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
  },
  
  // Bot Configuration
  bot: {
    name: process.env.BOT_NAME || 'OpenAI Assistant Bot',
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH) || 4000,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10 // 10 requests per minute
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'bot.log'
  },
  
  // System Messages
  messages: {
    welcome: `🤖 Welcome to ${process.env.BOT_NAME || 'OpenAI Assistant Bot'}!

I'm here to help you with any questions or conversations you'd like to have. I'm powered by OpenAI's advanced AI technology.

Available commands:
/start - Show this welcome message
/help - Get help and usage information

Just send me a message and I'll do my best to help you!`,
    
    help: `📚 Help & Usage Information

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
• Maximum ${process.env.RATE_LIMIT_MAX_REQUESTS || 10} requests per minute per user
• This helps prevent API abuse and ensures fair usage

Tips:
• Be specific in your questions for better responses
• I can handle messages up to ${process.env.MAX_MESSAGE_LENGTH || 4000} characters
• If you encounter any issues, please try again later

Need more help? Just ask me anything!`,
    
    errors: {
      rateLimit: '⏰ You\'re sending messages too quickly. Please wait a moment before trying again.',
      apiError: '❌ Sorry, I encountered an error processing your request. Please try again later.',
      messageTooLong: `❌ Your message is too long. Please keep it under ${process.env.MAX_MESSAGE_LENGTH || 4000} characters.`,
      invalidInput: '❌ I couldn\'t process your message. Please try rephrasing it.',
      openaiError: '❌ I\'m having trouble connecting to the AI service. Please try again later.',
      quotaExceeded: '❌ API quota exceeded. Please try again later.',
      rateLimitExceeded: '❌ API rate limit exceeded. Please try again later.'
    }
  }
};

// Validation
const requiredEnvVars = ['TELEGRAM_BOT_TOKEN', 'OPENAI_API_KEY'];
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

module.exports = config;
