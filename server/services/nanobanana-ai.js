import fetch from 'node-fetch';
export const nanobananaAiService = {
    async chat(message) {
        try {
            const res = await fetch(`https://nanobanana.com/api/chat?message=${encodeURIComponent(message)}`);
            const data = await res.json();
            return data?.response || data?.reply || data?.message || 'No response';
        }
        catch {
            return 'Nanobanana AI service unavailable.';
        }
    },
    async generate(prompt) {
        try {
            const res = await fetch(`https://nanobanana.com/api/generate?prompt=${encodeURIComponent(prompt)}`);
            const data = await res.json();
            return data?.text || data?.output || data?.result || prompt;
        }
        catch {
            return 'Generation failed.';
        }
    },
    async image(prompt) {
        try {
            const res = await fetch(`https://nanobanana.com/api/image?prompt=${encodeURIComponent(prompt)}`);
            const data = await res.json();
            return data?.url || data?.image || data?.data || '';
        }
        catch {
            return '';
        }
    }
};
