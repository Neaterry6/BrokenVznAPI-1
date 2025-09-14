import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ApiEndpointCardProps {
  method: "GET" | "POST" | "PUT" | "DELETE";
  title: string;
  description: string;
  endpoint: string;
  status: "online" | "offline" | "maintenance";
  features: string[];
  onTryIt?: () => Promise<any> | void;
}

export default function ApiEndpointCard({
  method,
  title,
  description,
  endpoint,
  status,
  features,
  onTryIt
}: ApiEndpointCardProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
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

  return (
    <div className="endpoint-card bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all" data-testid={`endpoint-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className={`${methodClass} px-3 py-1 rounded-full text-xs font-medium border`} data-testid={`method-${method.toLowerCase()}`}>
            {method}
          </span>
          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-title-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {title}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${statusClass}`} data-testid={`status-${status}`}></div>
          <span className="text-xs text-muted-foreground capitalize" data-testid={`text-status-${status}`}>
            {status}
          </span>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-4" data-testid={`text-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        {description}
      </p>
      
      <div className="code-block rounded-lg p-4 mb-4">
        <code className="font-mono text-sm text-gray-100" data-testid={`code-endpoint-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <span className={method === "GET" ? "text-blue-400" : "text-orange-400"}>{method}</span>{" "}
          <span className="text-green-400">{endpoint}</span>
        </code>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <span key={index} data-testid={`feature-${index}`}>
              <i className="fas fa-check mr-1"></i>
              {feature}
            </span>
          ))}
        </div>
        <Button 
          onClick={async () => {
            if (!onTryIt) return;
            setIsTesting(true);
            setTestResult(null);
            try {
              const result = await onTryIt();
              setTestResult(result);
            } catch (error: any) {
              setTestResult({ error: error.message });
            } finally {
              setIsTesting(false);
            }
          }}
          disabled={isTesting}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          data-testid={`button-try-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {isTesting ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner variant="dots" size="sm" />
              Testing...
            </div>
          ) : "Try It"}
        </Button>
      </div>
      
      {/* Test Result */}
      {testResult && (
        <div className="mt-4 p-3 bg-muted border border-border rounded-lg">
          <div className="text-xs font-medium text-muted-foreground mb-1">Test Result:</div>
          <pre className="text-xs font-mono max-h-32 overflow-auto" data-testid="api-test-result">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
