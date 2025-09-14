import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  variant?: "default" | "dots" | "pulse" | "bars";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  overlayClassName?: string;
  children?: React.ReactNode;
  "data-testid"?: string;
}

export function LoadingOverlay({
  isLoading,
  message = "Loading...",
  variant = "default", 
  size = "lg",
  className,
  overlayClassName,
  children,
  "data-testid": testId,
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)} data-testid={testId}>
      {children}
      {isLoading && (
        <div className={cn(
          "absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50",
          overlayClassName
        )}>
          <LoadingSpinner 
            variant={variant} 
            size={size}
            className="text-primary"
            data-testid="loading-spinner"
          />
          {message && (
            <p className="mt-3 text-sm text-muted-foreground font-medium" data-testid="loading-message">
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}