import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
export default function ApiEndpointCard({ method, title, description, endpoint, status, features, onTryIt }) {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const methodClass = {
        GET: "method-get",
        POST: "method-post",
        PUT: "method-put",
        DELETE: "method-delete"
    }[method];
    const statusClass = {
        online: "status-online",
        offline: "status-offline",
        maintenance: "status-maintenance"
    }[status];
    return (_jsxs("div", { className: "endpoint-card bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all", "data-testid": `endpoint-card-${title.toLowerCase().replace(/\s+/g, '-')}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: `${methodClass} px-3 py-1 rounded-full text-xs font-medium border`, "data-testid": `method-${method.toLowerCase()}`, children: method }), _jsx("h3", { className: "text-lg font-semibold text-foreground", "data-testid": `text-title-${title.toLowerCase().replace(/\s+/g, '-')}`, children: title })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: `h-2 w-2 rounded-full ${statusClass}`, "data-testid": `status-${status}` }), _jsx("span", { className: "text-xs text-muted-foreground capitalize", "data-testid": `text-status-${status}`, children: status })] })] }), _jsx("p", { className: "text-muted-foreground mb-4", "data-testid": `text-description-${title.toLowerCase().replace(/\s+/g, '-')}`, children: description }), _jsx("div", { className: "code-block rounded-lg p-4 mb-4", children: _jsxs("code", { className: "font-mono text-sm text-gray-100", "data-testid": `code-endpoint-${title.toLowerCase().replace(/\s+/g, '-')}`, children: [_jsx("span", { className: method === "GET" ? "text-blue-400" : "text-orange-400", children: method }), " ", _jsx("span", { className: "text-green-400", children: endpoint })] }) }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center space-x-4 text-sm text-muted-foreground", children: features.map((feature, index) => (_jsxs("span", { "data-testid": `feature-${index}`, children: [_jsx("i", { className: "fas fa-check mr-1" }), feature] }, index))) }), _jsx(Button, { onClick: async () => {
                            if (!onTryIt)
                                return;
                            setIsTesting(true);
                            setTestResult(null);
                            try {
                                const result = await onTryIt();
                                setTestResult(result);
                            }
                            catch (error) {
                                setTestResult({ error: error.message });
                            }
                            finally {
                                setIsTesting(false);
                            }
                        }, disabled: isTesting, className: "bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors", "data-testid": `button-try-${title.toLowerCase().replace(/\s+/g, '-')}`, children: isTesting ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(LoadingSpinner, { variant: "dots", size: "sm" }), "Testing..."] })) : "Try It" })] }), testResult && (_jsxs("div", { className: "mt-4 p-3 bg-muted border border-border rounded-lg", children: [_jsx("div", { className: "text-xs font-medium text-muted-foreground mb-1", children: "Test Result:" }), _jsx("pre", { className: "text-xs font-mono max-h-32 overflow-auto", "data-testid": "api-test-result", children: JSON.stringify(testResult, null, 2) })] }))] }));
}
