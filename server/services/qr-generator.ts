import QRCode from 'qrcode';

export interface QRGeneratorRequest {
  text: string;
  size?: number;
  format?: 'png' | 'svg' | 'terminal';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface QRGeneratorResponse {
  success: boolean;
  text: string;
  qr_code: string;
  format: string;
  size: number;
  creator: string;
  error?: string;
}

export class QRGeneratorService {
  private readonly creator = 'Broken VZN';

  async generateQR(request: QRGeneratorRequest): Promise<QRGeneratorResponse> {
    try {
      const {
        text,
        size = 256,
        format = 'png',
        errorCorrectionLevel = 'M',
        margin = 4,
        color = { dark: '#000000', light: '#FFFFFF' }
      } = request;

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          text,
          qr_code: '',
          format,
          size,
          creator: this.creator,
          error: 'Text parameter is required'
        };
      }

      if (text.length > 2000) {
        return {
          success: false,
          text,
          qr_code: '',
          format,
          size,
          creator: this.creator,
          error: 'Text too long (max 2000 characters)'
        };
      }

      const options = {
        errorCorrectionLevel,
        type: 'image/png' as const,
        quality: 0.92,
        margin,
        color,
        width: Math.min(Math.max(size, 100), 1000) // Limit size between 100-1000
      };

      let qrCode: string;

      switch (format) {
        case 'svg':
          qrCode = await QRCode.toString(text, { ...options, type: 'svg' });
          break;
        case 'terminal':
          qrCode = await QRCode.toString(text, { type: 'terminal' });
          break;
        case 'png':
        default:
          qrCode = await QRCode.toDataURL(text, options);
          break;
      }

      return {
        success: true,
        text,
        qr_code: qrCode,
        format,
        size: options.width,
        creator: this.creator
      };

    } catch (error) {
      console.error('QR generator error:', error);
      return {
        success: false,
        text: request.text,
        qr_code: '',
        format: request.format || 'png',
        size: request.size || 256,
        creator: this.creator,
        error: 'Failed to generate QR code'
      };
    }
  }

  async generateBatch(texts: string[], options?: Partial<QRGeneratorRequest>): Promise<QRGeneratorResponse[]> {
    const results: QRGeneratorResponse[] = [];
    
    for (const text of texts.slice(0, 10)) { // Limit to 10 QR codes per batch
      const result = await this.generateQR({
        text,
        ...options
      });
      results.push(result);
    }

    return results;
  }

  getSupportedFormats(): string[] {
    return ['png', 'svg', 'terminal'];
  }

  getErrorCorrectionLevels(): string[] {
    return ['L', 'M', 'Q', 'H'];
  }
}

export const qrGeneratorService = new QRGeneratorService();