import QRCode from 'qrcode';
export class QRGeneratorService {
    creator = 'Broken VZN';
    async generateQR(request) {
        try {
            const { text, size = 256, format = 'png', errorCorrectionLevel = 'M', margin = 4, color = { dark: '#000000', light: '#FFFFFF' } } = request;
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
                type: 'image/png',
                quality: 0.92,
                margin,
                color,
                width: Math.min(Math.max(size, 100), 1000) // Limit size between 100-1000
            };
            let qrCode;
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
        }
        catch (error) {
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
    async generateBatch(texts, options) {
        const results = [];
        for (const text of texts.slice(0, 10)) { // Limit to 10 QR codes per batch
            const result = await this.generateQR({
                text,
                ...options
            });
            results.push(result);
        }
        return results;
    }
    getSupportedFormats() {
        return ['png', 'svg', 'terminal'];
    }
    getErrorCorrectionLevels() {
        return ['L', 'M', 'Q', 'H'];
    }
}
export const qrGeneratorService = new QRGeneratorService();
