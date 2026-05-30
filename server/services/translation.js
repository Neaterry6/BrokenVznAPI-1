import axios from 'axios';
export class TranslationService {
    baseUrl = 'https://api.mymemory.translated.net/get';
    // Supported language codes
    supportedLanguages = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'tr': 'Turkish',
        'pl': 'Polish',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'cs': 'Czech',
        'hu': 'Hungarian',
        'ro': 'Romanian',
        'bg': 'Bulgarian',
        'hr': 'Croatian',
        'sk': 'Slovak',
        'sl': 'Slovenian',
        'et': 'Estonian',
        'lv': 'Latvian',
        'lt': 'Lithuanian',
        'mt': 'Maltese',
        'cy': 'Welsh',
        'ga': 'Irish',
        'is': 'Icelandic',
        'mk': 'Macedonian',
        'sq': 'Albanian',
        'sr': 'Serbian',
        'bs': 'Bosnian',
        'me': 'Montenegrin',
        'be': 'Belarusian',
        'uk': 'Ukrainian',
        'he': 'Hebrew',
        'fa': 'Persian',
        'ur': 'Urdu',
        'bn': 'Bengali',
        'ta': 'Tamil',
        'te': 'Telugu',
        'ml': 'Malayalam',
        'kn': 'Kannada',
        'gu': 'Gujarati',
        'pa': 'Punjabi',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'ms': 'Malay',
        'tl': 'Filipino',
        'sw': 'Swahili',
        'yo': 'Yoruba',
        'ig': 'Igbo',
        'ha': 'Hausa',
        'am': 'Amharic',
        'zu': 'Zulu',
        'xh': 'Xhosa',
        'af': 'Afrikaans'
    };
    async translateText(request) {
        try {
            const { text, sourceLang, targetLang } = request;
            // Validation
            if (!text || text.trim().length === 0) {
                return {
                    success: false,
                    error: 'Text parameter is required'
                };
            }
            if (text.length > 5000) {
                return {
                    success: false,
                    error: 'Text is too long (maximum 5000 characters)'
                };
            }
            if (!sourceLang || !targetLang) {
                return {
                    success: false,
                    error: 'Source and target language parameters are required'
                };
            }
            // Validate language codes
            if (!this.supportedLanguages[sourceLang]) {
                return {
                    success: false,
                    error: `Unsupported source language: ${sourceLang}. Use getSupportedLanguages() for valid codes.`
                };
            }
            if (!this.supportedLanguages[targetLang]) {
                return {
                    success: false,
                    error: `Unsupported target language: ${targetLang}. Use getSupportedLanguages() for valid codes.`
                };
            }
            if (sourceLang === targetLang) {
                return {
                    success: true,
                    translatedText: text,
                    sourceLang,
                    targetLang,
                    originalText: text
                };
            }
            // Make translation request
            const response = await axios.get(this.baseUrl, {
                params: {
                    q: text.trim(),
                    langpair: `${sourceLang}|${targetLang}`
                },
                timeout: 10000 // 10 second timeout
            });
            if (!response.data || !response.data.responseData) {
                return {
                    success: false,
                    error: 'Invalid response from translation service'
                };
            }
            const translatedText = response.data.responseData.translatedText;
            if (!translatedText) {
                return {
                    success: false,
                    error: 'Translation failed - no translation returned'
                };
            }
            return {
                success: true,
                translatedText,
                sourceLang,
                targetLang,
                originalText: text
            };
        }
        catch (error) {
            console.error('Translation error:', error);
            if (error.code === 'ECONNABORTED') {
                return {
                    success: false,
                    error: 'Translation request timed out'
                };
            }
            if (error.response?.status === 429) {
                return {
                    success: false,
                    error: 'Rate limit exceeded. Please try again later.'
                };
            }
            return {
                success: false,
                error: 'Failed to translate text'
            };
        }
    }
    // Get supported languages
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    // Detect language (basic implementation)
    async detectLanguage(text) {
        try {
            if (!text || text.trim().length === 0) {
                return {
                    success: false,
                    error: 'Text parameter is required'
                };
            }
            // Simple heuristic-based detection
            const lowerText = text.toLowerCase();
            // Check for common patterns
            if (/[а-я]/i.test(text))
                return { success: true, language: 'ru', confidence: 0.8 };
            if (/[αβγδεζηθικλμνξοπρστυφχψω]/i.test(text))
                return { success: true, language: 'el', confidence: 0.9 };
            if (/[äöüß]/i.test(text))
                return { success: true, language: 'de', confidence: 0.7 };
            if (/[àâäéèêëïîôöùûüÿç]/i.test(text))
                return { success: true, language: 'fr', confidence: 0.7 };
            if (/[áéíóúñü]/i.test(text))
                return { success: true, language: 'es', confidence: 0.7 };
            if (/[ひらがなカタカナ漢字]/i.test(text))
                return { success: true, language: 'ja', confidence: 0.9 };
            if (/[한글]/i.test(text))
                return { success: true, language: 'ko', confidence: 0.9 };
            if (/[一-龯]/i.test(text))
                return { success: true, language: 'zh', confidence: 0.8 };
            if (/[ء-ي]/i.test(text))
                return { success: true, language: 'ar', confidence: 0.8 };
            // Default to English for basic Latin characters
            return { success: true, language: 'en', confidence: 0.6 };
        }
        catch (error) {
            console.error('Language detection error:', error);
            return {
                success: false,
                error: 'Failed to detect language'
            };
        }
    }
}
export const translationService = new TranslationService();
