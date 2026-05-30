import * as QRCode from 'qrcode';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
export class EnhancedQRService {
    QR_DIR = '/tmp/qr_codes';
    constructor() {
        // Ensure QR directory exists
        if (!existsSync(this.QR_DIR)) {
            mkdirSync(this.QR_DIR, { recursive: true });
        }
    }
    async generateQR(request) {
        try {
            const { text, size = 256, format = 'png', errorCorrection = 'M', margin = 4, color, generateFile = false } = request;
            if (!text || text.trim() === '') {
                return {
                    success: false,
                    error: 'Text parameter is required',
                    creator: 'Broken VZN'
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
            let result = {
                success: true,
                text: text.trim(),
                creator: 'Broken VZN'
            };
            if (format === 'base64' || !generateFile) {
                // Generate base64 data URL
                const dataUrl = await QRCode.toDataURL(text.trim(), qrOptions);
                result.qr_data = dataUrl;
                result.qr_url = dataUrl;
            }
            else if (format === 'svg') {
                if (generateFile) {
                    const filename = `qr_${Date.now()}_${nanoid(6)}.svg`;
                    const filepath = join(this.QR_DIR, filename);
                    const svgString = await QRCode.toString(text.trim(), {
                        ...qrOptions,
                        type: 'svg'
                    });
                    writeFileSync(filepath, svgString);
                    result.file_path = filepath;
                    result.qr_url = `/qr/${filename}`;
                }
                else {
                    const svgString = await QRCode.toString(text.trim(), {
                        ...qrOptions,
                        type: 'svg'
                    });
                    result.qr_data = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
                }
            }
            else {
                // PNG format
                if (generateFile) {
                    const filename = `qr_${Date.now()}_${nanoid(6)}.png`;
                    const filepath = join(this.QR_DIR, filename);
                    await QRCode.toFile(filepath, text.trim(), qrOptions);
                    result.file_path = filepath;
                    result.qr_url = `/qr/${filename}`;
                }
                else {
                    const dataUrl = await QRCode.toDataURL(text.trim(), qrOptions);
                    result.qr_data = dataUrl;
                    result.qr_url = dataUrl;
                }
            }
            return result;
        }
        catch (error) {
            console.error('Enhanced QR generation error:', error);
            return {
                success: false,
                error: 'Failed to generate QR code',
                creator: 'Broken VZN'
            };
        }
    }
    // Clean up old QR files (optional, for file cleanup)
    cleanupOldFiles(maxAgeHours = 24) {
        try {
            if (!existsSync(this.QR_DIR))
                return;
            const fs = require('fs');
            const files = fs.readdirSync(this.QR_DIR);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;
            files.forEach((file) => {
                const filepath = join(this.QR_DIR, file);
                const stats = fs.statSync(filepath);
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlinkSync(filepath);
                    console.log(`[cleanup] Deleted old QR file: ${file}`);
                }
            });
        }
        catch (error) {
            console.error('QR cleanup error:', error);
        }
    }
}
export const enhancedQRService = new EnhancedQRService();
