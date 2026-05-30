import { useState } from 'react';
import { useLocation } from 'wouter';
import { KeyRound, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithGooglePopup } from '@/lib/firebase';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      const credential = await signInWithGooglePopup();
      const idToken = await credential.user.getIdToken();
      const response = await fetch('/api/auth/firebase-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Google sign-in failed');
      }
      localStorage.setItem('apiKey', data.user.apiKey);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      setUser(data.user);
      toast({
        title: 'Account ready',
        description: 'Your Firebase account and API key are ready to use.',
      });
    } catch (error) {
      toast({ title: 'Sign-in failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <Card className="border-primary/20 bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" /> BrokenVZN API
            </CardTitle>
            <CardDescription>
              Sign in with Firebase Google Auth to create your account, get your personal API key, and test every endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <UserPlus className="mt-1 h-5 w-5 text-primary" />
              <p>New users are created automatically the first time they sign in with Google.</p>
            </div>
            <div className="flex gap-3">
              <KeyRound className="mt-1 h-5 w-5 text-primary" />
              <p>Each account receives a unique <code className="rounded bg-muted px-1">bvzn_...</code> API key for protected endpoints.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-primary" />
              <p>Send your key as <code className="rounded bg-muted px-1">X-API-Key</code> or <code className="rounded bg-muted px-1">?apiKey=</code> when calling APIs.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/90 backdrop-blur">
          <CardHeader>
            <CardTitle>{user ? 'Your API key' : 'Create account / Login'}</CardTitle>
            <CardDescription>
              {user ? 'Copy this key into requests or use the docs testing cards.' : 'Google sign-in is the only supported signup and login method.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">Signed in as</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div className="rounded-lg border bg-background p-4 font-mono text-sm break-all" data-testid="api-key-display">
                  {user.apiKey}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => navigator.clipboard?.writeText(user.apiKey)}>Copy API key</Button>
                  <Button variant="outline" onClick={() => setLocation('/docs')}>Test APIs</Button>
                </div>
              </>
            ) : (
              <Button className="w-full" size="lg" onClick={handleGoogleAuth} disabled={isLoading} data-testid="button-google-login">
                {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
