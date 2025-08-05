const chalk = require('chalk');

class Logger {
    constructor() {
        this.levels = {
            ERROR: 0,
            WARN: 1,
            INFO: 2,
            DEBUG: 3
        };
        
        this.currentLevel = this.levels.INFO;
        this.startTime = new Date();
    }

    setLevel(level) {
        this.currentLevel = this.levels[level.toUpperCase()] || this.levels.INFO;
    }

    formatMessage(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const uptime = this.getUptime();
        
        let formattedMessage = `[${timestamp}] [${uptime}] [${level}] ${message}`;
        
        if (data) {
            formattedMessage += ` | ${JSON.stringify(data)}`;
        }
        
        return formattedMessage;
    }

    getUptime() {
        const now = new Date();
        const diff = now - this.startTime;
        const minutes = Math.floor(diff / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    error(message, data = null) {
        if (this.currentLevel >= this.levels.ERROR) {
            console.error(chalk.red(this.formatMessage('ERROR', message, data)));
        }
    }

    warn(message, data = null) {
        if (this.currentLevel >= this.levels.WARN) {
            console.warn(chalk.yellow(this.formatMessage('WARN', message, data)));
        }
    }

    info(message, data = null) {
        if (this.currentLevel >= this.levels.INFO) {
            console.log(chalk.blue(this.formatMessage('INFO', message, data)));
        }
    }

    debug(message, data = null) {
        if (this.currentLevel >= this.levels.DEBUG) {
            console.log(chalk.gray(this.formatMessage('DEBUG', message, data)));
        }
    }

    success(message, data = null) {
        if (this.currentLevel >= this.levels.INFO) {
            console.log(chalk.green(this.formatMessage('SUCCESS', message, data)));
        }
    }

    bot(message, data = null) {
        if (this.currentLevel >= this.levels.INFO) {
            console.log(chalk.cyan(this.formatMessage('BOT', message, data)));
        }
    }
}

module.exports = new Logger(); 