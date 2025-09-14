import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegisterData {
  username: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    username: string;
    apiKey: string;
    tier: string;
  };
  error?: string;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<RegisterResponse> => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setApiKey(data.user.apiKey);
        toast({
          title: "Account Created Successfully!",
          description: `Welcome ${data.user.username}! Your API key has been generated.`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      } else {
        toast({
          title: "Registration Failed",
          description: data.error || "Failed to create account",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required",
        variant: "destructive",
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Validation Error",
        description: "Username must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Validation Error",
        description: "Password is required",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({ username: username.trim(), password });
  };

  const handleClose = () => {
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setApiKey("");
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="register-modal">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle data-testid="modal-title">
            {apiKey ? "Account Created!" : "Create Your Account"}
          </CardTitle>
          <CardDescription data-testid="modal-description">
            {apiKey 
              ? "Your account has been created successfully. Save your API key below." 
              : "Get started with BrokenVZN API by creating your free account."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium text-muted-foreground">Your API Key</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <code className="flex-1 p-2 bg-background border rounded text-sm font-mono break-all" data-testid="api-key-display">
                    {apiKey}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(apiKey)}
                    data-testid="button-copy-api-key"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400"></i>
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Save this API key securely. You'll need it to access the API endpoints.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full" data-testid="button-close-modal">
                Got it!
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username" data-testid="label-username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  data-testid="input-username"
                />
              </div>
              <div>
                <Label htmlFor="password" data-testid="label-password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  data-testid="input-password"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" data-testid="label-confirm-password">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="flex-1"
                  data-testid="button-submit-register"
                >
                  {registerMutation.isPending ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}