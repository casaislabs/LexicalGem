// Load environment variables
require('dotenv').config();

// Configuration file for LexicalGem bot
// Bot token is loaded from .env file (BOT_TOKEN_CODE)

module.exports = {
    // Your Telegram bot token from @BotFather (loaded from .env)
    botToken: process.env.BOT_TOKEN_CODE || 'YOUR_BOT_TOKEN_HERE',
    
    // Bot configuration options
    botOptions: {
        polling: true
    },
    
    // Bot information
    botInfo: {
        name: 'LexicalGem',
        version: '1.0.0',
        description: 'Learn a word you didn\'t know you needed.'
    }
}; 