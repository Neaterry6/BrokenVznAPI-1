import crypto from 'crypto';
export class UtilitiesService {
    creator = '@BrokenVZN';
    async base64Operation(request) {
        try {
            if (!request.text) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Text parameter is required'
                };
            }
            let result;
            if (request.encode !== false) {
                // Encode to base64
                result = Buffer.from(request.text, 'utf-8').toString('base64');
            }
            else {
                // Decode from base64
                result = Buffer.from(request.text, 'base64').toString('utf-8');
            }
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.text,
                    result: result,
                    operation: request.encode !== false ? 'encode' : 'decode'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to process base64 operation'
            };
        }
    }
    async generateHash(request) {
        try {
            const algorithm = request.algorithm || 'md5';
            const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
            if (!supportedAlgorithms.includes(algorithm)) {
                return {
                    success: false,
                    creator: this.creator,
                    error: `Unsupported algorithm. Supported: ${supportedAlgorithms.join(', ')}`
                };
            }
            const hash = crypto.createHash(algorithm).update(request.text).digest('hex');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.text,
                    hash: hash,
                    algorithm: algorithm
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to generate hash'
            };
        }
    }
    async generateUUID() {
        try {
            const uuid = crypto.randomUUID();
            return {
                success: true,
                creator: this.creator,
                data: {
                    uuid: uuid,
                    timestamp: new Date().toISOString()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to generate UUID'
            };
        }
    }
    async urlShorten(originalUrl, customAlias) {
        try {
            // Simple URL shortener logic
            const shortCode = customAlias || Math.random().toString(36).substring(7);
            return {
                success: true,
                creator: this.creator,
                data: {
                    originalUrl: originalUrl,
                    shortUrl: `https://short.ly/${shortCode}`,
                    shortCode: shortCode,
                    createdAt: new Date().toISOString()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to shorten URL'
            };
        }
    }
    async textStatistics(text) {
        try {
            const stats = {
                characters: text.length,
                charactersNoSpaces: text.replace(/\s/g, '').length,
                words: text.trim() ? text.trim().split(/\s+/).length : 0,
                sentences: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
                paragraphs: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
                averageWordsPerSentence: 0,
                mostCommonWords: []
            };
            if (stats.sentences > 0) {
                stats.averageWordsPerSentence = Math.round(stats.words / stats.sentences * 100) / 100;
            }
            // Find most common words
            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            const wordCount = {};
            words.forEach(word => {
                if (word.length > 3) { // Only count words longer than 3 characters
                    wordCount[word] = (wordCount[word] || 0) + 1;
                }
            });
            stats.mostCommonWords = Object.entries(wordCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([word, count]) => ({ word, count }));
            return {
                success: true,
                creator: this.creator,
                data: {
                    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                    statistics: stats
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to analyze text'
            };
        }
    }
}
export const utilitiesService = new UtilitiesService();
// Tools Utility Service with individual methods for each operation
export class ToolsUtilityService {
    creator = '@BrokenVZN';
    async encodeBase64(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const encoded = Buffer.from(request.query, 'utf-8').toString('base64');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query,
                    encoded: encoded,
                    operation: 'base64_encode'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to encode base64'
            };
        }
    }
    async decodeBase64(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const decoded = Buffer.from(request.query, 'base64').toString('utf-8');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query,
                    decoded: decoded,
                    operation: 'base64_decode'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to decode base64'
            };
        }
    }
    async encodeBinary(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const binary = request.query.split('').map(char => {
                return char.charCodeAt(0).toString(2).padStart(8, '0');
            }).join(' ');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query,
                    binary: binary,
                    operation: 'binary_encode'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to encode binary'
            };
        }
    }
    async decodeBinary(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const decoded = request.query.split(' ').map(binary => {
                return String.fromCharCode(parseInt(binary, 2));
            }).join('');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query,
                    decoded: decoded,
                    operation: 'binary_decode'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to decode binary'
            };
        }
    }
    async generateMD5(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const hash = crypto.createHash('md5').update(request.query).digest('hex');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query,
                    hash: hash,
                    algorithm: 'md5'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to generate MD5 hash'
            };
        }
    }
    async generateSHA256(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const hash = crypto.createHash('sha256').update(request.query).digest('hex');
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query,
                    hash: hash,
                    algorithm: 'sha256'
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to generate SHA256 hash'
            };
        }
    }
    async obfuscateJS(request) {
        try {
            if (!request.query) {
                return {
                    success: false,
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            // Simple JavaScript minification/obfuscation
            const obfuscated = request.query
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                .replace(/\/\/.*$/gm, '') // Remove line comments
                .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
                .trim();
            return {
                success: true,
                creator: this.creator,
                data: {
                    original: request.query.substring(0, 100) + (request.query.length > 100 ? '...' : ''),
                    obfuscated: obfuscated,
                    operation: 'js_obfuscate',
                    reduction: `${Math.round((1 - (obfuscated.length / request.query.length)) * 100)}% size reduction`
                }
            };
        }
        catch (error) {
            return {
                success: false,
                creator: this.creator,
                error: error instanceof Error ? error.message : 'Failed to obfuscate JavaScript'
            };
        }
    }
}
export const toolsUtilityService = new ToolsUtilityService();
