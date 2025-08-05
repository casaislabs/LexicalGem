class Validator {
    /**
     * Validates if a word object has the required structure
     * @param {Object} word - Word object to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    static isValidWord(word) {
        return (
            word &&
            typeof word === 'object' &&
            typeof word.word === 'string' &&
            word.word.trim().length > 0 &&
            typeof word.definition === 'string' &&
            word.definition.trim().length > 0 &&
            typeof word.emoji === 'string' &&
            word.emoji.trim().length > 0
        );
    }

    /**
     * Validates if a word array contains valid word objects
     * @param {Array} words - Array of word objects
     * @returns {Object} - Validation result with valid words and errors
     */
    static validateWordsArray(words) {
        if (!Array.isArray(words)) {
            return {
                valid: false,
                validWords: [],
                errors: ['Words must be an array']
            };
        }

        const validWords = [];
        const errors = [];

        words.forEach((word, index) => {
            if (!this.isValidWord(word)) {
                errors.push(`Invalid word structure at index ${index}`);
            } else {
                validWords.push(word);
            }
        });

        return {
            valid: validWords.length > 0,
            validWords,
            errors
        };
    }

    /**
     * Validates bot token format
     * @param {string} token - Bot token to validate
     * @returns {boolean} - True if valid format, false otherwise
     */
    static isValidBotToken(token) {
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Telegram bot token format: <bot_id>:<bot_token>
        const tokenRegex = /^\d+:[A-Za-z0-9_-]{35}$/;
        return tokenRegex.test(token);
    }

    /**
     * Validates user ID format
     * @param {number|string} userId - User ID to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    static isValidUserId(userId) {
        const id = parseInt(userId);
        return !isNaN(id) && id > 0;
    }

    /**
     * Sanitizes a string input
     * @param {string} input - Input string to sanitize
     * @returns {string} - Sanitized string
     */
    static sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        return input.trim().replace(/[<>]/g, '');
    }

    /**
     * Validates environment variables
     * @param {Object} env - Environment object
     * @returns {Object} - Validation result
     */
    static validateEnvironment(env) {
        const errors = [];
        const warnings = [];

        if (!env.BOT_TOKEN_CODE) {
            errors.push('BOT_TOKEN_CODE is not set');
        } else if (!this.isValidBotToken(env.BOT_TOKEN_CODE)) {
            errors.push('BOT_TOKEN_CODE has invalid format');
        }

        if (!env.NODE_ENV) {
            warnings.push('NODE_ENV is not set, defaulting to development');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

module.exports = Validator; 