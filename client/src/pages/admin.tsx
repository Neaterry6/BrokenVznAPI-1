import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { SkeletonTable } from '@/components/ui/skeleton-loader';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Shield, Users, Activity, LogOut } from 'lucide-react';
import { BackButton } from "@/components/back-button";

interface User {
  id: string;
  username: string;
  apiKey: string;
  tier: string;
  requestCount: number;
  createdAt: string;
}

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
}

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  // Check admin status on load
  const { data: adminStatus } = useQuery({
    queryKey: ['/api/admin/status'],
    enabled: true,
    retry: false
  });

  useEffect(() => {
    if ((adminStatus as any)?.authenticated) {
      setIsLoggedIn(true);
    }
  }, [adminStatus]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return response.json();
    },
    onSuccess: () => {
      setIsLoggedIn(true);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
      toast({
        title: "Success",
        description: "Admin login successful"
      });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive"
      });
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/logout', { method: 'POST' });
      return response.json();
    },
    onSuccess: () => {
      setIsLoggedIn(false);
      setEmail('');
      setPassword('');
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "Successfully logged out"
      });
    }
  });

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isLoggedIn
  });

  // Logs query
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['/api/admin/logs'],
    enabled: isLoggedIn
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <BackButton />
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Access the BrokenVZN API admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                  data-testid="input-admin-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  data-testid="input-admin-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-admin-login"
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner variant="dots" size="sm" />
                    Logging in...
                  </div>
                ) : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BackButton />
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">BrokenVZN API Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              data-testid="button-admin-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="logs" data-testid="tab-logs">
              <Activity className="w-4 h-4 mr-2" />
              API Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage API users</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4" data-testid="loading-users">
                    <div className="flex items-center justify-center gap-2 py-4">
                      <LoadingSpinner variant="dots" size="md" className="text-primary" />
                      <span className="text-sm text-muted-foreground">Loading users...</span>
                    </div>
                    <SkeletonTable rows={5} cols={5} />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>API Key</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(usersData as any)?.users?.map((user: User) => (
                        <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                          <TableCell className="font-medium" data-testid={`text-username-${user.id}`}>
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded" data-testid={`text-apikey-${user.id}`}>
                              {user.apiKey}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.tier === 'enterprise' ? 'default' : user.tier === 'pro' ? 'secondary' : 'outline'}
                              data-testid={`badge-tier-${user.id}`}
                            >
                              {user.tier}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-requests-${user.id}`}>
                            {user.requestCount || 0}
                          </TableCell>
                          <TableCell data-testid={`text-created-${user.id}`}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>API Request Logs</CardTitle>
                <CardDescription>Monitor API usage and performance</CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="space-y-4" data-testid="loading-logs">
                    <div className="flex items-center justify-center gap-2 py-4">
                      <LoadingSpinner variant="bars" size="md" className="text-primary" />
                      <span className="text-sm text-muted-foreground">Loading logs...</span>
                    </div>
                    <SkeletonTable rows={8} cols={5} />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(logsData as any)?.logs?.map((log: ApiLog) => (
                        <TableRow key={log.id} data-testid={`row-log-${log.id}`}>
                          <TableCell className="font-mono text-sm" data-testid={`text-endpoint-${log.id}`}>
                            {log.endpoint}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-method-${log.id}`}>
                              {log.method}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.statusCode < 400 ? 'default' : 'destructive'}
                              data-testid={`badge-status-${log.id}`}
                            >
                              {log.statusCode}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`text-response-time-${log.id}`}>
                            {log.responseTime ? `${log.responseTime}ms` : 'N/A'}
                          </TableCell>
                          <TableCell data-testid={`text-timestamp-${log.id}`}>
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}