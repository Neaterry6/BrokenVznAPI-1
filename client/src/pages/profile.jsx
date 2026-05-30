import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export default function Profile() {
    const [, setLocation] = useLocation();
    const [user, setUser] = useState(null);
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
    const getTierInfo = (tier) => {
        switch (tier) {
            case 'free':
                return {
                    name: 'Free',
                    limit: 1000,
                    color: 'secondary',
                    features: ['1,000 requests/month', 'Basic endpoints', 'Community support']
                };
            case 'pro':
                return {
                    name: 'Pro',
                    limit: 100000,
                    color: 'default',
                    features: ['100,000 requests/month', 'All endpoints', 'Priority support', 'Analytics dashboard']
                };
            case 'enterprise':
                return {
                    name: 'Enterprise',
                    limit: -1,
                    color: 'destructive',
                    features: ['Unlimited requests', 'Custom endpoints', '24/7 support', 'SLA guarantee']
                };
            default:
                return {
                    name: 'Unknown',
                    limit: 0,
                    color: 'secondary',
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
            const updatedUser = { ...user, apiKey: newApiKey };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            localStorage.setItem('apiKey', newApiKey);
            toast({
                title: "API Key Regenerated",
                description: "Your new API key is ready to use",
            });
        }
        catch (error) {
            toast({
                title: "Error",
                description: "Failed to regenerate API key",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const updateProfile = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Simulate profile update
            const updatedUser = {
                ...user,
                username: profileForm.username,
                email: profileForm.email
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast({
                title: "Profile Updated",
                description: "Your profile has been updated successfully",
            });
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: "Failed to update profile",
                variant: "destructive",
            });
        }
        finally {
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
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading profile..." })] }) }));
    }
    const tierInfo = getTierInfo(user.tier);
    const usagePercentage = user.requestCount && tierInfo.limit > 0
        ? Math.min((user.requestCount / tierInfo.limit) * 100, 100)
        : 0;
    return (_jsx("div", { className: "min-h-screen bg-background p-6", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-foreground mb-2", "data-testid": "heading-profile", children: "Profile Settings" }), _jsx("p", { className: "text-muted-foreground", children: "Manage your account, API keys, and subscription" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center", children: _jsx(User, { className: "h-6 w-6 text-primary" }) }), _jsxs("div", { children: [_jsx(CardTitle, { children: user.username }), _jsx(CardDescription, { children: user.email })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Current Plan" }), _jsx(Badge, { variant: tierInfo.color, children: tierInfo.name })] }), _jsx("div", { className: "text-xs text-muted-foreground", children: tierInfo.limit === -1 ? 'Unlimited requests' : `${tierInfo.limit.toLocaleString()} requests/month` })] }), tierInfo.limit > 0 && (_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Usage" }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [user.requestCount || 0, " / ", tierInfo.limit.toLocaleString()] })] }), _jsx(Progress, { value: usagePercentage, className: "h-2" })] })), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-sm font-medium", children: "Plan Features" }), _jsx("ul", { className: "text-xs text-muted-foreground space-y-1", children: tierInfo.features.map((feature, index) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx("div", { className: "h-1 w-1 rounded-full bg-primary" }), feature] }, index))) })] }), user.tier === 'free' && (_jsxs(Button, { className: "w-full", "data-testid": "button-upgrade", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Upgrade Plan"] }))] })] }) }), _jsx("div", { className: "lg:col-span-2", children: _jsxs(Tabs, { defaultValue: "account", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsxs(TabsTrigger, { value: "account", "data-testid": "tab-account", children: [_jsx(Settings, { className: "h-4 w-4 mr-2" }), "Account"] }), _jsxs(TabsTrigger, { value: "api", "data-testid": "tab-api", children: [_jsx(Key, { className: "h-4 w-4 mr-2" }), "API Keys"] }), _jsxs(TabsTrigger, { value: "usage", "data-testid": "tab-usage", children: [_jsx(TrendingUp, { className: "h-4 w-4 mr-2" }), "Usage"] })] }), _jsx(TabsContent, { value: "account", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Account Information" }), _jsx(CardDescription, { children: "Update your account settings and personal information" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: updateProfile, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsx(Input, { id: "username", value: profileForm.username, onChange: (e) => setProfileForm(prev => ({ ...prev, username: e.target.value })), "data-testid": "input-username" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: profileForm.email, onChange: (e) => setProfileForm(prev => ({ ...prev, email: e.target.value })), "data-testid": "input-email" })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-medium", children: "Change Password" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "current-password", children: "Current Password" }), _jsx(Input, { id: "current-password", type: "password", value: profileForm.currentPassword, onChange: (e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value })), "data-testid": "input-current-password" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "new-password", children: "New Password" }), _jsx(Input, { id: "new-password", type: "password", value: profileForm.newPassword, onChange: (e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value })), "data-testid": "input-new-password" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "confirm-password", children: "Confirm Password" }), _jsx(Input, { id: "confirm-password", type: "password", value: profileForm.confirmPassword, onChange: (e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value })), "data-testid": "input-confirm-password" })] })] })] }), _jsxs("div", { className: "flex justify-between pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: logout, "data-testid": "button-logout", children: "Log Out" }), _jsx(Button, { type: "submit", disabled: isLoading, "data-testid": "button-save-profile", children: isLoading ? "Saving..." : "Save Changes" })] })] }) })] }) }), _jsx(TabsContent, { value: "api", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "API Keys" }), _jsx(CardDescription, { children: "Manage your API keys for accessing BrokenVZN endpoints" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Primary API Key" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: showApiKey ? user.apiKey : user.apiKey.replace(/./g, '*'), readOnly: true, className: "font-mono", "data-testid": "input-api-key" }), _jsx(Button, { variant: "outline", size: "icon", onClick: () => setShowApiKey(!showApiKey), "data-testid": "button-toggle-api-key", children: showApiKey ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "icon", onClick: copyApiKey, "data-testid": "button-copy-api-key", children: _jsx(Copy, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", onClick: regenerateApiKey, disabled: isLoading, "data-testid": "button-regenerate-api-key", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Regenerate Key"] }), _jsx("span", { className: "text-sm text-muted-foreground", children: "This will invalidate your current key" })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Usage Instructions" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Headers" }), _jsx("div", { className: "bg-muted rounded-lg p-3", children: _jsxs("code", { className: "text-sm", children: ["X-API-Key: ", showApiKey ? user.apiKey : 'your-api-key'] }) })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: "Example Request" }), _jsx("div", { className: "bg-muted rounded-lg p-3", children: _jsx("pre", { className: "text-xs overflow-auto", children: `curl -X GET "https://api.brokenvzn.com/api/status" \\
  -H "X-API-Key: ${showApiKey ? user.apiKey : 'your-api-key'}" \\
  -H "Accept: application/json"` }) })] })] })] })] })] }) }), _jsx(TabsContent, { value: "usage", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Usage Analytics" }), _jsx(CardDescription, { children: "Monitor your API usage and performance metrics" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-muted rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: user.requestCount || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Requests" })] }), _jsxs("div", { className: "bg-muted rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-foreground", children: tierInfo.limit === -1 ? '∞' : (tierInfo.limit - (user.requestCount || 0)).toLocaleString() }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Remaining" })] }), _jsxs("div", { className: "bg-muted rounded-lg p-4", children: [_jsxs("div", { className: "text-2xl font-bold text-foreground", children: [Math.round(usagePercentage), "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Usage" })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium mb-3", children: "Recent Activity" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: "Account Created" }), _jsx("div", { className: "text-xs text-muted-foreground", children: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently' })] }), _jsx(Badge, { variant: "secondary", children: "Account" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-muted rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: "API Key Generated" }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Primary key created" })] }), _jsx(Badge, { variant: "secondary", children: "API" })] })] })] }), user.tier === 'free' && usagePercentage > 80 && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-yellow-800 mb-2", children: "Usage Warning" }), _jsxs("p", { className: "text-sm text-yellow-700 mb-3", children: ["You've used ", Math.round(usagePercentage), "% of your monthly quota. Consider upgrading to Pro for higher limits."] }), _jsx(Button, { size: "sm", "data-testid": "button-upgrade-warning", children: "Upgrade Now" })] }))] })] }) })] }) })] })] }) }));
}
