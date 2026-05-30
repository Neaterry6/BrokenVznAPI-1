export class DateTimeService {
    async getCurrentDateTime() {
        try {
            const currentDateTime = new Date();
            return {
                success: true,
                date: currentDateTime.toDateString(),
                time: currentDateTime.toTimeString(),
                timestamp: currentDateTime.toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'Failed to get current date and time'
            };
        }
    }
    async getFormattedTime() {
        const now = new Date();
        return {
            time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
            year: now.getFullYear(),
        };
    }
}
export const dateTimeService = new DateTimeService();
