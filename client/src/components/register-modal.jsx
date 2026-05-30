import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
export default function RegisterModal({ isOpen, onClose }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [apiKey, setApiKey] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const registerMutation = useMutation({
        mutationFn: async (data) => {
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
            }
            else {
                toast({
                    title: "Registration Failed",
                    description: data.error || "Failed to create account",
                    variant: "destructive",
                });
            }
        },
        onError: (error) => {
            toast({
                title: "Registration Failed",
                description: error.message || "An error occurred during registration",
                variant: "destructive",
            });
        },
    });
    const handleSubmit = (e) => {
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
    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast({
                title: "Copied!",
                description: "API key copied to clipboard",
            });
        }
        catch (err) {
            toast({
                title: "Copy Failed",
                description: "Failed to copy to clipboard",
                variant: "destructive",
            });
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", "data-testid": "register-modal", children: _jsxs(Card, { className: "w-full max-w-md mx-auto", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { "data-testid": "modal-title", children: apiKey ? "Account Created!" : "Create Your Account" }), _jsx(CardDescription, { "data-testid": "modal-description", children: apiKey
                                ? "Your account has been created successfully. Save your API key below."
                                : "Get started with BrokenVZN API by creating your free account." })] }), _jsx(CardContent, { children: apiKey ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-muted rounded-lg", children: [_jsx(Label, { className: "text-sm font-medium text-muted-foreground", children: "Your API Key" }), _jsxs("div", { className: "flex items-center space-x-2 mt-2", children: [_jsx("code", { className: "flex-1 p-2 bg-background border rounded text-sm font-mono break-all", "data-testid": "api-key-display", children: apiKey }), _jsx(Button, { size: "sm", onClick: () => copyToClipboard(apiKey), "data-testid": "button-copy-api-key", children: "Copy" })] })] }), _jsxs("div", { className: "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("i", { className: "fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400" }), _jsx("span", { className: "text-sm font-medium text-yellow-800 dark:text-yellow-200", children: "Important" })] }), _jsx("p", { className: "text-sm text-yellow-700 dark:text-yellow-300 mt-1", children: "Save this API key securely. You'll need it to access the API endpoints." })] }), _jsx(Button, { onClick: handleClose, className: "w-full", "data-testid": "button-close-modal", children: "Got it!" })] })) : (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "username", "data-testid": "label-username", children: "Username" }), _jsx(Input, { id: "username", type: "text", value: username, onChange: (e) => setUsername(e.target.value), placeholder: "Enter your username", required: true, "data-testid": "input-username" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "password", "data-testid": "label-password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Enter your password", required: true, "data-testid": "input-password" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "confirmPassword", "data-testid": "label-confirm-password", children: "Confirm Password" }), _jsx(Input, { id: "confirmPassword", type: "password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), placeholder: "Confirm your password", required: true, "data-testid": "input-confirm-password" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, className: "flex-1", "data-testid": "button-cancel", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: registerMutation.isPending, className: "flex-1", "data-testid": "button-submit-register", children: registerMutation.isPending ? "Creating..." : "Create Account" })] })] })) })] }) }));
}
