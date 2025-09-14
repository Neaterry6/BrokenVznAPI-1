import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Shield, Users, Activity, LogOut, Bell, Settings, TrendingUp, 
  Server, Database, Zap, AlertTriangle, CheckCircle, Clock,
  Eye, ToggleLeft, ToggleRight, Crown, Star, UserCheck
} from 'lucide-react';
import { BackButton } from "@/components/back-button";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  isRead: boolean;
  userId?: string;
  endpoint?: string;
}

interface ApiEndpoint {
  id: string;
  path: string;
  method: string;
  category: string;
  description: string;
  isEnabled: boolean;
  totalCalls: number;
  lastCalled?: string;
  averageResponseTime: number;
  successRate: number;
  rateLimit?: number;
  requiresAuth: boolean;
}

interface AdminAnalytics {
  totalUsers: number;
  totalApiCalls: number;
  totalEndpoints: number;
  activeUsers24h: number;
  errorRate: number;
  averageResponseTime: number;
  topEndpoints: Array<{
    endpoint: string;
    calls: number;
    successRate: number;
  }>;
  recentActivity: Array<{
    timestamp: string;
    endpoint: string;
    method: string;
    status: number;
    user: string;
  }>;
  userTierDistribution: {
    free: number;
    pro: number;
    enterprise: number;
  };
}

interface User {
  id: string;
  username: string;
  apiKey: string;
  tier: string;
  requestCount: number;
  createdAt: string;
}

