import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LoadingOverlay } from "./loading-overlay";

interface ApiRequest {
  id: string;
  url: string;
  method: string;
  startTime: number;
}

interface ApiLoadingContextType {
  activeRequests: ApiRequest[];
  startRequest: (id: string, url: string, method: string) => void;
  endRequest: (id: string) => void;
  isLoading: boolean;
  requestCount: number;
}

const ApiLoadingContext = createContext<ApiLoadingContextType | undefined>(undefined);

export function useApiLoading() {
  const context = useContext(ApiLoadingContext);
  if (!context) {
    throw new Error("useApiLoading must be used within an ApiLoadingProvider");
  }
  return context;
}

interface ApiLoadingProviderProps {
  children: ReactNode;
  showGlobalOverlay?: boolean;
  overlayMessage?: string;
}

export function ApiLoadingProvider({ 
  children, 
  showGlobalOverlay = false, 
  overlayMessage = "Loading..." 
}: ApiLoadingProviderProps) {
  const [activeRequests, setActiveRequests] = useState<ApiRequest[]>([]);

  const startRequest = (id: string, url: string, method: string) => {
    setActiveRequests(prev => [
      ...prev,
      { id, url, method, startTime: Date.now() }
    ]);
  };

  const endRequest = (id: string) => {
    setActiveRequests(prev => prev.filter(req => req.id !== id));
  };

  const isLoading = activeRequests.length > 0;
  const requestCount = activeRequests.length;

  return (
    <ApiLoadingContext.Provider
      value={{
        activeRequests,
        startRequest,
        endRequest,
        isLoading,
        requestCount,
      }}
    >
      {showGlobalOverlay ? (
        <LoadingOverlay
          isLoading={isLoading}
          message={requestCount > 1 ? `${overlayMessage} (${requestCount} requests)` : overlayMessage}
          variant="dots"
          size="lg"
          data-testid="global-loading-overlay"
        >
          {children}
        </LoadingOverlay>
      ) : (
        children
      )}
    </ApiLoadingContext.Provider>
  );
}

// Hook to automatically track API requests
export function useApiRequest() {
  const { startRequest, endRequest } = useApiLoading();

  const executeRequest = async <T,>(
    requestFn: () => Promise<T>,
    options?: {
      id?: string;
      url?: string;
      method?: string;
    }
  ): Promise<T> => {
    const id = options?.id || Math.random().toString(36).substring(7);
    const url = options?.url || "unknown";
    const method = options?.method || "GET";

    try {
      startRequest(id, url, method);
      const result = await requestFn();
      return result;
    } finally {
      endRequest(id);
    }
  };

  return { executeRequest };
}