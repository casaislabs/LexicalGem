const Logger = require('../utils/Logger');
const Constants = require('../utils/Constants');
const Validator = require('../utils/Validator');
const UserService = require('../services/UserService');

class CommandHandler {
    constructor(bot, wordService) {
        this.bot = bot;
        this.wordService = wordService;
        this.userService = new UserService();
        this.commands = new Map();
        
        this.initializeCommands();
    }

    /**
     * Initialize all bot commands
     */
    initializeCommands() {
        // Basic commands
        this.registerCommand(Constants.COMMANDS.START, this.handleStart.bind(this));
        this.registerCommand(Constants.COMMANDS.WORD, this.handleWord.bind(this));
        this.registerCommand(Constants.COMMANDS.STATS, this.handleStats.bind(this));
        this.registerCommand(Constants.COMMANDS.HELP, this.handleHelp.bind(this));
        
        // Advanced commands
        this.registerCommand(Constants.COMMANDS.WORD_OF_THE_DAY, this.handleWordOfTheDay.bind(this));
        this.registerCommand(Constants.COMMANDS.HISTORY, this.handleHistory.bind(this));
        this.registerCommand(Constants.COMMANDS.RANDOM, this.handleRandom.bind(this));
        this.registerCommand(Constants.COMMANDS.DIFFICULTY, this.handleDifficulty.bind(this));
        this.registerCommand(Constants.COMMANDS.SHARE, this.handleShare.bind(this));
    }

    /**
     * Register a command handler
     * @param {string} command - Command string
     * @param {Function} handler - Command handler function
     */
    registerCommand(command, handler) {
        this.commands.set(command, handler);
        
        // Register with Telegram bot - escape special characters in regex
        const escapedCommand = command.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        this.bot.onText(new RegExp(`^${escapedCommand}$`), async (msg) => {
            try {
                await this.executeCommand(command, msg);
            } catch (error) {
                Logger.error(`Error executing command ${command}`, { 
                    error: error.message,
                    userId: msg.from?.id,
                    chatId: msg.chat?.id 
                });
                await this.handleError(msg.chat.id, error);
            }
        });
    }

    /**
     * Execute a command with proper error handling
     * @param {string} command - Command to execute
     * @param {Object} msg - Telegram message object
     */
    async executeCommand(command, msg) {
        const handler = this.commands.get(command);
        if (!handler) {
            Logger.warn(`No handler found for command: ${command}`);
            return;
        }

        const startTime = Date.now();
        Logger.debug(`Executing command: ${command}`, {
            userId: msg.from?.id,
            chatId: msg.chat?.id,
            username: msg.from?.username
        });

        await handler(msg);

        const executionTime = Date.now() - startTime;
        Logger.debug(`Command executed successfully`, {
            command,
            executionTime: `${executionTime}ms`
        });
    }

    /**
     * Handle /start command
     * @param {Object} msg - Telegram message object
     */
    async handleStart(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in start command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);
        
        Logger.bot('Start command executed', {
            userId: from.id,
            username: from.username,
            chatId: chat.id
        });

