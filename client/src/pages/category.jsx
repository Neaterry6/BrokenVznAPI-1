import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle, XCircle, Loader2, Copy, Info, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ApiTestModal from "@/components/api-test-modal";
// Import the API categories data
import { apiCategories } from "../data/api-categories";
export default function CategoryPage() {
    const [match, params] = useRoute("/category/:categoryId");
    const [testResults, setTestResults] = useState({});
    const [testingEndpoints, setTestingEndpoints] = useState([]);
    const [testInputs, setTestInputs] = useState({});
    const [showFullDetails, setShowFullDetails] = useState({});
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('');
    const { toast } = useToast();
    // Fetch anime background images
    useEffect(() => {
        const fetchAnimeBackground = async () => {
            try {
                const response = await fetch('/api/waifu/enhanced/random?type=sfw');
                const data = await response.json();
                if (data.success && data.data?.url) {
                    setBackgroundImage(data.data.url);
                }
            }
            catch (error) {
                console.error('Failed to fetch anime background:', error);
                try {
                    const fallbackResponse = await fetch('/api/waifu/sfw/waifu');
                    const fallbackData = await fallbackResponse.json();
                    if (fallbackData.success && fallbackData.data?.url) {
                        setBackgroundImage(fallbackData.data.url);
                    }
                }
                catch (fallbackError) {
                    console.error('Fallback anime background also failed:', fallbackError);
                }
            }
        };
        fetchAnimeBackground();
        const interval = setInterval(fetchAnimeBackground, 20000);
        return () => clearInterval(interval);
    }, []);
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Endpoint URL copied to clipboard",
        });
    };
    const toggleFullDetails = (endpointId) => {
        setShowFullDetails(prev => ({
            ...prev,
            [endpointId]: !prev[endpointId]
        }));
    };
    const openTestModal = (endpoint) => {
        setSelectedEndpoint({
            ...endpoint,
            parameters: endpoint.testFields?.map((field) => ({
                name: field.name,
                type: field.type,
                required: field.name === 'query',
                description: field.placeholder
            })) || []
        });
        setModalOpen(true);
    };
    const testEndpoint = async (endpoint) => {
        const endpointId = endpoint.id;
        setTestingEndpoints(prev => [...prev, endpointId]);
        // Clear all test results and only show the current one being tested
        setTestResults({ [endpointId]: null });
        try {
            let response;
            const inputs = testInputs[endpointId] || {};
            if (endpoint.method === 'GET') {
                const queryParams = new URLSearchParams();
                Object.entries(inputs).forEach(([key, value]) => {
                    if (value && key !== 'apiKey')
                        queryParams.append(key, value);
                });
                const url = queryParams.toString() ? `${endpoint.endpoint}?${queryParams}` : endpoint.endpoint;
                response = await fetch(url);
            }
            else {
                const { apiKey: _apiKey, ...bodyData } = inputs;
                response = await fetch(endpoint.endpoint, {
                    method: endpoint.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });
            }
            const result = await response.json();
            setTestResults(prev => ({
                ...prev,
                [endpointId]: { success: response.ok, data: result, status: response.status }
            }));
        }
        catch (error) {
            setTestResults(prev => ({
                ...prev,
                [endpointId]: { success: false, error: error instanceof Error ? error.message : 'Unknown error', status: 'Error' }
            }));
        }
        setTestingEndpoints(prev => prev.filter(id => id !== endpointId));
    };
    const updateTestInput = (endpointId, field, value) => {
        setTestInputs(prev => ({
            ...prev,
            [endpointId]: {
                ...prev[endpointId],
                [field]: value
            }
        }));
    };
    // Find the current category
    const category = apiCategories.find(cat => cat.id === params?.categoryId);
    if (!category) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-foreground mb-4", children: "Category Not Found" }), _jsx(Link, { href: "/docs", children: _jsx(Button, { children: "\u2190 Back to API Explorer" }) })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background relative overflow-hidden", style: backgroundImage ? {
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
        } : {}, children: [backgroundImage && (_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/80 backdrop-blur-[0.5px]" })), _jsxs("div", { className: "container mx-auto px-4 lg:px-8 py-8 relative z-10", children: [_jsxs("div", { className: "mb-8", children: [_jsx(Link, { href: "/docs", children: _jsxs(Button, { variant: "ghost", className: "mb-4 hover:bg-muted/50", children: [_jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }), "Back to API Explorer"] }) }), _jsxs("div", { className: "flex items-center space-x-4 mb-4", children: [_jsx("span", { className: "text-4xl", children: category.icon }), _jsxs("div", { children: [_jsx("h1", { className: "text-3xl md:text-4xl font-bold text-foreground", children: category.title }), _jsx("p", { className: "text-lg text-muted-foreground mt-2", children: category.description }), _jsxs(Badge, { variant: "secondary", className: "mt-2", children: [category.endpoints.length, " APIs Available"] })] })] })] }), _jsx("div", { className: "space-y-6", children: category.endpoints.map((endpoint) => (_jsxs(Card, { className: "border-l-4 border-l-primary backdrop-blur-md bg-card/80", children: [_jsx(CardHeader, { className: "pb-3", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [_jsxs("div", { className: "flex items-start space-x-3 flex-1 min-w-0", children: [_jsx(Badge, { variant: endpoint.method === 'GET' ? 'default' : 'secondary', className: "shrink-0", children: endpoint.method }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx(CardTitle, { className: "text-base sm:text-lg", children: endpoint.title }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: endpoint.description }), _jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [_jsx("code", { className: "text-xs bg-muted px-2 py-1 rounded break-all", children: endpoint.endpoint }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => copyToClipboard(window.location.origin + endpoint.endpoint), className: "h-6 w-6 p-0 shrink-0", title: "Copy URL", children: _jsx(Copy, { className: "h-3 w-3" }) }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => toggleFullDetails(endpoint.id), className: "h-6 px-2 text-xs whitespace-nowrap", children: [_jsx(Info, { className: "h-3 w-3 mr-1" }), "API Details"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => openTestModal(endpoint), className: "h-6 px-2 text-xs whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600/30", children: "\uD83E\uDDEA Advanced Test" })] })] })] })] }), _jsx(Button, { onClick: () => testEndpoint(endpoint), disabled: testingEndpoints.includes(endpoint.id), className: "w-full sm:w-auto shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium", "data-testid": `button-test-${endpoint.id}`, children: testingEndpoints.includes(endpoint.id) ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Testing..."] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "mr-2 h-4 w-4" }), "Test API"] })) })] }) }), showFullDetails[endpoint.id] && (_jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "bg-slate-900 text-gray-100 p-4 rounded-lg space-y-3", children: [_jsx("div", { className: "text-green-400 font-semibold", children: "Full API Details:" }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-400", children: "Method:" }), " ", _jsx("span", { className: "text-white", children: endpoint.method })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-400", children: "Endpoint:" }), " ", _jsx("span", { className: "text-white", children: endpoint.endpoint })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-400", children: "Full URL:" }), " ", _jsx("span", { className: "text-white", children: window.location.origin + endpoint.endpoint })] }), _jsxs("div", { children: [_jsx("span", { className: "text-blue-400", children: "Description:" }), " ", _jsx("span", { className: "text-white", children: endpoint.description })] }), endpoint.testFields && endpoint.testFields.length > 0 && (_jsxs("div", { children: [_jsx("span", { className: "text-blue-400", children: "Parameters:" }), _jsx("div", { className: "ml-2 mt-1", children: endpoint.testFields.map(field => (_jsxs("div", { className: "text-white", children: ["\u2022 ", _jsx("span", { className: "text-yellow-400", children: field.name }), " - ", field.label, " (", field.type, ")"] }, field.name))) })] })), _jsxs("div", { children: [_jsx("span", { className: "text-blue-400", children: "Example cURL:" }), _jsx("div", { className: "bg-slate-800 p-2 rounded mt-1 text-sm font-mono overflow-x-auto", children: endpoint.method === 'GET' ? (`curl -X GET "${window.location.origin + endpoint.endpoint}${endpoint.testFields && endpoint.testFields.length > 0 ? '?' + endpoint.testFields.map(f => `${f.name}=value`).join('&') : ''}"`) : (`curl -X ${endpoint.method} "${window.location.origin + endpoint.endpoint}" \\\n  -H "Content-Type: application/json" ${endpoint.testFields && endpoint.testFields.length > 0 ? `\\\n  -d '${JSON.stringify(Object.fromEntries(endpoint.testFields.map(f => [f.name, f.type === 'number' ? 123 : 'value'])), null, 2)}'` : ''}`) })] })] }) })), (endpoint.testFields && endpoint.testFields.length > 0) && (_jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "bg-muted/30 p-4 rounded-lg space-y-3", children: [_jsx("h4", { className: "font-medium text-sm", children: "Test Parameters:" }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: endpoint.testFields.map((field) => (_jsxs("div", { children: [_jsx(Label, { htmlFor: `${endpoint.id}-${field.name}`, className: "text-xs", children: field.label }), field.type === 'text' && field.name === 'message' ? (_jsx(Textarea, { id: `${endpoint.id}-${field.name}`, placeholder: field.placeholder, value: testInputs[endpoint.id]?.[field.name] || '', onChange: (e) => updateTestInput(endpoint.id, field.name, e.target.value), className: "mt-1" })) : (_jsx(Input, { id: `${endpoint.id}-${field.name}`, type: field.type, placeholder: field.placeholder, value: testInputs[endpoint.id]?.[field.name] || '', onChange: (e) => updateTestInput(endpoint.id, field.name, e.target.value), className: "mt-1" }))] }, field.name))) })] }) })), testResults[endpoint.id] && (_jsx(CardContent, { className: "pt-0", children: _jsxs("div", { className: "mt-4 space-y-4", children: [_jsxs("div", { className: "bg-slate-800/40 rounded-xl p-4 border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-2 h-2 bg-blue-400 rounded-full" }), _jsx("h4", { className: "text-blue-300 text-sm font-semibold uppercase tracking-wider", children: "Request URL" }), _jsx(Badge, { variant: endpoint.method === 'GET' ? 'default' : 'secondary', className: "text-xs", children: endpoint.method })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => copyToClipboard((() => {
                                                                    let url = window.location.origin + endpoint.endpoint;
                                                                    const inputs = testInputs[endpoint.id] || {};
                                                                    // Replace path parameters first (e.g., :category → category value)
                                                                    Object.entries(inputs).forEach(([key, value]) => {
                                                                        if (typeof value === 'string' && value.trim()) {
                                                                            url = url.replace(`:${key}`, encodeURIComponent(value.trim()));
                                                                        }
                                                                    });
                                                                    // Add query parameters for all methods (excluding path params and apiKey)
                                                                    if (Object.keys(inputs).length > 0) {
                                                                        const queryParams = new URLSearchParams();
                                                                        Object.entries(inputs).forEach(([key, value]) => {
                                                                            // Skip if used as path param, is apiKey, or empty
                                                                            if (typeof value === 'string' &&
                                                                                !endpoint.endpoint.includes(`:${key}`) &&
                                                                                key !== 'apiKey' &&
                                                                                value.trim()) {
                                                                                queryParams.append(key, value.trim());
                                                                            }
                                                                        });
                                                                        if (queryParams.toString()) {
                                                                            url += `?${queryParams.toString()}`;
                                                                        }
                                                                    }
                                                                    return url;
                                                                })()), className: "h-6 px-2 text-xs hover:bg-slate-700/70", children: [_jsx(Copy, { className: "h-3 w-3 mr-1" }), "Copy URL"] })] }), _jsx("div", { className: "bg-slate-900/60 rounded-lg p-3 border border-slate-600/40", children: _jsx("code", { className: "text-green-400 text-sm font-mono break-all", children: (() => {
                                                                let url = window.location.origin + endpoint.endpoint;
                                                                const inputs = testInputs[endpoint.id] || {};
                                                                // Replace path parameters first (e.g., :category → category value)
                                                                Object.entries(inputs).forEach(([key, value]) => {
                                                                    if (typeof value === 'string' && value.trim()) {
                                                                        url = url.replace(`:${key}`, encodeURIComponent(value.trim()));
                                                                    }
                                                                });
                                                                // Add query parameters for all methods (excluding path params and apiKey)
                                                                if (Object.keys(inputs).length > 0) {
                                                                    const queryParams = new URLSearchParams();
                                                                    Object.entries(inputs).forEach(([key, value]) => {
                                                                        // Skip if used as path param, is apiKey, or empty
                                                                        if (typeof value === 'string' &&
                                                                            !endpoint.endpoint.includes(`:${key}`) &&
                                                                            key !== 'apiKey' &&
                                                                            value.trim()) {
                                                                            queryParams.append(key, value.trim());
                                                                        }
                                                                    });
                                                                    if (queryParams.toString()) {
                                                                        url += `?${queryParams.toString()}`;
                                                                    }
                                                                }
                                                                return url;
                                                            })() }) })] }), _jsxs("div", { className: "bg-slate-800/40 rounded-xl p-4 border border-slate-600/30", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-2 h-2 bg-purple-400 rounded-full" }), _jsx("h4", { className: "text-purple-300 text-sm font-semibold uppercase tracking-wider", children: "API Response" }), _jsxs("div", { className: "flex items-center space-x-2", children: [testResults[endpoint.id].success ? (_jsx(CheckCircle, { className: "h-4 w-4 text-green-400" })) : (_jsx(XCircle, { className: "h-4 w-4 text-red-400" })), _jsx(Badge, { variant: testResults[endpoint.id].success ? "default" : "destructive", className: `text-xs ${testResults[endpoint.id].success
                                                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'}`, children: testResults[endpoint.id].status })] })] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => {
                                                                    const textToCopy = JSON.stringify(testResults[endpoint.id].data || testResults[endpoint.id].error, null, 2);
                                                                    navigator.clipboard.writeText(textToCopy);
                                                                    toast({
                                                                        title: "Copied!",
                                                                        description: "Response copied to clipboard",
                                                                    });
                                                                }, className: "h-6 px-2 text-xs hover:bg-slate-700/70", children: [_jsx(Copy, { className: "h-3 w-3 mr-1" }), "Copy Response"] })] }), testResults[endpoint.id].data && (() => {
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
                                                            if (typeof obj === 'string') {
                                                                if (isImageUrl(obj))
                                                                    images.push(obj);
                                                                return images;
                                                            }
                                                            if (Array.isArray(obj)) {
                                                                obj.forEach(item => {
                                                                    images.push(...extractImageUrls(item, visited));
                                                                });
                                                                return images;
                                                            }
                                                            if (typeof obj === 'object' && obj !== null) {
                                                                imageProps.forEach(prop => {
                                                                    if (obj[prop] && isImageUrl(obj[prop])) {
                                                                        images.push(obj[prop]);
                                                                    }
                                                                });
                                                                Object.keys(obj).forEach(key => {
                                                                    if (typeof obj[key] === 'object' || Array.isArray(obj[key])) {
                                                                        images.push(...extractImageUrls(obj[key], visited));
                                                                    }
                                                                });
                                                            }
                                                            return Array.from(new Set(images));
                                                        };
                                                        const imageUrls = extractImageUrls(testResults[endpoint.id].data);
                                                        if (imageUrls.length === 0)
                                                            return null;
                                                        return (_jsx("div", { className: "mb-4", children: imageUrls.length === 1 ? (_jsxs("div", { className: "bg-slate-900/70 rounded-xl p-4 border border-slate-600/50 mb-4", children: [_jsxs("h5", { className: "text-slate-300 text-sm font-medium mb-3 flex items-center", children: [_jsx("span", { className: "w-2 h-2 bg-blue-400 rounded-full mr-2" }), "Generated Image"] }), _jsx("img", { src: imageUrls[0], alt: "API Response Image", className: "max-w-full h-auto rounded-lg border border-slate-600/40 shadow-lg cursor-pointer hover:opacity-90 transition-opacity", onError: (e) => {
                                                                            e.currentTarget.style.display = 'none';
                                                                        }, onClick: () => window.open(imageUrls[0], '_blank', 'noopener,noreferrer') }), _jsx("p", { className: "text-xs text-slate-400 mt-2 break-all", children: _jsx("a", { href: imageUrls[0], target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:text-blue-300 underline", children: imageUrls[0] }) })] })) : (_jsxs("div", { className: "bg-slate-900/70 rounded-xl p-4 border border-slate-600/50 mb-4", children: [_jsxs("h5", { className: "text-slate-300 text-sm font-medium mb-3 flex items-center", children: [_jsx("span", { className: "w-2 h-2 bg-purple-400 rounded-full mr-2" }), "Images (", imageUrls.length, ")"] }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3 mb-3", children: imageUrls.slice(0, 6).map((imageUrl, index) => (_jsx("div", { className: "relative group", children: _jsx("img", { src: imageUrl, alt: `API Response Image ${index + 1}`, className: "w-full h-24 object-cover rounded-lg border border-slate-600/40 cursor-pointer hover:opacity-80 transition-all duration-200 group-hover:scale-105 shadow-md", onError: (e) => {
                                                                                    e.currentTarget.style.display = 'none';
                                                                                }, onClick: () => window.open(imageUrl, '_blank', 'noopener,noreferrer') }) }, index))) }), imageUrls.length > 6 && (_jsxs("p", { className: "text-slate-400 text-xs mb-2", children: ["Showing first 6 of ", imageUrls.length, " images"] })), _jsx("div", { className: "space-y-1", children: imageUrls.map((imageUrl, index) => (_jsx("p", { className: "text-xs text-slate-400 break-all", children: _jsx("a", { href: imageUrl, target: "_blank", rel: "noopener noreferrer", className: "text-blue-400 hover:text-blue-300 underline", children: imageUrl }) }, index))) })] })) }));
                                                    })(), _jsx("div", { className: "bg-slate-900/70 rounded-xl border border-slate-600/50 max-h-64 overflow-auto shadow-inner", children: _jsx("pre", { className: "text-green-400 text-sm font-mono p-4 leading-relaxed", children: JSON.stringify(testResults[endpoint.id].data || testResults[endpoint.id].error, null, 2) }) })] })] }) }))] }, endpoint.id))) })] }), _jsx(ApiTestModal, { endpoint: selectedEndpoint, isOpen: modalOpen, onClose: () => setModalOpen(false) })] }));
}