export default function AdminEnhancedPage() {
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

  // Dashboard data query
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    enabled: isLoggedIn,
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  // Legacy queries for backward compatibility
  const { data: usersData } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isLoggedIn
  });

  const { data: logsData } = useQuery({
    queryKey: ['/api/admin/logs'],
    enabled: isLoggedIn
  });

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

  // Toggle endpoint mutation
  const toggleEndpointMutation = useMutation({
    mutationFn: async (endpointId: string) => {
      return apiRequest(`/api/admin/endpoint/${endpointId}/toggle`, { method: 'POST' });
    },
    onSuccess: () => {
      refetchDashboard();
      toast({
        title: "Success",
        description: "Endpoint status updated"
      });
    }
  });

  // Update user tier mutation
  const updateUserTierMutation = useMutation({
    mutationFn: async ({ userId, tier }: { userId: string; tier: string }) => {
      return apiRequest(`/api/admin/user/${userId}/tier`, { 
        method: 'POST',
        body: JSON.stringify({ tier })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      refetchDashboard();
      toast({
        title: "Success",
        description: "User tier updated successfully"
      });
    }
  });

  // Mark notification read mutation
  const markNotificationReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/admin/notification/${notificationId}/read`, { method: 'POST' });
    },
    onSuccess: () => {
      refetchDashboard();
    }
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
            <CardTitle>Enhanced Admin Login</CardTitle>
            <CardDescription>Access the BrokenVZN API enhanced admin panel</CardDescription>
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
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const analytics = dashboardData?.data?.analytics;
  const notifications = dashboardData?.data?.notifications || [];
  const endpoints = dashboardData?.data?.endpoints || [];
  const systemStatus = dashboardData?.data?.systemStatus;

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
                <h1 className="text-2xl font-bold text-foreground">Enhanced Admin Panel</h1>
                <p className="text-sm text-muted-foreground">BrokenVZN API Advanced Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {notifications.filter(n => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="relative">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Badge>
              )}
              <Button 
                variant="outline" 
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="endpoints">
                <Settings className="w-4 h-4 mr-2" />
                Endpoints
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notifications.filter(n => !n.isRead).length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Activity className="w-4 h-4 mr-2" />
                Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics?.activeUsers24h || 0} active in 24h
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.totalApiCalls || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics?.errorRate || 0}% error rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics?.averageResponseTime || 0}ms</div>
                    <p className="text-xs text-muted-foreground">
                      Across all endpoints
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Operational</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uptime: {systemStatus?.uptime || 'N/A'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Endpoints</CardTitle>
                    <CardDescription>Most used API endpoints</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.topEndpoints?.slice(0, 5).map((endpoint, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{endpoint.endpoint}</p>
                            <p className="text-xs text-muted-foreground">{endpoint.calls} calls</p>
                          </div>
                          <Badge variant={endpoint.successRate > 95 ? "default" : "secondary"}>
                            {endpoint.successRate}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Users by tier</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">Free</Badge>
                          <span className="text-sm">{analytics?.userTierDistribution?.free || 0} users</span>
                        </div>
                        <Progress value={(analytics?.userTierDistribution?.free || 0) / (analytics?.totalUsers || 1) * 100} className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">Pro</Badge>
                          <span className="text-sm">{analytics?.userTierDistribution?.pro || 0} users</span>
                        </div>
                        <Progress value={(analytics?.userTierDistribution?.pro || 0) / (analytics?.totalUsers || 1) * 100} className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="destructive">Enterprise</Badge>
                          <span className="text-sm">{analytics?.userTierDistribution?.enterprise || 0} users</span>
                        </div>
                        <Progress value={(analytics?.userTierDistribution?.enterprise || 0) / (analytics?.totalUsers || 1) * 100} className="w-20" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="endpoints">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoint Management</CardTitle>
                  <CardDescription>Monitor and control API endpoints</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {endpoints.map((endpoint) => (
                      <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{endpoint.method}</Badge>
                            <span className="font-medium">{endpoint.path}</span>
                            <Badge>{endpoint.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>Calls: {endpoint.totalCalls}</span>
                            <span>Success: {endpoint.successRate}%</span>
                            <span>Avg: {endpoint.averageResponseTime}ms</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={endpoint.isEnabled}
                            onCheckedChange={() => toggleEndpointMutation.mutate(endpoint.id)}
                          />
                          {endpoint.isEnabled ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage API users and their permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>API Key</TableHead>
                        <TableHead>Current Tier</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users?.map((user: User) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell className="font-mono text-xs">{user.apiKey}</TableCell>
                          <TableCell>
                            <Badge variant={user.tier === 'enterprise' ? 'destructive' : user.tier === 'pro' ? 'default' : 'secondary'}>
                              {user.tier}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.requestCount}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserTierMutation.mutate({ userId: user.id, tier: 'pro' })}
                                disabled={user.tier === 'pro'}
                              >
                                <Star className="w-3 h-3 mr-1" />
                                Pro
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateUserTierMutation.mutate({ userId: user.id, tier: 'enterprise' })}
                                disabled={user.tier === 'enterprise'}
                              >
                                <Crown className="w-3 h-3 mr-1" />
                                Enterprise
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>System Notifications</CardTitle>
                  <CardDescription>Real-time alerts and system updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-accent/50 border-primary/20' : 'hover:bg-accent/30'
                        }`}
                        onClick={() => markNotificationReadMutation.mutate(notification.id)}
                      >
                        <div className="flex items-start space-x-2">
                          {notification.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />}
                          {notification.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-1" />}
                          {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 mt-1" />}
                          {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-500 mt-1" />}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{notification.title}</h4>
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                            {notification.endpoint && (
                              <Badge variant="outline" className="mt-2">{notification.endpoint}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>API Logs</CardTitle>
                  <CardDescription>Recent API activity and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Response Time</TableHead>
                        <TableHead>User ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsData?.logs?.slice(0, 20).map((log: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{log.endpoint}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.method}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                log.statusCode < 300 ? 'default' : 
                                log.statusCode < 400 ? 'secondary' :
                                log.statusCode < 500 ? 'destructive' : 'destructive'
                              }
                            >
                              {log.statusCode}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.responseTime}ms</TableCell>
                          <TableCell className="text-xs">{log.userId || 'Anonymous'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}