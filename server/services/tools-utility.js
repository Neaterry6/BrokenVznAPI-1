import * as crypto from 'crypto';
import * as JavaScriptObfuscator from 'javascript-obfuscator';
export class ToolsUtilityService {
    creator = 'Broken VZN';
    // Base64 encoding
    async encodeBase64(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'base64-encode',
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            if (query.length > 2048) {
                return {
                    success: false,
                    result: '',
                    type: 'base64-encode',
                    creator: this.creator,
                    error: 'Maximum 2,048 characters allowed'
                };
            }
            const encoded = Buffer.from(query).toString('base64');
            return {
                success: true,
                result: encoded,
                original: query,
                type: 'base64-encode',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'base64-encode',
                creator: this.creator,
                error: 'Failed to encode base64'
            };
        }
    }
    // Base64 decoding
    async decodeBase64(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'base64-decode',
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            if (query.length > 2048) {
                return {
                    success: false,
                    result: '',
                    type: 'base64-decode',
                    creator: this.creator,
                    error: 'Maximum 2,048 characters allowed'
                };
            }
            const decoded = Buffer.from(query, 'base64').toString('ascii');
            return {
                success: true,
                result: decoded,
                original: query,
                type: 'base64-decode',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'base64-decode',
                creator: this.creator,
                error: 'Failed to decode base64'
            };
        }
    }
    // Binary encoding
    async encodeBinary(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'binary-encode',
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            if (query.length > 2048) {
                return {
                    success: false,
                    result: '',
                    type: 'binary-encode',
                    creator: this.creator,
                    error: 'Maximum 2,048 characters allowed'
                };
            }
            const binary = query.split('').map(char => {
                const converted = char.charCodeAt(0).toString(2);
                return converted.padStart(8, '0');
            }).join(' ');
            return {
                success: true,
                result: binary,
                original: query,
                type: 'binary-encode',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'binary-encode',
                creator: this.creator,
                error: 'Failed to encode binary'
            };
        }
    }
    // Binary decoding
    async decodeBinary(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'binary-decode',
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            if (query.length > 2048) {
                return {
                    success: false,
                    result: '',
                    type: 'binary-decode',
                    creator: this.creator,
                    error: 'Maximum 2,048 characters allowed'
                };
            }
            const decoded = query.split(' ').map(binary => String.fromCharCode(parseInt(binary, 2))).join('');
            return {
                success: true,
                result: decoded,
                original: query,
                type: 'binary-decode',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'binary-decode',
                creator: this.creator,
                error: 'Failed to decode binary'
            };
        }
    }
    // JavaScript obfuscation
    async obfuscateJS(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'js-obfuscate',
                    creator: this.creator,
                    error: 'JavaScript code is required'
                };
            }
            const obfuscatedCode = JavaScriptObfuscator.obfuscate(query, {
                compact: false,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            }).getObfuscatedCode();
            return {
                success: true,
                result: obfuscatedCode,
                original: query,
                type: 'js-obfuscate',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'js-obfuscate',
                creator: this.creator,
                error: 'Failed to obfuscate JavaScript'
            };
        }
    }
    // MD5 Hash
    async generateMD5(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'md5-hash',
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const hash = crypto.createHash('md5').update(query).digest('hex');
            return {
                success: true,
                result: hash,
                original: query,
                type: 'md5-hash',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'md5-hash',
                creator: this.creator,
                error: 'Failed to generate MD5 hash'
            };
        }
    }
    // SHA256 Hash
    async generateSHA256(request) {
        try {
            const { query } = request;
            if (!query) {
                return {
                    success: false,
                    result: '',
                    type: 'sha256-hash',
                    creator: this.creator,
                    error: 'Query parameter is required'
                };
            }
            const hash = crypto.createHash('sha256').update(query).digest('hex');
            return {
                success: true,
                result: hash,
                original: query,
                type: 'sha256-hash',
                creator: this.creator
            };
        }
        catch (error) {
            return {
                success: false,
                result: '',
                type: 'sha256-hash',
                creator: this.creator,
                error: 'Failed to generate SHA256 hash'
            };
        }
    }
}
export const toolsUtilityService = new ToolsUtilityService();
