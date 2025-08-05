#!/usr/bin/env node

/**
 * LexicalGem Bot - Main Entry Point
 * Professional Telegram bot for discovering rare words
 * 
 * @author LexicalGem Team
 * @version 2.0.0
 */

// Load environment variables first
require('dotenv').config();

const Logger = require('./utils/Logger');
const BotManager = require('./bot/BotManager');
const config = require('../config');

// Global error handlers
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception', { 
        error: error.message, 
        stack: error.stack 
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection', { 
        reason: reason?.message || reason,
        promise: promise 
    });
    process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGINT', async () => {
    Logger.info('Received SIGINT, shutting down gracefully...');
    await shutdown();
});

process.on('SIGTERM', async () => {
    Logger.info('Received SIGTERM, shutting down gracefully...');
    await shutdown();
});

// Global bot manager instance
let botManager = null;

/**
 * Main application entry point
 */
async function main() {
    try {
        Logger.info('🚀 Starting LexicalGem Bot v2.0.0...');
        
        // Initialize bot manager
        botManager = new BotManager(config);
        
        // Initialize and start the bot
        const initialized = await botManager.initialize();
        if (!initialized) {
            Logger.error('Failed to initialize bot manager');
            process.exit(1);
        }
        
        const started = await botManager.start();
        if (!started) {
            Logger.error('Failed to start bot');
            process.exit(1);
        }
        
        Logger.success('🎉 LexicalGem Bot is now running!');
        
        // Log periodic stats (every 30 minutes)
        setInterval(() => {
            if (botManager && botManager.isReady()) {
                const stats = botManager.getStats();
                Logger.info('📊 Periodic stats', {
                    uptime: stats.uptime,
                    totalMessages: stats.totalMessages,
                    errors: stats.errors,
                    wordRequests: stats.wordServiceStats?.totalRequests || 0
                });
            }
        }, 30 * 60 * 1000);
        
    } catch (error) {
        Logger.error('Fatal error during startup', { 
            error: error.message, 
            stack: error.stack 
        });
        process.exit(1);
    }
}

/**
 * Graceful shutdown function
 */
async function shutdown() {
    try {
        if (botManager) {
            await botManager.stop();
        }
        
        Logger.success('✅ Shutdown completed successfully');
        process.exit(0);
        
    } catch (error) {
        Logger.error('Error during shutdown', { error: error.message });
        process.exit(1);
    }
}

// Start the application
if (require.main === module) {
    main().catch((error) => {
        Logger.error('Failed to start application', { error: error.message });
        process.exit(1);
    });
}

module.exports = { main, shutdown }; 