        await this.bot.sendMessage(chat.id, Constants.MESSAGES.WELCOME, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle /word command
     * @param {Object} msg - Telegram message object
     */
    async handleWord(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in word command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);

        if (!this.wordService.isReady()) {
            Logger.warn('Word service not ready', { userId: from.id });
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.NO_WORDS_AVAILABLE, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        const randomWord = this.wordService.getRandomWord();
        
        if (!randomWord) {
            Logger.error('Failed to get random word', { userId: from.id });
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.NO_WORDS_AVAILABLE, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        // Add to user history
        this.userService.addToHistory(from.id, randomWord);

        const stats = this.wordService.getStats();
        const userStats = this.userService.getUserStats(from.id);
        
        const wordMessage = `${randomWord.emoji} *${randomWord.word}* — ${randomWord.definition}

📊 *Progress:* ${stats.usedWords}/${stats.totalWords} words discovered (${stats.cycleProgress}% complete)
🔥 *Streak:* ${userStats.streak} days

💡 *Tip:* Use /history to see your discovered words!`;

        Logger.bot('Word command executed', {
            userId: from.id,
            word: randomWord.word,
            progress: `${stats.usedWords}/${stats.totalWords}`
        });

        await this.bot.sendMessage(chat.id, wordMessage, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle /stats command
     * @param {Object} msg - Telegram message object
     */
    async handleStats(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in stats command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);
        
        const stats = this.wordService.getStats();
        
        const statsMessage = `📊 *LexicalGem Statistics*

📚 *Word Collection:*
• Total words: *${stats.totalWords}*
• Words discovered: *${stats.usedWords}*
• Remaining in cycle: *${stats.remainingWords}*
• Cycle progress: *${stats.cycleProgress}%*

🤖 *Bot Activity:*
• Total requests: *${stats.totalRequests}*
• Unique users: *${stats.uniqueUsers}*
• Uptime: *${stats.uptime}*

${stats.remainingWords === 0 ? '🔄 All words have been shown! Next /word will start a new cycle.' : '💡 Keep exploring to see all our linguistic gems!'}`;

        Logger.bot('Stats command executed', {
            userId: from.id,
            stats: {
                totalWords: stats.totalWords,
                usedWords: stats.usedWords,
                totalRequests: stats.totalRequests
            }
        });

        await this.bot.sendMessage(chat.id, statsMessage, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle /help command
     * @param {Object} msg - Telegram message object
     */
    async handleHelp(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in help command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);
        
        Logger.bot('Help command executed', {
            userId: from.id,
            username: from.username
        });

        await this.bot.sendMessage(chat.id, Constants.MESSAGES.HELP, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle /wordoftheday command
     * @param {Object} msg - Telegram message object
     */
    async handleWordOfTheDay(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in wordoftheday command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);

        if (!this.wordService.isReady()) {
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.NO_WORDS_AVAILABLE, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        const words = this.wordService.words;
        const wordOfTheDay = this.userService.getWordOfTheDay(words);
        
        // Add to user history
        this.userService.addToHistory(from.id, wordOfTheDay);

        const wordMessage = `${Constants.MESSAGES.WORD_OF_THE_DAY}

${wordOfTheDay.emoji} *${wordOfTheDay.word}* — ${wordOfTheDay.definition}

📅 *Today's special word for everyone!*`;

        Logger.bot('Word of the day command executed', {
            userId: from.id,
            word: wordOfTheDay.word
        });

        await this.bot.sendMessage(chat.id, wordMessage, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle /history command
     * @param {Object} msg - Telegram message object
     */
    async handleHistory(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in history command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);

        const history = this.userService.getHistory(from.id, 10);
        
        if (history.length === 0) {
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.NO_HISTORY, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        let historyMessage = `${Constants.MESSAGES.HISTORY}\n\n`;
        
        history.forEach((entry, index) => {
            const date = new Date(entry.timestamp).toLocaleDateString();
            historyMessage += `${index + 1}. ${entry.emoji} *${entry.word}* (${date})\n`;
        });

        historyMessage += `\n📊 *Total words discovered:* ${history.length}`;

        Logger.bot('History command executed', {
            userId: from.id,
            historyLength: history.length
        });

        await this.bot.sendMessage(chat.id, historyMessage, { 
            parse_mode: 'Markdown' 
        });
    }



    /**
     * Handle /random command
     * @param {Object} msg - Telegram message object
     */
    async handleRandom(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in random command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);

        if (!this.wordService.isReady()) {
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.NO_WORDS_AVAILABLE, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        const words = this.wordService.words;
        const randomWord = this.userService.getRandomWord(words);
        
        // Add to user history
        this.userService.addToHistory(from.id, randomWord);

        const wordMessage = `${Constants.MESSAGES.RANDOM_WORD_TITLE}

${randomWord.emoji} *${randomWord.word}* — ${randomWord.definition}

🎲 *Completely random selection (may repeat)*`;

        Logger.bot('Random command executed', {
            userId: from.id,
            word: randomWord.word
        });

        await this.bot.sendMessage(chat.id, wordMessage, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle /difficulty command
     * @param {Object} msg - Telegram message object
     */
    async handleDifficulty(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in difficulty command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);

        const text = msg.text.toLowerCase();
        const difficulty = text.includes('easy') ? 'easy' : 
                          text.includes('hard') ? 'hard' : 
                          text.includes('medium') ? 'medium' : null;

        if (!difficulty) {
            const helpMessage = `🎯 *Difficulty Settings*

Current difficulty: *${this.userService.getUserStats(from.id).difficulty}*

To change difficulty, use:
/difficulty easy
/difficulty medium  
/difficulty hard

💡 *Note:* Difficulty affects word selection preferences.`;

            await this.bot.sendMessage(chat.id, helpMessage, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        const success = this.userService.setDifficulty(from.id, difficulty);
        
        if (success) {
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.DIFFICULTY_CHANGED, { 
                parse_mode: 'Markdown' 
            });
        } else {
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.INVALID_DIFFICULTY, { 
                parse_mode: 'Markdown' 
            });
        }

        Logger.bot('Difficulty command executed', {
            userId: from.id,
            difficulty
        });
    }

    /**
     * Handle /share command
     * @param {Object} msg - Telegram message object
     */
    async handleShare(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in share command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);

        // Get a random word to share
        if (!this.wordService.isReady()) {
            await this.bot.sendMessage(chat.id, Constants.MESSAGES.NO_WORDS_AVAILABLE, { 
                parse_mode: 'Markdown' 
            });
            return;
        }

        const words = this.wordService.words;
        const shareWord = this.userService.getRandomWord(words);

        const shareMessage = `${Constants.MESSAGES.SHARE_MESSAGE}

${shareWord.emoji} *${shareWord.word}* — ${shareWord.definition}

🤖 *Shared via LexicalGem Bot*
💎 *Learn a word you didn't know you needed!*`;

        Logger.bot('Share command executed', {
            userId: from.id,
            word: shareWord.word
        });

        await this.bot.sendMessage(chat.id, shareMessage, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle unknown commands
     * @param {Object} msg - Telegram message object
     */
    async handleUnknownCommand(msg) {
        const { chat, from } = msg;
        
        if (!Validator.isValidUserId(from.id)) {
            Logger.warn('Invalid user ID in unknown command', { userId: from.id });
            return;
        }

        this.wordService.recordRequest(from.id);
        
        Logger.debug('Unknown command received', {
            userId: from.id,
            text: msg.text
        });

        await this.bot.sendMessage(chat.id, Constants.MESSAGES.UNKNOWN_COMMAND, { 
            parse_mode: 'Markdown' 
        });
    }

    /**
     * Handle errors in command execution
     * @param {number} chatId - Chat ID
     * @param {Error} error - Error object
     */
    async handleError(chatId, error) {
        Logger.error('Command execution error', {
            chatId,
            error: error.message,
            stack: error.stack
        });

        const errorMessage = '❌ An error occurred while processing your request. Please try again later.';
        
        try {
            await this.bot.sendMessage(chatId, errorMessage, { 
                parse_mode: 'Markdown' 
            });
        } catch (sendError) {
            Logger.error('Failed to send error message', {
                chatId,
                error: sendError.message
            });
        }
    }

    /**
     * Get command statistics
     * @returns {Object} - Command statistics
     */
    getCommandStats() {
        return {
            registeredCommands: this.commands.size,
            commands: Array.from(this.commands.keys()),
            basicCommands: ['/start', '/word', '/stats', '/help'],
            advancedCommands: ['/wordoftheday', '/history', '/random', '/difficulty', '/share']
        };
    }
}

module.exports = CommandHandler; 