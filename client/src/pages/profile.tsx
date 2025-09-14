import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Copy, Eye, EyeOff, Key, RefreshCw, Settings, TrendingUp, User, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UserData {
  username: string;
  email?: string;
  apiKey: string;
  tier: string;
  requestCount?: number;
  createdAt?: string;
}

export default function Profile() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<UserData | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      setLocation('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setProfileForm({
        username: parsedUser.username || '',
        email: parsedUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [setLocation]);

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'free':
        return {
          name: 'Free',
          limit: 1000,
          color: 'secondary' as const,
          features: ['1,000 requests/month', 'Basic endpoints', 'Community support']
        };
      case 'pro':
        return {
          name: 'Pro',
          limit: 100000,
          color: 'default' as const,
          features: ['100,000 requests/month', 'All endpoints', 'Priority support', 'Analytics dashboard']
        };
      case 'enterprise':
        return {
          name: 'Enterprise',
          limit: -1,
          color: 'destructive' as const,
          features: ['Unlimited requests', 'Custom endpoints', '24/7 support', 'SLA guarantee']
        };
      default:
        return {
          name: 'Unknown',
          limit: 0,
          color: 'secondary' as const,
          features: []
        };
    }
  };

  const copyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      toast({
        title: "API Key Copied",
        description: "Your API key has been copied to clipboard",
      });
    }
  };

  const regenerateApiKey = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      const newApiKey = `bvzn_${Math.random().toString(36).substring(2, 15)}`;
      
      const updatedUser = { ...user!, apiKey: newApiKey };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('apiKey', newApiKey);

      toast({
        title: "API Key Regenerated",
        description: "Your new API key is ready to use",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate profile update
      const updatedUser = {
        ...user!,
        username: profileForm.username,
        email: profileForm.email
      };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('apiKey');
    localStorage.removeItem('isLoggedIn');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
    setLocation('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const tierInfo = getTierInfo(user.tier);
  const usagePercentage = user.requestCount && tierInfo.limit > 0 
    ? Math.min((user.requestCount / tierInfo.limit) * 100, 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-profile">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account, API keys, and subscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Account Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{user.username}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Current Plan</span>
                    <Badge variant={tierInfo.color}>{tierInfo.name}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tierInfo.limit === -1 ? 'Unlimited requests' : `${tierInfo.limit.toLocaleString()} requests/month`}
                  </div>
                </div>

                {tierInfo.limit > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Usage</span>
                      <span className="text-xs text-muted-foreground">
                        {user.requestCount || 0} / {tierInfo.limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Plan Features</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {tierInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {user.tier === 'free' && (
                  <Button className="w-full" data-testid="button-upgrade">
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account" data-testid="tab-account">
                  <Settings className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="api" data-testid="tab-api">
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </TabsTrigger>
                <TabsTrigger value="usage" data-testid="tab-usage">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Usage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your account settings and personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={updateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={profileForm.username}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                            data-testid="input-username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Change Password</h3>
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={profileForm.currentPassword}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                            data-testid="input-current-password"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={profileForm.newPassword}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              data-testid="input-new-password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={profileForm.confirmPassword}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              data-testid="input-confirm-password"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={logout}
                          data-testid="button-logout"
                        >
                          Log Out
                        </Button>
                        <Button type="submit" disabled={isLoading} data-testid="button-save-profile">
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Manage your API keys for accessing BrokenVZN endpoints
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Primary API Key</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={showApiKey ? user.apiKey : user.apiKey.replace(/./g, '*')}
                            readOnly
                            className="font-mono"
                            data-testid="input-api-key"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowApiKey(!showApiKey)}
                            data-testid="button-toggle-api-key"
                          >
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyApiKey}
                            data-testid="button-copy-api-key"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={regenerateApiKey}
                            disabled={isLoading}
                            data-testid="button-regenerate-api-key"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Regenerate Key
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            This will invalidate your current key
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-3">Usage Instructions</h3>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Headers</h4>
                          <div className="bg-muted rounded-lg p-3">
                            <code className="text-sm">X-API-Key: {showApiKey ? user.apiKey : 'your-api-key'}</code>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-sm mb-2">Example Request</h4>
                          <div className="bg-muted rounded-lg p-3">
                            <pre className="text-xs overflow-auto">
{`curl -X GET "https://api.brokenvzn.com/api/status" \\
  -H "X-API-Key: ${showApiKey ? user.apiKey : 'your-api-key'}" \\
  -H "Accept: application/json"`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="usage">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Analytics</CardTitle>
                    <CardDescription>
                      Monitor your API usage and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {user.requestCount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Requests</div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {tierInfo.limit === -1 ? '∞' : (tierInfo.limit - (user.requestCount || 0)).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Remaining</div>
                      </div>
                      <div className="bg-muted rounded-lg p-4">
                        <div className="text-2xl font-bold text-foreground">
                          {Math.round(usagePercentage)}%
                        </div>
                        <div className="text-sm text-muted-foreground">Usage</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Recent Activity</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium text-sm">Account Created</div>
                            <div className="text-xs text-muted-foreground">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                          <Badge variant="secondary">Account</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium text-sm">API Key Generated</div>
                            <div className="text-xs text-muted-foreground">Primary key created</div>
                          </div>
                          <Badge variant="secondary">API</Badge>
                        </div>
                      </div>
                    </div>

                    {user.tier === 'free' && usagePercentage > 80 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-2">Usage Warning</h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          You've used {Math.round(usagePercentage)}% of your monthly quota. 
                          Consider upgrading to Pro for higher limits.
                        </p>
                        <Button size="sm" data-testid="button-upgrade-warning">
                          Upgrade Now
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}