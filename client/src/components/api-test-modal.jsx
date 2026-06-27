import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, X, Send } from 'lucide-react';

export default function ApiTestModal({ endpoint, isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!endpoint) return null;

  const buildUrl = () => {
    const base = endpoint.endpoint.startsWith('/') ? endpoint.endpoint : `/${endpoint.endpoint}`;
    if (!input.trim()) return `${window.location.origin}${base}`;
    const query = new URLSearchParams();
    query.set('q', input.trim());
    return `${window.location.origin}${base}${base.includes('?') ? '&' : '?'}${query.toString()}`;
  };

  const testEndpoint = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(buildUrl());
      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ status: 0, data: { error: error.message || 'Request failed' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{endpoint.title}</DialogTitle>
              <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">{endpoint.endpoint} • <strong className="ml-2">{endpoint.method}</strong></div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigator.clipboard?.writeText(buildUrl())}><Copy className="h-4 w-4" /></Button>
              <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="query">Query / Input</Label>
              <Input id="query" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try: inception" />
            </div>
            <div className="flex items-end space-y-0">
              <Button onClick={testEndpoint} disabled={loading} className="w-full"><Send className="mr-2 h-4 w-4" />{loading ? 'Testing...' : 'Run'}</Button>
            </div>
          </div>

          {result && (
            <div className="rounded-lg border bg-background p-3">
              <div className="mb-2 text-sm font-medium">Response status: {result.status}</div>
              <pre className="max-h-96 overflow-auto text-xs">{JSON.stringify(result.data, null, 2)}</pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
