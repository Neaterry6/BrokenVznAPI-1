import axios from 'axios';
export class WordGamesService {
    creator = 'Broken VZN';
    wordLists = {
        easy: [
            'cat', 'dog', 'sun', 'run', 'fun', 'cup', 'car', 'bat', 'hat', 'map',
            'pen', 'red', 'big', 'top', 'hot', 'box', 'fox', 'six', 'mix', 'fix'
        ],
        medium: [
            'listen', 'silent', 'earth', 'heart', 'smart', 'start', 'water', 'tower',
            'power', 'house', 'mouse', 'plant', 'grand', 'brand', 'friend', 'spend',
            'trend', 'blend', 'chair', 'stair', 'share', 'care', 'dare', 'rare'
        ],
        hard: [
            'algorithm', 'programming', 'development', 'intelligence', 'mathematics',
            'philosophy', 'psychology', 'technology', 'architecture', 'engineering',
            'extraordinary', 'revolutionary', 'sophisticated', 'comprehensive', 'understanding'
        ]
    };
    hints = {
        'listen': 'Something you do with your ears',
        'silent': 'Making no sound',
        'earth': 'The planet we live on',
        'heart': 'Organ that pumps blood',
        'water': 'Essential liquid for life',
        'house': 'A place where people live',
        'plant': 'Green organism that grows',
        'friend': 'Someone you care about',
        'chair': 'Furniture for sitting',
        'algorithm': 'Step-by-step procedure for solving problems',
        'programming': 'Writing computer code',
        'cat': 'Small furry pet that meows',
        'dog': 'Loyal four-legged companion',
        'sun': 'Bright star that gives us light',
        'car': 'Vehicle with four wheels'
    };
    async playWordGame(request) {
        try {
            const { game_type = 'random_word', difficulty = 'medium', category = 'general' } = request;
            // Get word lists
            const difficultyLevel = this.wordLists[difficulty] || this.wordLists.medium;
            const selectedWord = this.getRandomWord(difficultyLevel);
            switch (game_type) {
                case 'anagram':
                    return this.generateAnagram(selectedWord, difficulty);
                case 'rhyme':
                    return await this.findRhymes(selectedWord, difficulty);
                case 'synonym':
                    return await this.findSynonyms(selectedWord, difficulty);
                default:
                    return this.generateRandomWord(selectedWord, difficulty);
            }
        }
        catch (error) {
            console.error('Word games error:', error);
            return {
                success: false,
                game_type: request.game_type || 'random_word',
                difficulty: request.difficulty || 'medium',
                instructions: '',
                creator: this.creator,
                error: 'Failed to generate word game'
            };
        }
    }
    generateAnagram(word, difficulty) {
        const scrambled = this.scrambleWord(word);
        return {
            success: true,
            game_type: 'anagram',
            word,
            challenge: scrambled,
            hint: this.getWordHint(word),
            difficulty,
            instructions: 'Unscramble the letters to form a word',
            creator: this.creator
        };
    }
    async findRhymes(word, difficulty) {
        try {
            const apiUrl = `https://api.datamuse.com/words?rel_rhy=${word}&max=5`;
            const response = await axios.get(apiUrl, { timeout: 10000 });
            if (response.status === 200) {
                const rhymes = response.data;
                const rhymeWords = rhymes.slice(0, 3).map((r) => r.word);
                return {
                    success: true,
                    game_type: 'rhyme',
                    word,
                    rhymes: rhymeWords,
                    difficulty,
                    instructions: `Find words that rhyme with '${word}'`,
                    creator: this.creator
                };
            }
            else {
                throw new Error('Rhyme API unavailable');
            }
        }
        catch (error) {
            return {
                success: false,
                game_type: 'rhyme',
                word,
                difficulty,
                instructions: '',
                creator: this.creator,
                error: 'Rhyme API temporarily unavailable'
            };
        }
    }
    async findSynonyms(word, difficulty) {
        try {
            const apiUrl = `https://api.datamuse.com/words?rel_syn=${word}&max=5`;
            const response = await axios.get(apiUrl, { timeout: 10000 });
            if (response.status === 200) {
                const synonyms = response.data;
                const synonymWords = synonyms.slice(0, 3).map((s) => s.word);
                return {
                    success: true,
                    game_type: 'synonym',
                    word,
                    synonyms: synonymWords,
                    difficulty,
                    instructions: `Find words that mean the same as '${word}'`,
                    creator: this.creator
                };
            }
            else {
                throw new Error('Synonym API unavailable');
            }
        }
        catch (error) {
            return {
                success: false,
                game_type: 'synonym',
                word,
                difficulty,
                instructions: '',
                creator: this.creator,
                error: 'Synonym API temporarily unavailable'
            };
        }
    }
    generateRandomWord(word, difficulty) {
        return {
            success: true,
            game_type: 'random_word',
            word,
            hint: this.getWordHint(word),
            difficulty,
            length: word.length,
            instructions: 'Use this word to create your own word game',
            creator: this.creator
        };
    }
    getRandomWord(wordList) {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        return wordList[randomIndex];
    }
    scrambleWord(word) {
        const letters = word.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    }
    getWordHint(word) {
        return this.hints[word.toLowerCase()] || 'No hint available';
    }
    getAvailableGameTypes() {
        return ['random_word', 'anagram', 'rhyme', 'synonym'];
    }
    getAvailableDifficulties() {
        return ['easy', 'medium', 'hard'];
    }
}
export const wordGamesService = new WordGamesService();
