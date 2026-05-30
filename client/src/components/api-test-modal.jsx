import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, X, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import jsonLang from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
// Register JSON language for syntax highlighting
SyntaxHighlighter.registerLanguage('json', jsonLang);
export default function ApiTestModal({ endpoint, isOpen, onClose }) {
    const [inputs, setInputs] = useState(() => ({ apikey: localStorage.getItem('apiKey') || '' }));
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const { toast } = useToast();
    // Return early if endpoint is null/undefined
    if (!endpoint) {
        return null;
    }
    const updateInput = (key, value) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };
    const buildUrl = () => {
        let url = endpoint.endpoint;
        // Replace path parameters first (e.g., :category → category value)
        Object.entries(inputs).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim()) {
                url = url.replace(`:${key}`, encodeURIComponent(value.trim()));
            }
        });
        // Add query parameters for GET requests (excluding path params and apikey)
        if (endpoint.method === 'GET' && Object.keys(inputs).length > 0) {
            const queryParams = new URLSearchParams();
            Object.entries(inputs).forEach(([key, value]) => {
                // Skip if used as path param, is apikey, or empty
                if (typeof value === 'string' && !endpoint.endpoint.includes(`:${key}`) && key !== 'apikey' && value.trim()) {
                    queryParams.append(key, value);
                }
            });
            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }
        }
        // Return complete URL with domain
        return `${window.location.origin}${url}`;
    };
    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(buildUrl());
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
            toast({
                title: "Copied!",
                description: "URL copied to clipboard",
            });
        }
        catch (err) {
            toast({
                title: "Copy failed",
                description: "Failed to copy URL to clipboard",
                variant: "destructive"
            });
        }
    };
    const copyResponse = async () => {
        if (!result)
            return;
        try {
            const textToCopy = result.isJson
                ? JSON.stringify(result.data, null, 2)
                : String(result.data);
            await navigator.clipboard.writeText(textToCopy);
            toast({
                title: "Copied!",
                description: "Response copied to clipboard",
            });
        }
        catch (err) {
            toast({
                title: "Copy failed",
                description: "Failed to copy response",
                variant: "destructive"
            });
        }
    };
    const testEndpoint = async () => {
        setLoading(true);
        setResult(null);
        try {
            // Check if this is a file upload endpoint
            const hasFileUpload = endpoint.parameters?.some(param => param.type === 'file');
            // Prepare headers
            const headers = {};
            const apiKey = inputs.apikey && typeof inputs.apikey === 'string' ? inputs.apikey.trim() : '';
            if (!apiKey) {
                setResult({
                    status: 401,
                    statusText: 'API key required',
                    data: { success: false, error: 'Sign in with Google at /login to get your API key before testing endpoints.' },
                    isJson: true,
                    responseTime: 0,
                });
                return;
            }
            localStorage.setItem('apiKey', apiKey);
            headers['X-API-Key'] = apiKey;
            let response;
            if (endpoint.method === 'GET') {
                response = await fetch(buildUrl(), {
                    headers: { 'X-API-Key': apiKey }
                });
            }
            else {
                let body;
                if (hasFileUpload) {
                    // Use FormData for file uploads
                    const formData = new FormData();
                    Object.entries(inputs).forEach(([key, value]) => {
                        if (key !== 'apikey' && value) {
                            if (value instanceof File) {
                                formData.append(key, value);
                            }
                            else if (typeof value === 'string') {
                                formData.append(key, value);
                            }
                        }
                    });
                    body = formData;
                    // Don't set Content-Type for FormData - browser will set it with boundary
                }
                else {
                    // Use JSON for regular requests
                    headers['Content-Type'] = 'application/json';
                    const bodyInputs = { ...inputs };
                    // Remove path parameters and apikey from body
                    Object.keys(bodyInputs).forEach(key => {
                        if (endpoint.endpoint.includes(`:${key}`) || key === 'apikey') {
                            delete bodyInputs[key];
                        }
                    });
                    body = JSON.stringify(bodyInputs);
                }
                response = await fetch(buildUrl(), {
                    method: endpoint.method,
                    headers,
                    body
                });
            }
            let data;
            let isJson = false;
            try {
                data = await response.json();
                isJson = true;
            }
            catch {
                data = await response.text();
                isJson = false;
            }
            setResult({
                status: response.status,
                data: data,
                isJson: isJson,
                headers: Object.fromEntries(response.headers.entries())
            });
        }
        catch (error) {
            setResult({
                status: 0,
                ok: false,
                error: error instanceof Error ? error.message : 'Failed to fetch',
                data: null,
                isJson: false
            });
        }
        setLoading(false);
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "kaiz-modal max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-2xl", "data-testid": `modal-test-${endpoint.id}`, children: [_jsx(DialogHeader, { className: "pb-6 border-b border-slate-700/50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center", children: _jsx(Send, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { children: [_jsx(DialogTitle, { className: "text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent", "data-testid": `text-modal-title-${endpoint.id}`, children: endpoint.title }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Test API endpoint with live parameters" })] })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "text-slate-400 hover:text-white hover:bg-slate-700 rounded-full p-2", "data-testid": `button-close-modal-${endpoint.id}`, children: _jsx(X, { className: "h-4 w-4" }) })] }) }), _jsxs("div", { className: "space-y-6 max-h-[70vh] overflow-y-auto", children: [endpoint.parameters && endpoint.parameters.length > 0 && (_jsxs("div", { className: "space-y-4 bg-slate-800/40 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-4", children: [_jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full" }), _jsx("h3", { className: "font-semibold text-blue-300 text-sm uppercase tracking-wider", children: "API Parameters" })] }), _jsx("div", { className: "grid gap-4", children: endpoint.parameters.map((param) => (_jsxs("div", { className: "space-y-3", children: [_jsxs(Label, { htmlFor: param.name, className: "flex items-center space-x-2 text-slate-300", children: [_jsx("span", { className: "font-medium text-white", children: param.name }), param.required && (_jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30", children: "*required" })), _jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-slate-700/50 text-slate-400 border border-slate-600/50 ml-auto", children: param.type })] }), param.type === 'file' ? (_jsx(Input, { id: param.name, type: "file", onChange: (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file)
                                                        updateInput(param.name, file);
                                                }, className: "bg-slate-800/60 border-slate-600/50 focus:border-blue-400 focus:bg-slate-800/80 text-white file:bg-slate-700 file:border-0 file:text-white file:rounded-md file:px-3 file:py-1 file:mr-3 transition-all duration-200 rounded-lg", "data-testid": `input-${param.name}-${endpoint.id}`, accept: param.name === 'audio' ? 'audio/*' : undefined })) : (_jsx(Input, { id: param.name, type: param.type === 'number' ? 'number' : 'text', placeholder: param.description || `Enter ${param.name}...`, value: typeof inputs[param.name] === 'string' ? inputs[param.name] : '', onChange: (e) => updateInput(param.name, e.target.value), className: "bg-slate-800/60 border-slate-600/50 focus:border-blue-400 focus:bg-slate-800/80 text-white placeholder-slate-400 transition-all duration-200 rounded-lg", "data-testid": `input-${param.name}-${endpoint.id}` }))] }, param.name))) })] })), _jsxs("div", { className: "space-y-4 bg-slate-800/40 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-amber-400 rounded-full" }), _jsx(Label, { htmlFor: "apikey", className: "text-amber-300 text-sm uppercase tracking-wider font-semibold", children: "API Authentication" })] }), _jsx(Input, { id: "apikey", type: "password", placeholder: "Sign in at /login, then paste your bvzn_ API key...", value: typeof inputs.apikey === 'string' ? inputs.apikey : '', onChange: (e) => updateInput('apikey', e.target.value), className: "bg-slate-800/60 border-slate-600/50 focus:border-amber-400 focus:bg-slate-800/80 text-white placeholder-slate-400 transition-all duration-200 rounded-lg", "data-testid": `input-apikey-${endpoint.id}` }), _jsx("p", { className: "text-xs text-slate-400", children: "Every API request requires your personal key. Google sign-in creates one automatically." })] }), _jsxs("div", { className: "space-y-4 bg-slate-800/40 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-400 rounded-full" }), _jsx("h3", { className: "text-green-300 text-sm uppercase tracking-wider font-semibold", children: "Request URL" }), _jsx("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono bg-blue-600/20 text-blue-400 border border-blue-500/30", children: endpoint.method })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: copyUrl, className: "h-8 px-3 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all duration-200 rounded-lg", "data-testid": `button-copy-url-${endpoint.id}`, children: [_jsx(Copy, { className: "h-3 w-3 mr-2" }), copySuccess ? 'Copied!' : 'Copy'] })] }), _jsx("div", { className: "bg-slate-900/60 rounded-lg p-4 border border-slate-600/40", "data-testid": `text-url-${endpoint.id}`, children: _jsx("code", { className: "text-green-400 text-sm font-mono break-all leading-relaxed", children: buildUrl() }) })] }), _jsx("div", { className: "flex justify-center pt-4 pb-2", children: _jsx(Button, { onClick: testEndpoint, disabled: loading, className: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 rounded-xl font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 min-w-[180px] text-base border border-blue-500/20", "data-testid": `button-submit-${endpoint.id}`, children: loading ? (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" }), _jsx("span", { className: "text-base", children: "Testing..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "h-5 w-5 mr-3" }), _jsx("span", { className: "text-base", children: "Execute Request" })] })) }) }), result && (_jsxs("div", { className: "space-y-4 bg-slate-800/40 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm flex-shrink-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-2 h-2 bg-purple-400 rounded-full" }), _jsx("h3", { className: "text-purple-300 text-sm uppercase tracking-wider font-semibold", children: "API Response" })] }), _jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [result.status >= 200 && result.status < 300 ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-400" })) : (_jsx(AlertCircle, { className: "h-4 w-4 text-red-400" })), _jsx("span", { className: `inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${result.status >= 200 && result.status < 300
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                : 'bg-red-500/20 text-red-400 border border-red-500/30'}`, children: result.status === 0 ? 'Network Error' : result.status })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: copyResponse, className: "h-9 px-4 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all duration-200 rounded-lg", "data-testid": `button-copy-response-${endpoint.id}`, children: [_jsx(Copy, { className: "h-3 w-3 mr-2" }), "Copy Response"] })] })] }), result.data && (() => {
                                    // Helper function to detect if a URL is likely an image
                                    const isImageUrl = (url) => {
                                        if (!url || typeof url !== 'string')
                                            return false;
                                        return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') ||
                                            url.includes('.gif') || url.includes('.webp') || url.includes('.svg') ||
                                            url.includes('image') || url.startsWith('data:image/');
                                    };
                                    // Helper function to recursively extract all image URLs from response
                                    const extractImageUrls = (obj, visited = new WeakSet()) => {
                                        if (!obj || (typeof obj === 'object' && visited.has(obj)))
                                            return [];
                                        if (typeof obj === 'object')
                                            visited.add(obj);
                                        const images = [];
                                        const imageProps = ['url', 'image', 'image_url', 'thumbnail', 'thumb'];
                                        // Handle string values (direct URL or data URI)
                                        if (typeof obj === 'string') {
                                            if (isImageUrl(obj))
                                                images.push(obj);
                                            return images;
                                        }
                                        // Handle arrays
                                        if (Array.isArray(obj)) {
                                            obj.forEach(item => {
                                                images.push(...extractImageUrls(item, visited));
                                            });
                                            return images;
                                        }
                                        // Handle objects
                                        if (typeof obj === 'object' && obj !== null) {
                                            // Check common image properties
                                            imageProps.forEach(prop => {
                                                if (obj[prop] && isImageUrl(obj[prop])) {
                                                    images.push(obj[prop]);
                                                }
                                            });
                                            // Recursively check nested objects and arrays
                                            Object.keys(obj).forEach(key => {
                                                if (typeof obj[key] === 'object' || Array.isArray(obj[key])) {
                                                    images.push(...extractImageUrls(obj[key], visited));
                                                }
                                            });
                                        }
                                        return Array.from(new Set(images)); // Remove duplicates
                                    };
                                    const imageUrls = extractImageUrls(result.data);
                                    if (imageUrls.length === 0)
                                        return null;
                                    return (_jsx("div", { className: "space-y-4", children: imageUrls.length === 1 ? (_jsxs("div", { className: "bg-slate-900/70 rounded-xl p-4 border border-slate-600/50", children: [_jsxs("h4", { className: "text-slate-300 text-sm font-medium mb-3 flex items-center", children: [_jsx("span", { className: "w-2 h-2 bg-blue-400 rounded-full mr-2" }), "Generated Image"] }), _jsx("img", { src: imageUrls[0], alt: "API Response Image", className: "max-w-full h-auto rounded-lg border border-slate-600/40 shadow-lg cursor-pointer hover:opacity-90 transition-opacity", onError: (e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }, onClick: () => window.open(imageUrls[0], '_blank', 'noopener,noreferrer') })] })) : (_jsxs("div", { className: "bg-slate-900/70 rounded-xl p-4 border border-slate-600/50", children: [_jsxs("h4", { className: "text-slate-300 text-sm font-medium mb-3 flex items-center", children: [_jsx("span", { className: "w-2 h-2 bg-purple-400 rounded-full mr-2" }), "Images (", imageUrls.length, ")"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", children: imageUrls.slice(0, 12).map((imageUrl, index) => (_jsxs("div", { className: "relative group", children: [_jsx("img", { src: imageUrl, alt: `API Response Image ${index + 1}`, className: "w-full h-32 object-cover rounded-lg border border-slate-600/40 cursor-pointer hover:opacity-80 transition-all duration-200 group-hover:scale-105 shadow-md", onError: (e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                }, onClick: () => window.open(imageUrl, '_blank', 'noopener,noreferrer') }), _jsx("div", { className: "absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" })] }, index))) }), imageUrls.length > 12 && (_jsxs("p", { className: "text-slate-400 text-xs mt-2", children: ["Showing first 12 of ", imageUrls.length, " images"] }))] })) }));
                                })(), _jsx("div", { className: "bg-slate-900/70 rounded-xl border border-slate-600/50 max-h-96 overflow-auto shadow-inner", "data-testid": `response-${endpoint.id}`, children: _jsx(SyntaxHighlighter, { language: result.isJson ? "json" : "plaintext", style: atomOneDark, customStyle: {
                                            margin: 0,
                                            padding: '24px',
                                            backgroundColor: 'transparent',
                                            fontSize: '13px',
                                            lineHeight: '1.6',
                                            borderRadius: '12px'
                                        }, showLineNumbers: false, wrapLongLines: true, children: result.isJson ? JSON.stringify(result.data, null, 2) : result.data }) })] }))] })] }) }));
}
