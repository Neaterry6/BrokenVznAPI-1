import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Activity, LogOut, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signInWithGooglePopup, signOutGoogle } from '@/lib/firebase';

const ADMIN_EMAIL = 'akewusholaabdulbakri101@gmail.com';

async function jsonFetch(path, options = {}) {
  const response = await fetch(path, { credentials: 'include', ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }
  return data;
}

export default function AdminEnhanced() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [status, setStatus] = useState({ authenticated: false });
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const loadStatus = async () => {
    const data = await jsonFetch('/api/admin/status');
    setStatus(data);
    return data;
  };

  const loadAdminData = async () => {
    const [usersData, logsData] = await Promise.all([
      jsonFetch('/api/admin/users'),
      jsonFetch('/api/admin/logs?limit=50'),
    ]);
    setUsers(usersData.users || []);
    setLogs(logsData.logs || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await loadStatus();
        if (data.authenticated) await loadAdminData();
      } catch (error) {
        setStatus({ authenticated: false });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleGoogleAdminLogin = async () => {
    setSigningIn(true);
    try {
      const credential = await signInWithGooglePopup();
      const idToken = await credential.user.getIdToken();
      const data = await jsonFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      localStorage.setItem('apiKey', data.user.apiKey);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('isLoggedIn', 'true');
      await loadStatus();
      await loadAdminData();
      toast({ title: 'Admin signed in', description: `Welcome ${ADMIN_EMAIL}.` });
    } catch (error) {
      toast({ title: 'Admin sign-in failed', description: error.message, variant: 'destructive' });
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await jsonFetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    await signOutGoogle().catch(() => null);
    setStatus({ authenticated: false });
    setUsers([]);
    setLogs([]);
  };

  if (loading) {
    return <div className="container mx-auto p-8 text-muted-foreground">Loading admin portal...</div>;
  }

  if (!status.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/10">
        <Card className="w-full max-w-lg border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ShieldCheck className="h-6 w-6 text-primary" /> Admin Google Auth
            </CardTitle>
            <CardDescription>
              The admin portal is locked to <span className="font-medium text-foreground">{ADMIN_EMAIL}</span>. Sign in with the matching Firebase Google account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" size="lg" onClick={handleGoogleAdminLogin} disabled={signingIn} data-testid="button-admin-google-login">
              {signingIn ? 'Checking Google account...' : 'Continue with Google as admin'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Password admin login has been removed. Firebase verifies the Google ID token on the server before any admin data is returned.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> Admin Portal</h1>
          <p className="text-muted-foreground">Signed in as {status.adminEmail}</p>
        </div>
        <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Users</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{users.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Recent logs</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{logs.length}</CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5" /> Auth mode</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Firebase Google Auth only</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Users and API keys</CardTitle><CardDescription>Every account is created through Firebase Google Auth and receives its own API key.</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-2">Email</th><th className="p-2">Role</th><th className="p-2">Tier</th><th className="p-2">Requests</th><th className="p-2">API Key</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b last:border-0">
                  <td className="p-2">{user.email || user.username}</td>
                  <td className="p-2">{user.role || 'user'}</td>
                  <td className="p-2">{user.tier || 'free'}</td>
                  <td className="p-2">{user.requestCount || 0}</td>
                  <td className="p-2 font-mono text-xs">{user.apiKey}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent API logs</CardTitle><CardDescription>Latest protected API calls recorded for signed-in users.</CardDescription></CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left"><th className="p-2">Endpoint</th><th className="p-2">Method</th><th className="p-2">Status</th><th className="p-2">Response</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b last:border-0">
                  <td className="p-2 font-mono text-xs">{log.endpoint}</td>
                  <td className="p-2">{log.method}</td>
                  <td className="p-2">{log.statusCode}</td>
                  <td className="p-2">{log.responseTime}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
