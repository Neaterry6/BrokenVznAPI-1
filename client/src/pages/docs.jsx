import { useMemo, useState } from 'react';
import { Copy, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ApiTestModal from '@/components/api-test-modal';

const featuredEndpoints = [
  { name: 'Anime trending', method: 'GET', path: '/api/anime?type=trending', description: 'Fast anime discovery and trending results.' },
  { name: 'Movie homepage', method: 'GET', path: '/api/movie?type=homepage', description: 'Trending movies, hot picks, and series.' },
  { name: 'Movie search', method: 'GET', path: '/api/movie?type=search&q=inception', description: 'Search movies and series from the movie API.' },
  { name: 'AI models', method: 'GET', path: '/api/ai/models', description: 'List the supported AI providers and model options.' },
  { name: 'NanoBanana image', method: 'GET', path: '/api/ai/image?prompt=cyberpunk%20cat&model=nanobanana', description: 'Generate an image using the NanoBanana-style route.' },
  { name: 'NanoBanana edit', method: 'GET', path: '/api/ai/image/edit?prompt=add%20rain%20and%20night%20lights&model=nanobanana', description: 'Image edit endpoint for prompt-driven transformations.' },
  { name: 'NanoBanana edit alias', method: 'GET', path: '/api/nanobanana/edit?prompt=add%20night%20lights&image=https://example.com/image.jpg', description: 'Alias route for NanoBanana-style image editing.' },
  { name: 'OpenAI-style chat', method: 'GET', path: '/api/ai/chat/openai?prompt=hello', description: 'Public OpenAI-style chat demo endpoint.' },
  { name: 'Claude-style chat', method: 'GET', path: '/api/ai/chat/claude?prompt=hello', description: 'Public Claude-style chat demo endpoint.' },
  { name: 'Spotify download', method: 'GET', path: '/api/spotify/download?url=https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC', description: 'Return a public download hint for a Spotify track.' },
  { name: 'Music download', method: 'GET', path: '/api/music/download?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ', description: 'Public music download helper endpoint.' },
  { name: 'Splay search', method: 'GET', path: '/api/splay/search?q=lofi', description: 'Public demo endpoint for Splay-style search results.' },
];

function curlExample(path) {
  return `curl "${window.location.origin}${path}"`;
}

function TestCard({ endpoint, onOpen }) {
  const [loading, setLoading] = useState(false);
  return (
    <Card className="border-primary/10 hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{endpoint.name}</CardTitle>
            <CardDescription className="text-sm">{endpoint.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <Badge variant="secondary" className="mb-2">{endpoint.method}</Badge>
            <div className="text-xs text-muted-foreground">{endpoint.path}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button onClick={() => onOpen(endpoint)} disabled={loading} size="sm"><Play className="mr-2 h-4 w-4" /> Open Tester</Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(curlExample(endpoint.path))}><Copy className="mr-2 h-4 w-4" /> cURL</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Docs() {
  const [query, setQuery] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const exampleEndpoint = useMemo(() => featuredEndpoints[0], []);

  const filtered = featuredEndpoints.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (e.name || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q) || (e.path || '').toLowerCase().includes(q);
  });

  const openTester = (endpoint) => {
    setSelectedEndpoint(endpoint);
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto space-y-8 p-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <Badge>Public API Playground</Badge>
          <h1 className="text-4xl font-bold tracking-tight">BrokenVZN API Docs & Live Tester</h1>
          <p className="text-muted-foreground">
            Browse anime, movie, and AI endpoints directly from the browser. No login, no signup, and no API key is required for the public playground.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>1. Open an endpoint</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Use the live cards below or call the endpoints directly with your browser or cURL.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>2. Try the new AI routes</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Generate images, edit prompts, and discover supported AI models without any account setup.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>3. Explore movies and anime</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Search trending media, stream details, and test the movie and anime endpoints instantly.</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>How to call an endpoint</CardTitle>
          <CardDescription>Copy the example cURL command below or test the endpoint directly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative w-full">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search endpoints, names, paths..." className="w-full bg-muted/5 border border-border rounded px-3 py-2" />
            </div>
            <Button variant="ghost" onClick={() => setQuery('')}><Search className="h-4 w-4" /></Button>
          </div>
          <pre className="overflow-auto rounded bg-muted p-3 text-xs">{curlExample(exampleEndpoint.path)}</pre>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Live API test cards</h2>
          <p className="text-muted-foreground">Click any card to run the request and see the JSON output immediately.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((endpoint) => <TestCard key={endpoint.path} endpoint={endpoint} onOpen={openTester} />)}
        </div>
      </section>
      {selectedEndpoint && (
        <ApiTestModal endpoint={selectedEndpoint} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
