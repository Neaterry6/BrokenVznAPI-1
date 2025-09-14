import { useState } from "react";
import { Button } from "./button";
import { LoadingSpinner } from "./loading-spinner";
import { LoadingOverlay } from "./loading-overlay";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Textarea } from "./textarea";

interface ApiTestLoaderProps {
  endpoint: string;
  method: string;
  description: string;
  samplePayload?: object;
  onTest: (payload?: object) => Promise<any>;
}

export function ApiTestLoader({ 
  endpoint, 
  method, 
  description, 
  samplePayload,
  onTest 
}: ApiTestLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
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
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'POST': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'PUT': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="w-full" data-testid={`api-test-${endpoint.replace(/[^a-zA-Z0-9]/g, '-')}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{endpoint}</CardTitle>
          <Badge className={`border ${getMethodColor(method)}`}>
            {method.toUpperCase()}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <LoadingOverlay 
        isLoading={isLoading} 
        message="Testing API endpoint..."
        variant="pulse"
        size="lg"
      >
        <CardContent className="space-y-4">
          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <div>
              <label className="text-sm font-medium mb-2 block">Request Body (JSON)</label>
              <Textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Enter JSON payload..."
                className="font-mono text-sm"
                rows={6}
                data-testid="input-api-payload"
              />
            </div>
          )}

          <Button 
            onClick={handleTest} 
            disabled={isLoading}
            className="w-full"
            data-testid="button-test-api"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner variant="dots" size="sm" />
                Testing API...
              </div>
            ) : (
              `Test ${method.toUpperCase()} ${endpoint}`
            )}
          </Button>

          {/* Response Section */}
          {(response || error) && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Response:</h4>
              <div className="bg-muted border border-border rounded-lg p-4 max-h-96 overflow-auto">
                {error ? (
                  <pre className="text-red-400 text-sm font-mono" data-testid="api-error">
                    {error}
                  </pre>
                ) : (
                  <pre className="text-sm font-mono" data-testid="api-response">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </LoadingOverlay>
    </Card>
  );
}