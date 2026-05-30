import axios from 'axios';
export class DictionaryAPIService {
    creator = 'Broken VZN';
    apiUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en';
    async getDefinition(request) {
        try {
            const { word } = request;
            if (!word || word.trim().length === 0) {
                return {
                    success: false,
                    word,
                    definitions: [],
                    creator: this.creator,
                    error: 'Word parameter is required'
                };
            }
            const cleanWord = word.trim().toLowerCase();
            const response = await axios.get(`${this.apiUrl}/${encodeURIComponent(cleanWord)}`, {
                timeout: 10000
            });
            if (response.status === 200 && response.data && response.data.length > 0) {
                const wordData = response.data[0];
                const definitions = [];
                if (wordData.meanings && wordData.meanings.length > 0) {
                    for (const meaning of wordData.meanings) {
                        const partOfSpeech = meaning.partOfSpeech || 'unknown';
                        if (meaning.definitions && meaning.definitions.length > 0) {
                            for (const def of meaning.definitions.slice(0, 3)) { // Limit to 3 definitions per part of speech
                                definitions.push({
                                    partOfSpeech,
                                    definition: def.definition || 'No definition available',
                                    example: def.example || undefined,
                                    synonyms: def.synonyms && def.synonyms.length > 0 ? def.synonyms.slice(0, 5) : undefined,
                                    antonyms: def.antonyms && def.antonyms.length > 0 ? def.antonyms.slice(0, 5) : undefined
                                });
                            }
                        }
                    }
                }
                return {
                    success: true,
                    word: wordData.word || cleanWord,
                    definitions,
                    creator: this.creator
                };
            }
            else {
                return {
                    success: false,
                    word: cleanWord,
                    definitions: [],
                    creator: this.creator,
                    error: 'Word not found in dictionary'
                };
            }
        }
        catch (error) {
            console.error('Dictionary API error:', error);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return {
                    success: false,
                    word: request.word,
                    definitions: [],
                    creator: this.creator,
                    error: 'Word not found in dictionary'
                };
            }
            return {
                success: false,
                word: request.word,
                definitions: [],
                creator: this.creator,
                error: 'Failed to fetch definition'
            };
        }
    }
}
export const dictionaryAPIService = new DictionaryAPIService();
