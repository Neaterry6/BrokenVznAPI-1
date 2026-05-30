import * as QRCode from 'qrcode';
export class QRCodeService {
    async generateQRCode(options) {
        try {
            const { text, size = 200, format = 'png', errorCorrection = 'M', margin = 4, color } = options;
            if (!text) {
                return {
                    success: false,
                    error: 'Text parameter is required'
                };
            }
            const qrOptions = {
                width: size,
                margin,
                errorCorrectionLevel: errorCorrection,
                color: {
                    dark: color?.dark || '#000000',
                    light: color?.light || '#FFFFFF'
                }
            };
            let data;
            if (format === 'svg') {
                data = await QRCode.toString(text, {
                    ...qrOptions,
                    type: 'svg'
                });
                data = `data:image/svg+xml;base64,${Buffer.from(data).toString('base64')}`;
            }
            else {
                data = await QRCode.toDataURL(text, qrOptions);
            }
            return {
                success: true,
                data,
                url: `data:image/${format};base64,${data.split(',')[1]}`
            };
        }
        catch (error) {
            console.error('QR code generation error:', error);
            return {
                success: false,
                error: 'Failed to generate QR code'
            };
        }
    }
}
export const qrCodeService = new QRCodeService();
