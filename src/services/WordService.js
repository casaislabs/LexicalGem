const fs = require('fs').promises;
const path = require('path');
const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');
const Constants = require('../utils/Constants');

class WordService {
    constructor() {
        this.words = [];
        this.usedWords = new Set();
        this.validDifficulties = new Set(['easy', 'medium', 'hard']);
        this.stats = {
            totalRequests: 0,
            uniqueUsers: new Set(),
            startTime: new Date(),
            loadAttempts: 0,
            lastLoadTime: null
        };
        
        this.isInitialized = false;
    }

    /**
     * Initialize the word service
     * @returns {Promise<boolean>} - Success status
     */
    async initialize() {
        try {
            Logger.info('Initializing WordService...');
            
            const success = await this.loadWords();
            if (success) {
                this.isInitialized = true;
                Logger.success('WordService initialized successfully', { 
                    wordCount: this.words.length 
                });
            }
            
            return success;
        } catch (error) {
            Logger.error('Failed to initialize WordService', { error: error.message });
            return false;
        }
    }

    /**
     * Load words from JSON file
     * @returns {Promise<boolean>} - Success status
     */
    async loadWords() {
        try {
            this.stats.loadAttempts++;
            this.stats.lastLoadTime = new Date();

            const wordsPath = path.join(process.cwd(), Constants.PATHS.WORDS_JSON);
            const wordsData = await fs.readFile(wordsPath, 'utf8');
            const parsedWords = JSON.parse(wordsData);

            // Validate word structure
            const validation = Validator.validateWordsArray(parsedWords);
            
            if (!validation.valid) {
                Logger.warn('Invalid words found in JSON file', { 
                    errors: validation.errors,
                    validCount: validation.validWords.length 
                });
            }

            this.words = this.assignWordDifficulties(validation.validWords);
            
            if (this.words.length === 0) {
                Logger.warn('No valid words found, using fallback words');
                this.loadFallbackWords();
            }

            Logger.info(Constants.LOGS.WORDS_LOADED.replace('{count}', this.words.length));
            return true;

        } catch (error) {
            Logger.error(Constants.ERRORS.WORDS_LOAD_FAILED, { 
                error: error.message,
                attempt: this.stats.loadAttempts 
            });
            
            this.loadFallbackWords();
            return false;
        }
    }

    /**
     * Load fallback words when JSON file is unavailable
     */
    loadFallbackWords() {
        this.words = this.assignWordDifficulties([...Constants.FALLBACK_WORDS]);
        Logger.warn(Constants.LOGS.USING_FALLBACK);
    }

    /**
     * Get a random word without repetition
     * @returns {Object|null} - Random word object or null
     */
    getRandomWord(preferredDifficulty = 'medium') {
        if (!this.isInitialized || this.words.length === 0) {
            Logger.warn('Attempted to get word before initialization or no words available');
            return null;
        }

        // Reset cycle if all words have been used
        if (this.usedWords.size >= this.words.length) {
            this.resetCycle();
        }

        // Get available words (not used in current cycle)
        const availableWords = this.words.filter(word => !this.usedWords.has(word.word));

        if (availableWords.length === 0) {
            Logger.warn('No available words found, this should not happen');
            return null;
        }

        const normalizedDifficulty = this.normalizeDifficulty(preferredDifficulty);
        const difficultyMatchedWords = availableWords.filter(
            word => word.difficulty === normalizedDifficulty
        );
        const selectionPool = difficultyMatchedWords.length > 0 ? difficultyMatchedWords : availableWords;
        const randomIndex = Math.floor(Math.random() * selectionPool.length);
        const selectedWord = selectionPool[randomIndex];
        
        // Mark as used
        this.usedWords.add(selectedWord.word);

        Logger.debug('Word selected', { 
            word: selectedWord.word,
            preferredDifficulty: normalizedDifficulty,
            selectedDifficulty: selectedWord.difficulty,
            usedFallbackPool: difficultyMatchedWords.length === 0,
            remaining: this.words.length - this.usedWords.size 
        });

        return selectedWord;
    }

