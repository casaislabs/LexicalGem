# 🤖 LexicalGem - Telegram Bot v2.0.0

> "Learn a word you didn't know you needed."

A **professional and educational** Telegram bot that sends unusual, elegant, or fun words along with their definitions when you type the `/word` command. Built with enterprise-grade architecture, comprehensive logging, and robust error handling. Designed for language lovers, writers, curious minds, and anyone eager to expand their vocabulary creatively.

## ✨ Features

- **Main command**: `/word` - Returns a rare or uncommon word plus its definition
- **Advanced no repetition logic** - Ensures all words are shown before repeating with cycle tracking
- **Comprehensive statistics** - Track progress, requests, unique users, and uptime
- **External word database** - Words stored in `src/words.json` for easy management
- **Enterprise-grade architecture** - Modular design with separation of concerns
- **Professional logging system** - Colored, structured logging with multiple levels
- **Robust error handling** - Graceful error recovery and comprehensive validation
- **Progress tracking** - See your discovery progress with each word
- **Responses formatted with Markdown** for clear readability
- **Collection of 20+ unique words** (easily expandable)
- **Built with node-telegram-bot-api** for fast, efficient interaction
- **Beautiful emoji-enhanced responses** for a delightful user experience
- **Graceful shutdown handling** and automatic reconnection
- **Periodic health monitoring** and statistics logging

## 🛠️ Technologies Used

- **Node.js** (v14+)
- **node-telegram-bot-api** library
- **dotenv** for environment management
- **chalk** for colored logging
- **Modular architecture** with separation of concerns
- **Professional logging system** with multiple levels
- **Comprehensive validation** and error handling

## 📁 Project Structure

```
src/
├── index.js              # Main entry point
├── bot/
│   ├── BotManager.js     # Bot lifecycle management
│   └── CommandHandler.js # Command processing
├── services/
│   ├── UserService.js    # User data management
│   └── WordService.js    # Word management service
├── utils/
│   ├── Logger.js         # Professional logging
│   ├── Validator.js      # Data validation
│   └── Constants.js      # Application constants
└── words.json           # Word database
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- A Telegram bot token (get it from [@BotFather](https://t.me/botfather))
- dotenv package (will be installed automatically)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd LexicalGem
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your bot token**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit the .env file and add your bot token
   # Replace 'your_bot_token_here' with your actual bot token
   ```

4. **Get your Telegram Bot Token**
   - Open Telegram and search for [@BotFather](https://t.me/botfather)
   - Send `/newbot` command
   - Follow the instructions to create your bot
   - Copy the token provided by BotFather

5. **Configure the .env file**
   ```bash
   # Open .env file and replace with your actual token
   BOT_TOKEN_CODE=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

6. **Run the bot**
   ```bash
   npm start
   ```

### Configuration

The bot uses environment variables for secure configuration:

1. **Copy the example file:**
   ```bash
   cp env.example .env
   ```

2. **Edit `.env` and add your bot token:**
   ```env
   # Your Telegram Bot Token (get it from @BotFather)
   BOT_TOKEN_CODE=your_actual_bot_token_here
   
   # Optional: Set to 'true' for debug logging
   DEBUG=false
   
   # Optional: Set to 'true' for development mode
   NODE_ENV=production
   ```

3. **Important:** The `.env` file is automatically ignored by git to keep your token secure
4. **The bot will validate the token on startup** and show helpful error messages if not configured

## 📱 Bot Commands

### 📚 Basic Commands
- `/start` - Welcome message and introduction with command overview
- `/word` - Get a random rare word with definition and progress tracking
- `/stats` - Show comprehensive bot statistics including uptime and user metrics
- `/help` - Show detailed help message with all available commands

### 🚀 Advanced Commands
- `/wordoftheday` - Get today's special word (same for everyone)
- `/history` - View your personal word discovery history
- `/random` - Get a completely random word (can repeat)
- `/difficulty` - Change word difficulty level (easy/medium/hard)
- `/share` - Share a word with friends via the bot

## 💡 Sample Responses

```
🧠 Serendipity — The occurrence of fortunate and unexpected discoveries by chance.

📊 Progress: 15/20 words discovered (75% complete)
🔥 Streak: 3 days

💡 Tip: Use /history to see your discovered words!
```

```
🌟 Word of the Day

🌈 Iridescent — Iridescent describes surfaces or materials that display a spectrum of shimmering colors that shift and change depending on the angle of observation. This optical phenomenon is observed in nature in soap bubbles, butterfly wings, and peacock feathers, symbolizing change, mystery, and allure.

📅 Today's special word for everyone!
```

## 🎯 Purpose

Showcasing how a simple but well-executed bot can deliver educational value and a charming user experience with minimal setup. Perfect for portfolios demonstrating bot development with Node.js and Telegram API.

## 🔧 Customization

### Adding More Words

To add more words to the collection, simply edit the `src/words.json` file:

```json
[
  {
    "word": "YourWord",
    "definition": "Your definition here.",
    "emoji": "🎯"
  }
]
```

The bot will automatically load the updated words on restart.

### Enterprise-Grade Architecture

The bot features a professional, modular architecture:

- **Separation of concerns**: Each component has a single responsibility
- **Service-oriented design**: WordService handles all word-related operations
- **Command handler**: Centralized command processing with error handling
- **Professional logging**: Structured, colored logging with multiple levels
- **Comprehensive validation**: Input validation and data sanitization
- **Error recovery**: Graceful error handling and fallback mechanisms
- **Lifecycle management**: Proper initialization and shutdown procedures
- **Health monitoring**: Periodic statistics and health checks

### Extending Functionality

The bot is designed to be easily extensible. You can:
- Connect to external dictionary APIs
- Add word categories or themes
- Implement user preferences
- Add word of the day functionality
- Create word quizzes or games

## 📝 Available Scripts

- `npm start` - Start the bot
- `npm test` - Run tests (placeholder)

## 🔒 Security Features

- **Environment variables**: Sensitive data stored in `.env` file
- **Git ignore**: `.env` file automatically excluded from version control
- **Token validation**: Bot validates token on startup
- **Error handling**: Graceful error recovery without exposing sensitive data
- **Input validation**: All user inputs are validated and sanitized

## 🚨 Troubleshooting

### Common Issues

1. **"Bot token not configured"**
   - Make sure you've created a `.env` file
   - Ensure `BOT_TOKEN_CODE` is set correctly
   - Verify your token from @BotFather

2. **"Failed to initialize bot"**
   - Check your internet connection
   - Verify the bot token is correct
   - Ensure the bot hasn't been deleted in Telegram

3. **"No words available"**
   - Check that `src/words.json` exists and is valid JSON
   - Verify the file structure matches the expected format

### Debug Mode

To enable debug logging, set in your `.env` file:
```env
DEBUG=true
```

## 🤝 Contributing

Feel free to contribute by:
- Adding more rare words to the collection
- Improving the bot's functionality
- Enhancing the user interface
- Adding new features

## 📄 License

ISC License

---

**Made with ❤️ for language enthusiasts everywhere** 