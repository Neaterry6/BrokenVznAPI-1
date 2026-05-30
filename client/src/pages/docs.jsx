import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Copy, KeyRound, Play, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const featuredEndpoints = [
  { name: 'Anime trending', method: 'GET', path: '/api/anime?type=trending', description: 'Currently airing anime from the anime scraper.' },
  { name: 'Anime full chain', method: 'GET', path: '/api/anime?type=full&q=aot', description: 'Search + details + episode/download discovery.' },
  { name: 'Movie homepage', method: 'GET', path: '/api/movie?type=homepage', description: 'Trending, hot movies, and popular series.' },
  { name: 'Movie search', method: 'GET', path: '/api/movie?type=search&q=inception', description: 'Search FlixHQ/Consumet movie and TV results.' },
  { name: 'OmniSave search', method: 'GET', path: '/api/omnisave?type=search&q=avatar', description: 'Search OmniSave movie/series resources.' },
  { name: 'Quote random', method: 'GET', path: '/api/quotes/random', description: 'Example protected utility endpoint.' },
];

function curlExample(apiKey, path) {
  return `curl -H "X-API-Key: ${apiKey || 'bvzn_your_api_key'}" "${window.location.origin}${path}"`;
}

function TestCard({ endpoint, apiKey }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);

  const runTest = async () => {
    if (!apiKey) {
      setOutput({ success: false, error: 'Sign in first and paste your API key.' });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(endpoint.path, { headers: { 'X-API-Key': apiKey } });
      const data = await response.json();
      setOutput(data);
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    } catch (error) {
      toast({ title: 'API test failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{endpoint.name}</CardTitle>
            <CardDescription>{endpoint.description}</CardDescription>
          </div>
          <Badge variant="secondary">{endpoint.method}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <code className="block rounded bg-muted p-2 text-xs break-all">{endpoint.path}</code>
        <div className="flex gap-2">
          <Button onClick={runTest} disabled={loading} size="sm"><Play className="mr-2 h-4 w-4" /> {loading ? 'Testing...' : 'Test API'}</Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(curlExample(apiKey, endpoint.path))}><Copy className="mr-2 h-4 w-4" /> cURL</Button>
        </div>
        {output && <pre className="max-h-80 overflow-auto rounded bg-black p-3 text-xs text-green-200">{JSON.stringify(output, null, 2)}</pre>}
      </CardContent>
    </Card>
  );
}

export default function Docs() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('apiKey') || '');
  const exampleEndpoint = useMemo(() => featuredEndpoints[0], []);

  return (
    <div className="container mx-auto space-y-8 p-6">
      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <Badge>Firebase Google Auth required</Badge>
          <h1 className="text-4xl font-bold tracking-tight">BrokenVZN API Docs & Live Tester</h1>
          <p className="text-muted-foreground">
            Every API endpoint is protected. Create an account with Firebase Google Auth, copy your personal API key, and call endpoints with the <code className="rounded bg-muted px-1">X-API-Key</code> header.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link href="/login"><KeyRound className="mr-2 h-4 w-4" /> Get API key</Link></Button>
            <Button variant="outline" asChild><Link href="/admin"><ShieldCheck className="mr-2 h-4 w-4" /> Admin portal</Link></Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>1. Sign in</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Use Google on the login page. The backend verifies your Firebase ID token and creates your user record.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>2. Copy your key</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Your key starts with <code className="rounded bg-muted px-1">bvzn_</code> and is saved locally for the tester cards.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>3. Call APIs</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Use <code className="rounded bg-muted px-1">X-API-Key</code> or append <code className="rounded bg-muted px-1">?apiKey=...</code>.</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>How to call an endpoint</CardTitle>
          <CardDescription>Paste or edit your API key, then copy the cURL command or test directly below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={apiKey} onChange={(e) => { setApiKey(e.target.value); localStorage.setItem('apiKey', e.target.value); }} placeholder="bvzn_your_api_key" />
          <pre className="overflow-auto rounded bg-muted p-3 text-xs">{curlExample(apiKey, exampleEndpoint.path)}</pre>
        </CardContent>
      </Card>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Live API test cards</h2>
          <p className="text-muted-foreground">Click any card to run the request and see the JSON output immediately.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {featuredEndpoints.map((endpoint) => <TestCard key={endpoint.path} endpoint={endpoint} apiKey={apiKey} />)}
        </div>
      </section>
    </div>
  );
}