    normalizeDifficulty(difficulty) {
        if (typeof difficulty !== 'string') {
            return 'medium';
        }

        const normalized = difficulty.toLowerCase();
        return this.validDifficulties.has(normalized) ? normalized : 'medium';
    }

    assignWordDifficulties(words) {
        if (!Array.isArray(words) || words.length === 0) {
            return [];
        }

        const thresholds = this.getComplexityThresholds(words);

        return words.map(word => {
            const complexity = this.calculateWordComplexity(word);
            let difficulty = 'hard';

            if (complexity <= thresholds.easyMax) {
                difficulty = 'easy';
            } else if (complexity <= thresholds.mediumMax) {
                difficulty = 'medium';
            }

            return {
                ...word,
                difficulty
            };
        });
    }

    getComplexityThresholds(words) {
        const complexities = words
            .map(word => this.calculateWordComplexity(word))
            .sort((a, b) => a - b);

        const lastIndex = complexities.length - 1;
        const easyIndex = Math.floor(lastIndex / 3);
        const mediumIndex = Math.floor((lastIndex * 2) / 3);

        return {
            easyMax: complexities[easyIndex],
            mediumMax: complexities[mediumIndex]
        };
    }

    calculateWordComplexity(word) {
        const wordLength = typeof word.word === 'string' ? word.word.trim().length : 0;
        const definitionLength = typeof word.definition === 'string' ? word.definition.trim().length : 0;
        return (wordLength * 8) + definitionLength;
    }

    /**
     * Get comprehensive statistics
     * @returns {Object} - Statistics object
     */
    getStats() {
        const now = new Date();
        const uptime = this.getUptime(now);

        return {
            totalWords: this.words.length,
            usedWords: this.usedWords.size,
            remainingWords: this.words.length - this.usedWords.size,
            cycleProgress: Math.round((this.usedWords.size / this.words.length) * 100),
            totalRequests: this.stats.totalRequests,
            uniqueUsers: this.stats.uniqueUsers.size,
            uptime,
            isInitialized: this.isInitialized,
            loadAttempts: this.stats.loadAttempts,
            lastLoadTime: this.stats.lastLoadTime
        };
    }

    /**
     * Calculate uptime
     * @param {Date} now - Current time
     * @returns {string} - Formatted uptime
     */
    getUptime(now = new Date()) {
        const diff = now - this.stats.startTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    /**
     * Record a user request
     * @param {number} userId - User ID
     */
    recordRequest(userId) {
        if (!Validator.isValidUserId(userId)) {
            Logger.warn('Invalid user ID provided', { userId });
            return;
        }

        this.stats.totalRequests++;
        this.stats.uniqueUsers.add(userId);

        Logger.debug('Request recorded', { 
            userId,
            totalRequests: this.stats.totalRequests,
            uniqueUsers: this.stats.uniqueUsers.size 
        });
    }

    /**
     * Reset the word cycle
     */
    resetCycle() {
        this.usedWords.clear();
        Logger.info(Constants.LOGS.CYCLE_RESET);
    }

    /**
     * Reload words from file
     * @returns {Promise<boolean>} - Success status
     */
    async reloadWords() {
        Logger.info('Reloading words from file...');
        this.resetCycle();
        return await this.loadWords();
    }

    /**
     * Get word by index (for testing/debugging)
     * @param {number} index - Word index
     * @returns {Object|null} - Word object or null
     */
    getWordByIndex(index) {
        if (index >= 0 && index < this.words.length) {
            return this.words[index];
        }
        return null;
    }

    /**
     * Check if service is ready
     * @returns {boolean} - Ready status
     */
    isReady() {
        return this.isInitialized && this.words.length > 0;
    }
}

module.exports = WordService; 
