import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from "react";
import { LoadingOverlay } from "./loading-overlay";
const ApiLoadingContext = createContext(undefined);
export function useApiLoading() {
    const context = useContext(ApiLoadingContext);
    if (!context) {
        throw new Error("useApiLoading must be used within an ApiLoadingProvider");
    }
    return context;
}
export function ApiLoadingProvider({ children, showGlobalOverlay = false, overlayMessage = "Loading..." }) {
    const [activeRequests, setActiveRequests] = useState([]);
    const startRequest = (id, url, method) => {
        setActiveRequests(prev => [
            ...prev,
            { id, url, method, startTime: Date.now() }
        ]);
    };
    const endRequest = (id) => {
        setActiveRequests(prev => prev.filter(req => req.id !== id));
    };
    const isLoading = activeRequests.length > 0;
    const requestCount = activeRequests.length;
    return (_jsx(ApiLoadingContext.Provider, { value: {
            activeRequests,
            startRequest,
            endRequest,
            isLoading,
            requestCount,
        }, children: showGlobalOverlay ? (_jsx(LoadingOverlay, { isLoading: isLoading, message: requestCount > 1 ? `${overlayMessage} (${requestCount} requests)` : overlayMessage, variant: "dots", size: "lg", "data-testid": "global-loading-overlay", children: children })) : (children) }));
}
// Hook to automatically track API requests
export function useApiRequest() {
    const { startRequest, endRequest } = useApiLoading();
    const executeRequest = async (requestFn, options) => {
        const id = options?.id || Math.random().toString(36).substring(7);
        const url = options?.url || "unknown";
        const method = options?.method || "GET";
        try {
            startRequest(id, url, method);
            const result = await requestFn();
            return result;
        }
        finally {
            endRequest(id);
        }
    };
    return { executeRequest };
}
