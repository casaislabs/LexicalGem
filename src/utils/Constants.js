module.exports = {
    // Bot Information
    BOT_INFO: {
        NAME: 'LexicalGem',
        VERSION: '2.0.0',
        DESCRIPTION: 'Learn a word you didn\'t know you needed.',
        TAGLINE: 'Your daily dose of linguistic treasures'
    },

    // Commands
            COMMANDS: {
            START: '/start',
            WORD: '/word',
            STATS: '/stats',
            HELP: '/help',
            WORD_OF_THE_DAY: '/wordoftheday',
            HISTORY: '/history',
            RANDOM: '/random',
            DIFFICULTY: '/difficulty',
            SHARE: '/share'
        },

    // Messages
    MESSAGES: {
        WELCOME: `🤖 *Welcome to LexicalGem!*

"Learn a word you didn't know you needed."

✨ *How to use:*
Type /word to receive a rare, elegant, or fun word with its definition.

📚 *About:*
LexicalGem is your daily dose of linguistic treasures. Discover words that will make your vocabulary sparkle!

💡 *Commands:*
/word - Get a random rare word
/stats - View bot statistics
/help - Show help message`,

        HELP: `🤖 *LexicalGem Commands*

📚 *Basic Commands:*
/start - Welcome message and introduction
/word - Get a random rare word (no repetition until all shown)
/stats - Show detailed bot statistics
/help - Show this help message

🚀 *Advanced Commands:*
/wordoftheday - Get today's special word
/history - View your word discovery history
/random - Get a completely random word (can repeat)
/difficulty - Change word difficulty (easy/medium/hard)
/share - Share a word with friends

💡 *Tip:* Use /word whenever you want to expand your vocabulary with something special!`,

        UNKNOWN_COMMAND: `💎 *LexicalGem*

I'm here to share rare words with you! 

Try typing /word to discover a linguistic gem, or /help to see all available commands.`,

        NO_WORDS_AVAILABLE: '❌ No words available at the moment. Please try again later.',

        TOKEN_NOT_CONFIGURED: '❌ Bot token not configured! Please set BOT_TOKEN_CODE in your .env file',
        TOKEN_EXAMPLE: '💡 Example: BOT_TOKEN_CODE=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz',
        TOKEN_SUCCESS: '✅ Bot token configured successfully',
        
        // Advanced Commands Messages
        WORD_OF_THE_DAY: '🌟 *Word of the Day*',
        WORD_OF_THE_DAY_TITLE: '🌟 *Word of the Day*',
        HISTORY_TITLE: '📚 *Your Word History*',
        NO_HISTORY: 'You haven\'t discovered any words yet.',
        DIFFICULTY_CHANGED: 'Difficulty level updated successfully!',
        INVALID_DIFFICULTY: 'Invalid difficulty level. Use: easy, medium, or hard',
        SHARE_MESSAGE: 'Share this word with your friends!',
        RANDOM_WORD_TITLE: '🎲 *Random Word*'
    },

    // File Paths
    PATHS: {
        WORDS_JSON: 'src/words.json',
        CONFIG: '../config.js'
    },

    // Fallback Words
    FALLBACK_WORDS: [
        {
            word: "Serendipity",
            definition: "The occurrence of fortunate and unexpected discoveries by chance.",
            emoji: "🧠"
        },
        {
            word: "Peregrine",
            definition: "Uncommon, strange, or wandering.",
            emoji: "📘"
        },
        {
            word: "Ineffable",
            definition: "Too great or beautiful to be expressed in words.",
            emoji: "🎭"
        }
    ],

    // Error Messages
    ERRORS: {
        WORDS_LOAD_FAILED: 'Failed to load words from JSON file',
        INVALID_WORD_STRUCTURE: 'Invalid word structure found in JSON',
        BOT_INITIALIZATION_FAILED: 'Failed to initialize bot'
    },

    // Log Messages
    LOGS: {
        BOT_STARTING: '🤖 LexicalGem bot is starting...',
        BOT_READY: '🤖 LexicalGem bot is ready!',
        COMMANDS_AVAILABLE: '📝 Commands available: /start, /word, /stats, /help',
        USING_ENV: '🔐 Using environment variables for configuration',
        WORDS_LOADED: '📚 Loaded {count} valid words from words.json',
        USING_FALLBACK: '⚠️  Using fallback words',
        CYCLE_RESET: '🔄 All words have been used, starting new cycle',
        CYCLE_MANUAL_RESET: '🔄 Word cycle manually reset',
        SHUTDOWN_GRACEFUL: '🛑 Shutting down LexicalGem bot gracefully...',
        SHUTDOWN_SIGTERM: '🛑 Received SIGTERM, shutting down...',
        CONNECTION_RESET: '🔄 Connection reset, attempting to reconnect...'
    }
}; 