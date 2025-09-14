import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

export interface TranscriptionRequest {
  audioFile?: any; // Express.Multer.File
  audioUrl?: string;
  language?: string;
}

export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  language?: string;
  confidence?: number;
  duration?: number;
  error?: string;
}

export class TranscriptionService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.assemblyai.com/v2';

  constructor() {
    this.apiKey = process.env.ASSEMBLYAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('ASSEMBLYAI_API_KEY not found. Transcription service will use demo responses.');
    }
  }

  async transcribeAudio(request: TranscriptionRequest): Promise<TranscriptionResult> {
    try {
      const { audioFile, audioUrl, language = 'en' } = request;

      if (!audioFile && !audioUrl) {
        return {
          success: false,
          error: 'Either audio file or audio URL is required'
        };
      }

      // If no API key, return demo response
      if (!this.apiKey) {
        return {
          success: true,
          transcription: `Demo transcription: This is a simulated transcription of your audio content. The actual transcription would be generated using AssemblyAI service. To get real transcriptions, please configure your AssemblyAI API key.`,
          language,
          confidence: 0.95,
          duration: 30
        };
      }

      let uploadUrl: string;

      if (audioFile) {
        // Upload file to AssemblyAI
        uploadUrl = await this.uploadFile(audioFile);
      } else {
        uploadUrl = audioUrl!;
      }

      // Submit transcription job
      const transcriptId = await this.submitTranscription(uploadUrl, language);
      
      // Poll for completion
      const transcription = await this.pollTranscription(transcriptId);

      return {
        success: true,
        transcription: transcription.text,
        language: transcription.language_code,
        confidence: transcription.confidence,
        duration: transcription.audio_duration
      };

    } catch (error: any) {
      console.error('Transcription error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Invalid AssemblyAI API key'
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
        error: 'Failed to transcribe audio'
      };
    }
  }

  private async uploadFile(file: any): Promise<string> {
    const headers = {
      'authorization': this.apiKey,
      'content-type': 'application/octet-stream'
    };

    const response = await axios.post(
      `${this.baseUrl}/upload`,
      file.buffer,
      { headers }
    );

    return response.data.upload_url;
  }

  private async submitTranscription(audioUrl: string, language: string): Promise<string> {
    const headers = {
      'authorization': this.apiKey,
      'content-type': 'application/json'
    };

    const data = {
      audio_url: audioUrl,
      language_code: language,
      punctuate: true,
      format_text: true,
      speaker_labels: true,
      auto_chapters: true,
      summarization: true,
      summary_model: 'informative',
      summary_type: 'bullets'
    };

    const response = await axios.post(
      `${this.baseUrl}/transcript`,
      data,
      { headers }
    );

    return response.data.id;
  }

  private async pollTranscription(transcriptId: string): Promise<any> {
    const headers = {
      'authorization': this.apiKey
    };

    let attempts = 0;
    const maxAttempts = 30; // Max 5 minutes

    while (attempts < maxAttempts) {
      const response = await axios.get(
        `${this.baseUrl}/transcript/${transcriptId}`,
        { headers }
      );

      const { status } = response.data;

      if (status === 'completed') {
        return response.data;
      } else if (status === 'error') {
        throw new Error('Transcription failed');
      }

      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('Transcription timed out');
  }

  // Transcribe from URL
  async transcribeFromUrl(url: string, language: string = 'en'): Promise<TranscriptionResult> {
    return this.transcribeAudio({ audioUrl: url, language });
  }

  // Get supported languages
  getSupportedLanguages() {
    return {
      'en': 'English',
      'es': 'Spanish', 
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'nl': 'Dutch',
      'af': 'Afrikaans',
      'sq': 'Albanian',
      'am': 'Amharic',
      'ar': 'Arabic',
      'hy': 'Armenian',
      'as': 'Assamese',
      'az': 'Azerbaijani',
      'ba': 'Bashkir',
      'eu': 'Basque',
      'be': 'Belarusian',
      'bn': 'Bengali',
      'bs': 'Bosnian',
      'br': 'Breton',
      'bg': 'Bulgarian',
      'ca': 'Catalan',
      'zh': 'Chinese',
      'hr': 'Croatian',
      'cs': 'Czech',
      'da': 'Danish',
      'et': 'Estonian',
      'fo': 'Faroese',
      'fi': 'Finnish',
      'gl': 'Galician',
      'ka': 'Georgian',
      'el': 'Greek',
      'gu': 'Gujarati',
      'ht': 'Haitian Creole',
      'ha': 'Hausa',
      'haw': 'Hawaiian',
      'he': 'Hebrew',
      'hi': 'Hindi',
      'hu': 'Hungarian',
      'is': 'Icelandic',
      'id': 'Indonesian',
      'ga': 'Irish',
      'ja': 'Japanese',
      'jw': 'Javanese',
      'kn': 'Kannada',
      'kk': 'Kazakh',
      'km': 'Khmer',
      'ko': 'Korean',
      'lo': 'Lao',
      'la': 'Latin',
      'lv': 'Latvian',
      'ln': 'Lingala',
      'lt': 'Lithuanian',
      'lb': 'Luxembourgish',
      'mk': 'Macedonian',
      'mg': 'Malagasy',
      'ms': 'Malay',
      'ml': 'Malayalam',
      'mt': 'Maltese',
      'mi': 'Maori',
      'mr': 'Marathi',
      'mn': 'Mongolian',
      'my': 'Myanmar',
      'ne': 'Nepali',
      'no': 'Norwegian',
      'nn': 'Norwegian Nynorsk',
      'oc': 'Occitan',
      'pa': 'Punjabi',
      'ps': 'Pashto',
      'fa': 'Persian',
      'pl': 'Polish',
      'ro': 'Romanian',
      'ru': 'Russian',
      'sa': 'Sanskrit',
      'sr': 'Serbian',
      'sn': 'Shona',
      'sd': 'Sindhi',
      'si': 'Sinhala',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'so': 'Somali',
      'su': 'Sundanese',
      'sw': 'Swahili',
      'sv': 'Swedish',
      'tl': 'Tagalog',
      'tg': 'Tajik',
      'ta': 'Tamil',
      'tt': 'Tatar',
      'te': 'Telugu',
      'th': 'Thai',
      'bo': 'Tibetan',
      'tr': 'Turkish',
      'tk': 'Turkmen',
      'uk': 'Ukrainian',
      'ur': 'Urdu',
      'uz': 'Uzbek',
      'vi': 'Vietnamese',
      'cy': 'Welsh',
      'fy': 'Western Frisian',
      'xh': 'Xhosa',
      'yi': 'Yiddish',
      'yo': 'Yoruba',
      'zu': 'Zulu'
    };
  }

  // Get service status
  getServiceStatus() {
    return {
      hasApiKey: !!this.apiKey,
      provider: 'AssemblyAI',
      supportedFormats: ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'webm'],
      maxFileSize: '100MB',
      supportedLanguages: Object.keys(this.getSupportedLanguages()).length
    };
  }
}

export const transcriptionService = new TranscriptionService();