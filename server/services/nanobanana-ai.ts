import fetch from 'node-fetch';

export const nanobananaAiService = {
  async chat(message: string) {
    try {
      const res = await fetch(`https://nanobanana.com/api/chat?message=${encodeURIComponent(message)}`);
      const data = await res.json() as any;
      return data?.response || data?.reply || data?.message || 'No response';
    } catch {
      return 'Nanobanana AI service unavailable.';
    }
  },

  async generate(prompt: string) {
    try {
      const res = await fetch(`https://nanobanana.com/api/generate?prompt=${encodeURIComponent(prompt)}`);
      const data = await res.json() as any;
      return data?.text || data?.output || data?.result || prompt;
    } catch {
      return 'Generation failed.';
    }
  },

  async image(prompt: string) {
    try {
      const res = await fetch(`https://nanobanana.com/api/image?prompt=${encodeURIComponent(prompt)}`);
      const data = await res.json() as any;
      return data?.url || data?.image || data?.data || '';
    } catch {
      return '';
    }
  }
};
