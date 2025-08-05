const Logger = require('../utils/Logger');
const Validator = require('../utils/Validator');

class UserService {
    constructor() {
        this.users = new Map();
        this.wordOfTheDay = null;
        this.wordOfTheDayDate = null;
    }

    /**
     * Get or create user data
     * @param {number} userId - User ID
     * @returns {Object} - User data
     */
    getUserData(userId) {
        if (!this.users.has(userId)) {
                    this.users.set(userId, {
            id: userId,
            history: [],
            difficulty: 'medium', // easy, medium, hard
            preferences: {
                categories: [],
                wordLength: 'any' // short, medium, long, any
            },
            stats: {
                totalWords: 0,
                streak: 0,
                lastUsed: null
            }
        });
        }
        return this.users.get(userId);
    }

    /**
     * Add word to user history
     * @param {number} userId - User ID
     * @param {Object} word - Word object
     */
    addToHistory(userId, word) {
        if (!Validator.isValidUserId(userId) || !word) {
            return;
        }

        const userData = this.getUserData(userId);
        const historyEntry = {
            word: word.word,
            definition: word.definition,
            emoji: word.emoji,
            timestamp: new Date(),
            difficulty: this.calculateWordDifficulty(word)
        };

        // Add to history (keep last 50 entries)
        userData.history.unshift(historyEntry);
        if (userData.history.length > 50) {
            userData.history = userData.history.slice(0, 50);
        }

        // Update stats
        userData.stats.totalWords++;
        userData.stats.lastUsed = new Date();

        // Update streak
        this.updateStreak(userData);

        Logger.debug('Word added to user history', {
            userId,
            word: word.word,
            historyLength: userData.history.length
        });
    }



    /**
     * Get user's word history
     * @param {number} userId - User ID
     * @param {number} limit - Number of entries to return
     * @returns {Array} - History entries
     */
    getHistory(userId, limit = 10) {
        if (!Validator.isValidUserId(userId)) {
            return [];
        }

        const userData = this.getUserData(userId);
        return userData.history.slice(0, limit);
    }



    /**
     * Set user difficulty preference
     * @param {number} userId - User ID
     * @param {string} difficulty - Difficulty level
     * @returns {boolean} - Success status
     */
    setDifficulty(userId, difficulty) {
        if (!Validator.isValidUserId(userId)) {
            return false;
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty)) {
            return false;
        }

        const userData = this.getUserData(userId);
        userData.difficulty = difficulty;

        Logger.debug('User difficulty updated', { userId, difficulty });
        return true;
    }

    /**
     * Get word of the day
     * @param {Array} words - Available words
     * @returns {Object} - Word of the day
     */
    getWordOfTheDay(words) {
        const today = new Date().toDateString();
        
        // Generate new word of the day if it's a new day
        if (this.wordOfTheDayDate !== today || !this.wordOfTheDay) {
            const randomIndex = Math.floor(Math.random() * words.length);
            this.wordOfTheDay = words[randomIndex];
            this.wordOfTheDayDate = today;
            
            Logger.info('New word of the day generated', { 
                word: this.wordOfTheDay.word,
                date: today 
            });
        }

        return this.wordOfTheDay;
    }

    /**
     * Get completely random word (can repeat)
     * @param {Array} words - Available words
     * @returns {Object} - Random word
     */
    getRandomWord(words) {
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex];
    }

    /**
     * Get user statistics
     * @param {number} userId - User ID
     * @returns {Object} - User statistics
     */
    getUserStats(userId) {
        if (!Validator.isValidUserId(userId)) {
            return null;
        }

        const userData = this.getUserData(userId);
        return {
            ...userData.stats,
            difficulty: userData.difficulty,
            historyLength: userData.history.length
        };
    }

    /**
     * Calculate word difficulty based on length and complexity
     * @param {Object} word - Word object
     * @returns {string} - Difficulty level
     */
    calculateWordDifficulty(word) {
        const length = word.word.length;
        const definitionLength = word.definition.length;

        if (length <= 6 && definitionLength <= 100) return 'easy';
        if (length <= 10 && definitionLength <= 150) return 'medium';
        return 'hard';
    }

    /**
     * Update user streak
     * @param {Object} userData - User data object
     */
    updateStreak(userData) {
        const now = new Date();
        const lastUsed = userData.stats.lastUsed;

        if (!lastUsed) {
            userData.stats.streak = 1;
            return;
        }

        const daysDiff = Math.floor((now - lastUsed) / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
            // Same day, streak continues
            return;
        } else if (daysDiff === 1) {
            // Consecutive day, increase streak
            userData.stats.streak++;
        } else {
            // Streak broken, reset to 1
            userData.stats.streak = 1;
        }
    }

    /**
     * Get all users data (for admin purposes)
     * @returns {Map} - All users data
     */
    getAllUsers() {
        return this.users;
    }

    /**
     * Clear user data (for testing)
     * @param {number} userId - User ID
     */
    clearUserData(userId) {
        this.users.delete(userId);
        Logger.debug('User data cleared', { userId });
    }
}

module.exports = UserService; 