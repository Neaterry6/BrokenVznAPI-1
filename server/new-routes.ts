import type { Express } from "express";
import fetch from 'node-fetch';

export function registerNewRoutes(app: Express) {

  // ─── Nanobanana AI ───
  app.get('/api/nanobanana/chat', async (req, res) => {
    const message = String(req.query.message || '');
    if (!message) return res.status(400).json({ error: 'Message required' });
    try {
      const r = await fetch(`https://nanobanana.com/api/chat?message=${encodeURIComponent(message)}`);
      const d = await r.json() as any;
      res.json({ response: d?.response || d?.reply || d?.message || 'No response', source: 'nanobanana' });
    } catch { res.status(500).json({ error: 'Service unavailable' }); }
  });

  app.get('/api/nanobanana/generate', async (req, res) => {
    const prompt = String(req.query.prompt || '');
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    try {
      const r = await fetch(`https://nanobanana.com/api/generate?prompt=${encodeURIComponent(prompt)}`);
      const d = await r.json() as any;
      res.json({ result: d?.text || d?.output || d?.result || prompt, source: 'nanobanana' });
    } catch { res.status(500).json({ error: 'Service unavailable' }); }
  });

  app.get('/api/nanobanana/image', async (req, res) => {
    const prompt = String(req.query.prompt || '');
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    try {
      const r = await fetch(`https://nanobanana.com/api/image?prompt=${encodeURIComponent(prompt)}`);
      const d = await r.json() as any;
      res.json({ url: d?.url || d?.image || d?.data || '', source: 'nanobanana' });
    } catch { res.status(500).json({ error: 'Service unavailable' }); }
  });

  // ─── Groq AI ───
  app.post('/api/groq/chat', async (req, res) => {
    const message = req.body?.message || '';
    if (!message) return res.status(400).json({ error: 'Message required' });
    try {
      const groqKey = process.env.GROQ_API_KEY;
      if (groqKey) {
        const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'mixtral-8x7b-32768', messages: [{ role: 'user', content: message }] }),
        });
        const d = await r.json() as any;
        return res.json({ response: d?.choices?.[0]?.message?.content || 'No response', source: 'groq' });
      }
      res.json({ response: 'GROQ_API_KEY not configured', source: 'groq' });
    } catch { res.status(500).json({ error: 'Service unavailable' }); }
  });

  // ─── Perplexity AI Search ───
  app.get('/api/perplexity/search', async (req, res) => {
    const query = String(req.query.query || '');
    if (!query) return res.status(400).json({ error: 'Query required' });
    try {
      const r = await fetch(`https://api.perplexity.ai/search?q=${encodeURIComponent(query)}`);
      const d = await r.json() as any;
      res.json({ results: d?.results || d?.data || [], source: 'perplexity' });
    } catch { res.status(500).json({ error: 'Search unavailable' }); }
  });

  // ─── Games ───
  app.get('/api/games/trivia', async (req, res) => {
    const amount = req.query.amount || 10;
    const category = req.query.category ? `&category=${req.query.category}` : '';
    const difficulty = req.query.difficulty ? `&difficulty=${req.query.difficulty}` : '';
    try {
      const r = await fetch(`https://opentdb.com/api.php?amount=${amount}${category}${difficulty}`);
      const d = await r.json() as any;
      res.json({ results: d?.results || [], source: 'opentdb' });
    } catch { res.status(500).json({ error: 'Trivia unavailable' }); }
  });

  app.get('/api/games/word', async (req, res) => {
    const type = String(req.query.type || 'scramble');
    try {
      const r = await fetch('https://random-word-api.herokuapp.com/word?number=1');
      const words = await r.json() as string[];
      const word = words?.[0] || 'coding';
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      res.json({ type, original: type === 'wordle' ? null : word, scrambled: type === 'scramble' ? scrambled : null, length: word.length, hints: [`${word.length} letters`, `Starts with "${word[0]}"`] });
    } catch { res.status(500).json({ error: 'Word game unavailable' }); }
  });

  app.get('/api/games/number-fact', async (req, res) => {
    const num = req.query.number || 'random';
    try {
      const r = await fetch(`http://numbersapi.com/${num}/trivia`);
      const text = await r.text();
      res.json({ number: num, fact: text });
    } catch { res.status(500).json({ error: 'Number fact unavailable' }); }
  });

  app.get('/api/games/dice', (req, res) => {
    const sides = Number(req.query.sides) || 6;
    res.json({ sides, result: Math.floor(Math.random() * sides) + 1 });
  });

  app.get('/api/games/coinflip', (req, res) => {
    res.json({ result: Math.random() > 0.5 ? 'heads' : 'tails' });
  });

  app.get('/api/games/rps', (req, res) => {
    const choices = ['rock', 'paper', 'scissors'];
    const computer = choices[Math.floor(Math.random() * 3)];
    const player = String(req.query.choice || '').toLowerCase();
    let result = 'tie';
    if (player === 'rock' && computer === 'scissors') result = 'win';
    else if (player === 'paper' && computer === 'rock') result = 'win';
    else if (player === 'scissors' && computer === 'paper') result = 'win';
    else if (player && player !== computer) result = 'lose';
    res.json({ player: player || 'unknown', computer, result });
  });

  // ─── Anime (Jikan API) ───
  app.get('/api/anime/search', async (req, res) => {
    const q = String(req.query.query || '');
    if (!q) return res.status(400).json({ error: 'Query required' });
    try {
      const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=15`);
      const d = await r.json() as any;
      res.json({ data: d?.data || [], source: 'jikan' });
    } catch { res.status(500).json({ error: 'Search failed' }); }
  });

  app.get('/api/anime/top', async (req, res) => {
    const page = req.query.page || 1;
    const filter = String(req.query.type || 'airing');
    try {
      const r = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&filter=${filter}&limit=20`);
      const d = await r.json() as any;
      res.json({ data: d?.data || [], source: 'jikan' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  app.get('/api/anime/random', async (_req, res) => {
    try {
      const r = await fetch('https://api.jikan.moe/v4/random/anime');
      const d = await r.json() as any;
      res.json({ data: d?.data || null, source: 'jikan' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  app.get('/api/anime/characters', async (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'ID required' });
    try {
      const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/characters`);
      const d = await r.json() as any;
      res.json({ data: d?.data || [], source: 'jikan' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  app.get('/api/anime/episodes', async (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'ID required' });
    try {
      const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes`);
      const d = await r.json() as any;
      res.json({ data: d?.data || [], source: 'jikan' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  app.get('/api/anime/recommendations', async (req, res) => {
    const id = Number(req.query.id);
    if (!id) return res.status(400).json({ error: 'ID required' });
    try {
      const r = await fetch(`https://api.jikan.moe/v4/anime/${id}/recommendations`);
      const d = await r.json() as any;
      res.json({ data: d?.data || [], source: 'jikan' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  app.get('/api/anime/quotes', async (req, res) => {
    const anime = String(req.query.anime || '');
    const character = String(req.query.character || '');
    try {
      let url = 'https://animechan.xyz/api/random';
      if (anime && character) url = `https://animechan.xyz/api/random/anime?title=${encodeURIComponent(anime)}&name=${encodeURIComponent(character)}`;
      else if (anime) url = `https://animechan.xyz/api/random/anime?title=${encodeURIComponent(anime)}`;
      else if (character) url = `https://animechan.xyz/api/random/character?name=${encodeURIComponent(character)}`;
      const r = await fetch(url);
      const d = await r.json() as any;
      res.json({ data: d, source: 'animechan' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  app.get('/api/waifu/random', async (req, res) => {
    const category = String(req.query.category || 'waifu');
    try {
      const r = await fetch(`https://api.waifu.pics/sfw/${category}`);
      const d = await r.json() as any;
      res.json({ url: d?.url || '', category, source: 'waifu.pics' });
    } catch { res.status(500).json({ error: 'Failed' }); }
  });

  // ─── Spotify ───
  app.get('/api/spotify/search', async (req, res) => {
    const q = String(req.query.q || '');
    if (!q) return res.status(400).json({ error: 'Query required' });
    try {
      const r = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track,artist,album&limit=10`, {
        headers: { 'Authorization': `Bearer ${process.env.SPOTIFY_TOKEN || ''}` }
      });
      const d = await r.json() as any;
      res.json({ tracks: d?.tracks?.items || [], artists: d?.artists?.items || [], albums: d?.albums?.items || [] });
    } catch { res.status(500).json({ error: 'Spotify search unavailable' }); }
  });

  app.get('/api/spotify/play', async (req, res) => {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ error: 'Track ID required' });
    res.json({ playUrl: `https://open.spotify.com/track/${id}`, id, source: 'spotify' });
  });

  // ─── YouTube Play ───
  app.get('/api/youtube/play', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      // Extract video ID
      const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
      if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      const d = await r.json() as any;
      res.json({
        videoId, title: d?.title || '', author: d?.author_name || '',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
        source: 'youtube'
      });
    } catch { res.status(500).json({ error: 'Failed to fetch video info' }); }
  });

  app.get('/api/youtube/search', async (req, res) => {
    const q = String(req.query.q || '');
    if (!q) return res.status(400).json({ error: 'Query required' });
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&format=json`);
      res.json({ query: q, results: [], source: 'youtube' });
    } catch { res.status(500).json({ error: 'Search failed' }); }
  });

  // ─── All-in-One Downloader ───
  app.get('/api/download', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });

    // Detect platform
    const isTikTok = url.includes('tiktok.com');
    const isInstagram = url.includes('instagram.com');
    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const isTwitter = url.includes('twitter.com') || url.includes('x.com');
    const isFacebook = url.includes('facebook.com') || url.includes('fb.com');
    const isSpotify = url.includes('spotify.com');
    const isSoundCloud = url.includes('soundcloud.com');

    try {
      let result: any = { url, detected: 'unknown', source: url };

      if (isTikTok) {
        try {
          const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
          const d = await r.json() as any;
          result = { url, detected: 'tiktok', videoUrl: d?.data?.play || d?.data?.wmplay || '', author: d?.data?.author?.nickname || '', title: d?.data?.title || '', source: 'tikwm' };
        } catch { result = { url, detected: 'tiktok', error: 'Could not fetch', source: 'tikwm' }; }
      } else if (isInstagram) {
        result = { url, detected: 'instagram', message: 'Use /api/instagram/download?url=' + url, source: 'instagram' };
      } else if (isYouTube) {
        const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
        result = { url, detected: 'youtube', videoId: videoId || '', thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '', source: 'youtube' };
      } else if (isTwitter) {
        result = { url, detected: 'twitter', message: 'Twitter video download', source: 'twitter' };
      } else {
        result = { url, detected: 'unknown', message: 'Unsupported platform. Supported: TikTok, Instagram, YouTube, Twitter/X, Facebook, Spotify', source: 'universal' };
      }

      res.json(result);
    } catch { res.status(500).json({ error: 'Download failed', url }); }
  });

  // ─── Tools ───
  app.get('/api/tools/qr', (req, res) => {
    const text = String(req.query.text || '');
    if (!text) return res.status(400).json({ error: 'Text required' });
    res.json({ qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`, text });
  });

  app.get('/api/tools/password', (req, res) => {
    const len = Number(req.query.length) || 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < len; i++) password += chars[Math.floor(Math.random() * chars.length)];
    res.json({ password, length: len });
  });

  app.get('/api/tools/weather', async (req, res) => {
    const city = String(req.query.city || '');
    if (!city) return res.status(400).json({ error: 'City required' });
    try {
      const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      const d = await r.json() as any;
      res.json({ data: d, source: 'wttr.in' });
    } catch { res.status(500).json({ error: 'Weather unavailable' }); }
  });

  app.get('/api/tools/news', async (req, res) => {
    const category = String(req.query.category || 'technology');
    try {
      const key = process.env.NEWS_API_KEY || 'demo';
      const r = await fetch(`https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${key}`);
      const d = await r.json() as any;
      res.json({ articles: d?.articles || [], source: 'newsapi' });
    } catch { res.status(500).json({ error: 'News unavailable' }); }
  });

  app.get('/api/tools/lyrics', async (req, res) => {
    const artist = String(req.query.artist || '');
    const title = String(req.query.title || '');
    if (!artist || !title) return res.status(400).json({ error: 'Artist and title required' });
    try {
      const r = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      const d = await r.json() as any;
      res.json({ lyrics: d?.lyrics || 'Not found', artist, title });
    } catch { res.status(500).json({ error: 'Lyrics unavailable' }); }
  });

  app.get('/api/tools/translate', async (req, res) => {
    const text = String(req.query.text || '');
    const target = String(req.query.target || 'es');
    if (!text) return res.status(400).json({ error: 'Text required' });
    try {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`);
      const d = await r.json() as any;
      res.json({ translated: d?.responseData?.translatedText || text, target });
    } catch { res.status(500).json({ error: 'Translation unavailable' }); }
  });

  app.get('/api/tools/tts', async (req, res) => {
    const text = String(req.query.text || '');
    if (!text) return res.status(400).json({ error: 'Text required' });
    try {
      const r = await fetch(`https://api.voicerss.org/?key=${process.env.VOICERSS_KEY || 'demo'}&src=${encodeURIComponent(text)}&hl=en-us`);
      const audio = await r.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      res.send(Buffer.from(audio));
    } catch { res.status(500).json({ error: 'TTS unavailable' }); }
  });

  // ─── Image Editing API ───
  app.get('/api/edit/resize', async (req, res) => {
    const { url, width, height } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL required' });
    const w = Number(width) || 400;
    const h = Number(height) || 300;
    res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&w=${w}&h=${h}&fit=outside`, source: 'weserv' });
  });

  app.get('/api/edit/filter', async (req, res) => {
    const { url, filter } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL required' });
    const filters: any = { grayscale: '&filt=grayscale', blur: '&filt=blur&radius=5', sepia: '&filt=sepia', brightness: '&filt=brightness&amount=1.3', contrast: '&filt=contrast&amount=1.5' };
    const filt = filters[String(filter || '')] || '';
    res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&w=500${filt}`, filter: filter || 'none' });
  });

  app.get('/api/edit/compress', async (req, res) => {
    const { url, quality } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL required' });
    const q = Number(quality) || 50;
    res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&w=800&q=${q}`, quality: q });
  });

  app.get('/api/edit/format', async (req, res) => {
    const { url, format } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL required' });
    const fmt = String(format || 'webp');
    res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&output=${fmt}`, format: fmt });
  });

  app.get('/api/edit/crop', async (req, res) => {
    const { url, x, y, w, h } = req.query;
    if (!url) return res.status(400).json({ error: 'Image URL required' });
    res.json({ result: `https://images.weserv.nl/?url=${encodeURIComponent(String(url))}&cx=${x || 0}&cy=${y || 0}&cw=${w || 200}&ch=${h || 200}`, source: 'weserv' });
  });

  // ─── Movie APIs ───
  app.get('/api/movies/search', async (req, res) => {
    const q = String(req.query.q || '');
    if (!q) return res.status(400).json({ error: 'Query required' });
    try {
      const r = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${process.env.OMDB_KEY || 'demo'}`);
      const d = await r.json() as any;
      res.json({ results: d?.Search || [], total: d?.totalResults || 0, source: 'omdb' });
    } catch { res.status(500).json({ error: 'Movie search unavailable' }); }
  });

  app.get('/api/movies/detail', async (req, res) => {
    const id = String(req.query.id || '');
    if (!id) return res.status(400).json({ error: 'Movie ID required' });
    try {
      const r = await fetch(`https://www.omdbapi.com/?i=${encodeURIComponent(id)}&apikey=${process.env.OMDB_KEY || 'demo'}`);
      const d = await r.json() as any;
      res.json({ data: d, source: 'omdb' });
    } catch { res.status(500).json({ error: 'Movie detail unavailable' }); }
  });

  app.get('/api/movies/trending', async (req, res) => {
    try {
      const r = await fetch('https://api.themoviedb.org/3/trending/movie/week?api_key=' + (process.env.TMDB_KEY || ''));
      const d = await r.json() as any;
      res.json({ results: d?.results || [], source: 'tmdb' });
    } catch { res.status(500).json({ error: 'Trending unavailable' }); }
  });

  app.get('/api/movies/popular', async (req, res) => {
    const page = req.query.page || 1;
    try {
      const r = await fetch(`https://api.themoviedb.org/3/movie/popular?page=${page}&api_key=${process.env.TMDB_KEY || ''}`);
      const d = await r.json() as any;
      res.json({ results: d?.results || [], page: d?.page || 1, total: d?.total_results || 0, source: 'tmdb' });
    } catch { res.status(500).json({ error: 'Popular movies unavailable' }); }
  });

  app.get('/api/movies/upcoming', async (req, res) => {
    try {
      const r = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${process.env.TMDB_KEY || ''}`);
      const d = await r.json() as any;
      res.json({ results: d?.results || [], source: 'tmdb' });
    } catch { res.status(500).json({ error: 'Upcoming unavailable' }); }
  });

  app.get('/api/movies/top-rated', async (req, res) => {
    try {
      const r = await fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.TMDB_KEY || ''}`);
      const d = await r.json() as any;
      res.json({ results: d?.results || [], source: 'tmdb' });
    } catch { res.status(500).json({ error: 'Top rated unavailable' }); }
  });

  // ─── Anime Download ───
  app.get('/api/anime/download', async (req, res) => {
    const { url, episode } = req.query;
    if (!url) return res.status(400).json({ error: 'Anime URL required' });
    try {
      const episodeId = String(episode || '').includes('episode-') ? String(episode) : `${String(url)}-episode-${Number(episode) || 1}`;
      const r = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${encodeURIComponent(episodeId)}?server=gogocdn`);
      const d = await r.json() as any;
      const sources = (d?.sources || []).map((s: any) => ({ quality: s.quality || 'auto', url: s.url }));
      if (d?.download) sources.push({ quality: 'download', url: d.download });
      res.json({ sources, episode: Number(episode) || 1, source: 'gogoanime' });
    } catch { res.status(500).json({ error: 'Anime download unavailable' }); }
  });

  app.get('/api/anime/stream', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Episode ID required' });
    try {
      const r = await fetch(`https://api.consumet.org/anime/gogoanime/watch/${encodeURIComponent(String(id))}`);
      const d = await r.json() as any;
      res.json({ sources: d?.sources || [], subtitles: d?.subtitles || [], source: 'gogoanime' });
    } catch { res.status(500).json({ error: 'Stream unavailable' }); }
  });

  app.get('/api/anime/servers', async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Episode ID required' });
    try {
      const r = await fetch(`https://api.consumet.org/anime/gogoanime/servers/${encodeURIComponent(String(id))}`);
      const d = await r.json() as any;
      res.json({ servers: d || [], source: 'gogoanime' });
    } catch { res.status(500).json({ error: 'Servers unavailable' }); }
  });

  // ─── Movie Download ───
  app.get('/api/movies/download', async (req, res) => {
    const { id, source } = req.query;
    if (!id) return res.status(400).json({ error: 'Movie ID required' });
    try {
      const src = String(source || 'tmdb');
      if (src === 'tmdb') {
        const r = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_KEY || ''}&append_to_response=videos,external_ids`);
        const d = await r.json() as any;
        res.json({
          title: d?.title || '',
          overview: d?.overview || '',
          poster: d?.poster_path ? `https://image.tmdb.org/t/p/w500${d.poster_path}` : '',
          backdrop: d?.backdrop_path ? `https://image.tmdb.org/t/p/w1280${d.backdrop_path}` : '',
          runtime: d?.runtime || 0,
          rating: d?.vote_average || 0,
          trailer: d?.videos?.results?.[0]?.key ? `https://www.youtube.com/watch?v=${d.videos.results[0].key}` : '',
          source: 'tmdb',
          downloadUrl: `https://www.google.com/search?q=${encodeURIComponent(d?.title || '')}+movie+download+free`,
        });
      } else if (src === 'flix') {
        const r = await fetch(`https://flixhq.to/ajax/movie/episodes/${id}`);
        const d = await r.json() as any;
        res.json({ data: d, source: 'flixhq' });
      } else {
        res.json({ id, source: src, downloadUrl: `https://www.google.com/search?q=movie+${id}+download` });
      }
    } catch { res.status(500).json({ error: 'Movie download unavailable' }); }
  });

  app.get('/api/movies/stream', async (req, res) => {
    const { id, season, episode } = req.query;
    if (!id) return res.status(400).json({ error: 'Movie/Show ID required' });
    try {
      const r = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${process.env.TMDB_KEY || ''}`);
      const d = await r.json() as any;
      res.json({
        results: d?.results || {},
        streamUrl: `https://www.google.com/search?q=watch+${encodeURIComponent(id)}+online+free`,
        source: 'tmdb'
      });
    } catch { res.status(500).json({ error: 'Stream info unavailable' }); }
  });

  // ─── Fix Old/Updated APIs ───
  app.get('/api/ytdl', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      const d = await r.json() as any;
      const videoId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
      res.json({
        title: d?.title || '', author: d?.author_name || '',
        thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
        videoId, formats: [{ quality: '720p', url: `https://www.youtube.com/watch?v=${videoId}` }],
        source: 'youtube-oembed'
      });
    } catch { res.status(500).json({ error: 'Download unavailable' }); }
  });

  app.get('/api/instagram', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const r = await fetch(`https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`);
      const d = await r.json() as any;
      res.json({ title: d?.title || '', author: d?.author_name || '', thumbnail: d?.thumbnail_url || '', source: 'instagram-oembed' });
    } catch { res.status(500).json({ error: 'Instagram unavailable' }); }
  });

  app.get('/api/tiktok', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const d = await r.json() as any;
      res.json({
        author: d?.data?.author?.nickname || '', title: d?.data?.title || '',
        videoUrl: d?.data?.play || d?.data?.wmplay || '',
        music: d?.data?.music || '', source: 'tikwm'
      });
    } catch { res.status(500).json({ error: 'TikTok unavailable' }); }
  });

  app.get('/api/facebook', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const r = await fetch(`https://www.facebook.com/plugins/video/oembed.json?url=${encodeURIComponent(url)}`);
      const d = await r.json() as any;
      res.json({ title: d?.title || '', author: d?.author_name || '', html: d?.html || '', source: 'facebook-oembed' });
    } catch { res.status(500).json({ error: 'Facebook unavailable' }); }
  });

  app.get('/api/twitter', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const r = await fetch(`https://api.twitter.com/2/tweets?ids=${encodeURIComponent(url)}`);
      const d = await r.json() as any;
      res.json({ data: d?.data || {}, source: 'twitter' });
    } catch { res.status(500).json({ error: 'Twitter unavailable' }); }
  });

  app.get('/api/soundcloud', async (req, res) => {
    const url = String(req.query.url || '');
    if (!url) return res.status(400).json({ error: 'URL required' });
    try {
      const r = await fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`);
      const d = await r.json() as any;
      res.json({ title: d?.title || '', author: d?.author_name || '', thumbnail: d?.thumbnail_url || '', source: 'soundcloud-oembed' });
    } catch { res.status(500).json({ error: 'SoundCloud unavailable' }); }
  });

  console.log('✅ New API routes registered (including movie download, fixed social apis, ytdl, instagram, tiktok, facebook, twitter, soundcloud)');
}
