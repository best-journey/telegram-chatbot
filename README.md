# Telegram OpenAI Bot

A powerful Telegram bot integrated with OpenAI's API to provide intelligent conversational responses. Built with Node.js and designed for scalability and reliability.

## Features

- 🤖 **AI-Powered Responses**: Uses OpenAI's GPT models for intelligent conversations
- 🔒 **Secure**: API keys managed through environment variables
- ⚡ **Rate Limiting**: Built-in protection against API abuse
- 📝 **Comprehensive Logging**: Detailed logs for monitoring and debugging
- 🛡️ **Error Handling**: Robust error handling with user-friendly messages
- 🎯 **Command Support**: Built-in `/start` and `/help` commands
- 📊 **Monitoring**: Real-time logging and error tracking

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenAI API Key (from [OpenAI Platform](https://platform.openai.com/))

## Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd telegram-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file with your actual values:
   ```env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   BOT_NAME=OpenAI Assistant Bot
   MAX_MESSAGE_LENGTH=4000
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX_REQUESTS=10
   LOG_LEVEL=info
   ```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | - | ✅ |
| `OPENAI_API_KEY` | Your OpenAI API key | - | ✅ |
| `BOT_NAME` | Name of your bot | "OpenAI Assistant Bot" | ❌ |
| `MAX_MESSAGE_LENGTH` | Maximum message length to process | 4000 | ❌ |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | 60000 | ❌ |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window per user | 10 | ❌ |
| `LOG_LEVEL` | Logging level (error, warn, info, debug) | "info" | ❌ |
| `OPENAI_MODEL` | OpenAI model to use | "gpt-3.5-turbo" | ❌ |
| `OPENAI_MAX_TOKENS` | Maximum tokens for OpenAI response | 1000 | ❌ |
| `OPENAI_TEMPERATURE` | OpenAI temperature setting | 0.7 | ❌ |

## Usage

### Starting the Bot

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### Bot Commands

- `/start` - Display welcome message and bot information
- `/help` - Show detailed help and usage instructions

### Interacting with the Bot

Simply send any text message to the bot, and it will:
1. Process your message using OpenAI's AI
2. Generate an intelligent response
3. Send the response back to you

## Features in Detail

### Rate Limiting
- Prevents API abuse by limiting requests per user
- Configurable rate limits (default: 10 requests per minute)
- User-friendly error messages when limits are exceeded

### Error Handling
- Comprehensive error handling for all scenarios
- User-friendly error messages
- Detailed logging for debugging
- Graceful handling of API failures

### Logging
- Structured logging with Winston
- Console and file output
- Configurable log levels
- Error tracking and monitoring

### Security
- Environment variable management
- No hardcoded secrets
- Input validation and sanitization
- Rate limiting protection

## Project Structure

```
telegram-bot/
├── bot.js              # Main bot application
├── config.js           # Configuration management
├── package.json        # Dependencies and scripts
├── env.example         # Environment variables template
├── .gitignore         # Git ignore rules
├── README.md          # This file
└── bot.log            # Log file (created at runtime)
```

## API Integration

### OpenAI Integration
- Uses OpenAI's Chat Completions API
- Configurable model selection (GPT-3.5-turbo by default)
- Token limits and temperature settings
- Error handling for API failures

### Telegram Integration
- Uses node-telegram-bot-api library
- Polling-based message handling
- Typing indicators for better UX
- Command and message handling

## Monitoring and Logs

The bot generates detailed logs including:
- User interactions
- API calls and responses
- Error occurrences
- Rate limiting events
- System events

Logs are written to both console and `bot.log` file.

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if the bot token is correct
   - Verify the bot is running and not crashed
   - Check logs for error messages

2. **OpenAI API errors**
   - Verify your API key is valid
   - Check your OpenAI account quota
   - Ensure you have sufficient credits

3. **Rate limiting issues**
   - Adjust rate limit settings in `.env`
   - Check if multiple users are hitting limits

4. **Message too long errors**
   - Increase `MAX_MESSAGE_LENGTH` in `.env`
   - Or ask users to send shorter messages

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error messages
3. Create an issue in the repository

## Changelog

### v1.0.0
- Initial release
- OpenAI GPT integration
- Rate limiting
- Comprehensive error handling
- Logging system
- Command support
- Environment configuration
