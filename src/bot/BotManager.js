const TelegramBot = require('node-telegram-bot-api');
const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');
const Constants = require('../utils/Constants');
const CommandHandler = require('./CommandHandler');
const WordService = require('../services/WordService');

class BotManager {
    constructor(config) {
        this.config = config;
        this.bot = null;
        this.wordService = null;
        this.commandHandler = null;
        this.isInitialized = false;
        this.isShuttingDown = false;
        
        this.stats = {
            startTime: null,
            totalMessages: 0,
            errors: 0
        };
    }

    /**
     * Initialize the bot manager
     * @returns {Promise<boolean>} - Success status
     */
    async initialize() {
        try {
            Logger.info('Initializing BotManager...');
            
            // Validate configuration
            if (!this.validateConfig()) {
                return false;
            }

            // Initialize services
            await this.initializeServices();
            
            // Initialize bot
            await this.initializeBot();
            
            // Setup event handlers
            this.setupEventHandlers();
            
            this.isInitialized = true;
            this.stats.startTime = new Date();
            
            Logger.success('BotManager initialized successfully');
            return true;
            
        } catch (error) {
            Logger.error('Failed to initialize BotManager', { error: error.message });
            return false;
        }
    }

    /**
     * Validate bot configuration
     * @returns {boolean} - Validation result
     */
    validateConfig() {
        const envValidation = Validator.validateEnvironment(process.env);
        
        if (!envValidation.valid) {
            Logger.error('Environment validation failed', { 
                errors: envValidation.errors 
            });
            return false;
        }

        if (envValidation.warnings.length > 0) {
            envValidation.warnings.forEach(warning => {
                Logger.warn(warning);
            });
        }

        if (!Validator.isValidBotToken(this.config.botToken)) {
            Logger.error(Constants.MESSAGES.TOKEN_NOT_CONFIGURED);
            Logger.error(Constants.MESSAGES.TOKEN_EXAMPLE);
            return false;
        }

        Logger.success(Constants.MESSAGES.TOKEN_SUCCESS);
        return true;
    }

    /**
     * Initialize services
     * @returns {Promise<void>}
     */
    async initializeServices() {
        Logger.info('Initializing services...');
        
        // Initialize word service
        this.wordService = new WordService();
        const wordServiceReady = await this.wordService.initialize();
        
        if (!wordServiceReady) {
            throw new Error('Failed to initialize WordService');
        }
        
        Logger.success('Services initialized successfully');
    }

    /**
     * Initialize Telegram bot
     * @returns {Promise<void>}
     */
    async initializeBot() {
        Logger.info('Initializing Telegram bot...');
        
        this.bot = new TelegramBot(this.config.botToken, this.config.botOptions);
        
        // Initialize command handler
        this.commandHandler = new CommandHandler(this.bot, this.wordService);
        
        Logger.success('Telegram bot initialized successfully');
    }

    /**
     * Setup bot event handlers
     */
    setupEventHandlers() {
        // Handle unknown messages
        this.bot.on('message', async (msg) => {
            try {
                await this.handleMessage(msg);
            } catch (error) {
                Logger.error('Error handling message', { 
                    error: error.message,
                    userId: msg.from?.id,
                    chatId: msg.chat?.id 
                });
                this.stats.errors++;
            }
        });

        // Handle polling errors
        this.bot.on('polling_error', (error) => {
            Logger.error('Polling error', { 
                error: error.message,
                code: error.code 
            });
            
            if (error.code === 'ECONNRESET') {
                Logger.info(Constants.LOGS.CONNECTION_RESET);
            }
            
            this.stats.errors++;
        });

        // Handle bot errors
        this.bot.on('error', (error) => {
            Logger.error('Bot error', { error: error.message });
            this.stats.errors++;
        });

        // Handle webhook errors
        this.bot.on('webhook_error', (error) => {
            Logger.error('Webhook error', { error: error.message });
            this.stats.errors++;
        });
    }

    /**
     * Handle incoming messages
     * @param {Object} msg - Telegram message object
     */
    async handleMessage(msg) {
        if (!msg.text || this.isShuttingDown) {
            return;
        }

        this.stats.totalMessages++;

        // Check if it's a command
        const isCommand = Object.values(Constants.COMMANDS).some(cmd => 
            msg.text.startsWith(cmd)
        );

        if (!isCommand) {
            // Handle unknown command
            await this.commandHandler.handleUnknownCommand(msg);
        }
    }

    /**
     * Start the bot
     * @returns {Promise<boolean>} - Success status
     */
    async start() {
        if (!this.isInitialized) {
            Logger.error('BotManager not initialized');
            return false;
        }

        try {
            Logger.info(Constants.LOGS.BOT_STARTING);
            Logger.info(Constants.LOGS.COMMANDS_AVAILABLE);
            Logger.info(Constants.LOGS.USING_ENV);

            // Log initial stats
            setTimeout(() => {
                const stats = this.wordService.getStats();
                Logger.success(`📊 Initial stats: ${stats.totalWords} words loaded, ready to serve!`);
            }, 1000);

            Logger.success(Constants.LOGS.BOT_READY);
            return true;

        } catch (error) {
            Logger.error('Failed to start bot', { error: error.message });
            return false;
        }
    }

    /**
     * Stop the bot gracefully
     * @returns {Promise<void>}
     */
    async stop() {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;
        
        try {
            Logger.info(Constants.LOGS.SHUTDOWN_GRACEFUL);
            
            if (this.bot) {
                await this.bot.stopPolling();
            }
            
            Logger.success('Bot stopped successfully');
            
        } catch (error) {
            Logger.error('Error stopping bot', { error: error.message });
        }
    }

    /**
     * Get bot statistics
     * @returns {Object} - Bot statistics
     */
    getStats() {
        const uptime = this.getUptime();
        
        return {
            isInitialized: this.isInitialized,
            isShuttingDown: this.isShuttingDown,
            totalMessages: this.stats.totalMessages,
            errors: this.stats.errors,
            uptime,
            startTime: this.stats.startTime,
            wordServiceStats: this.wordService ? this.wordService.getStats() : null,
            commandStats: this.commandHandler ? this.commandHandler.getCommandStats() : null
        };
    }

    /**
     * Calculate uptime
     * @returns {string} - Formatted uptime
     */
    getUptime() {
        if (!this.stats.startTime) {
            return '0m';
        }

        const now = new Date();
        const diff = now - this.stats.startTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    /**
     * Reload words from file
     * @returns {Promise<boolean>} - Success status
     */
    async reloadWords() {
        if (!this.wordService) {
            Logger.error('WordService not available');
            return false;
        }

        return await this.wordService.reloadWords();
    }

    /**
     * Check if bot is ready
     * @returns {boolean} - Ready status
     */
    isReady() {
        return this.isInitialized && !this.isShuttingDown && this.bot && this.wordService;
    }
}

module.exports = BotManager; 