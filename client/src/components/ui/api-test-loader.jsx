import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { LoadingOverlay } from "./loading-overlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Textarea } from "./textarea";
export function ApiTestLoader({ endpoint, method, description, samplePayload, onTest }) {
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [payload, setPayload] = useState(samplePayload ? JSON.stringify(samplePayload, null, 2) : '');
    const handleTest = async () => {
        setIsLoading(true);
        setError(null);
        setResponse(null);
        try {
            let parsedPayload = undefined;
            if (payload.trim() && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                parsedPayload = JSON.parse(payload);
            }
            const result = await onTest(parsedPayload);
            setResponse(result);
        }
        catch (err) {
            setError(err.message || 'An error occurred');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getMethodColor = (method) => {
        switch (method.toUpperCase()) {
            case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'PUT': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };
    return (_jsxs(Card, { className: "w-full", "data-testid": `api-test-${endpoint.replace(/[^a-zA-Z0-9]/g, '-')}`, children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { className: "text-lg", children: endpoint }), _jsx(Badge, { className: `border ${getMethodColor(method)}`, children: method.toUpperCase() })] }), _jsx(CardDescription, { children: description })] }), _jsx(LoadingOverlay, { isLoading: isLoading, message: "Testing API endpoint...", variant: "pulse", size: "lg", children: _jsxs(CardContent, { className: "space-y-4", children: [(method === 'POST' || method === 'PUT' || method === 'PATCH') && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Request Body (JSON)" }), _jsx(Textarea, { value: payload, onChange: (e) => setPayload(e.target.value), placeholder: "Enter JSON payload...", className: "font-mono text-sm", rows: 6, "data-testid": "input-api-payload" })] })), _jsx(Button, { onClick: handleTest, disabled: isLoading, className: "w-full", "data-testid": "button-test-api", children: isLoading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LoadingSpinner, { variant: "dots", size: "sm" }), "Testing API..."] })) : (`Test ${method.toUpperCase()} ${endpoint}`) }), (response || error) && (_jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-sm font-medium mb-2", children: "Response:" }), _jsx("div", { className: "bg-muted border border-border rounded-lg p-4 max-h-96 overflow-auto", children: error ? (_jsx("pre", { className: "text-red-400 text-sm font-mono", "data-testid": "api-error", children: error })) : (_jsx("pre", { className: "text-sm font-mono", "data-testid": "api-response", children: JSON.stringify(response, null, 2) })) })] }))] }) })] }));
}
