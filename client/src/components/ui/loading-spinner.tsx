import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      variant: {
        default: "border-2 border-current border-t-transparent rounded-full",
        dots: "flex space-x-1",
        pulse: "rounded-full bg-current animate-pulse",
        bars: "flex space-x-1",
      },
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6", 
        lg: "h-8 w-8",
        xl: "h-12 w-12"
      },
      speed: {
        slow: "animate-spin-slow",
        normal: "animate-spin",
        fast: "animate-spin-fast"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      speed: "normal"
    },
  }
);

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  "data-testid"?: string;
}

export function LoadingSpinner({ 
  variant, 
  size, 
  speed, 
  className,
  "data-testid": testId,
  ...props 
}: LoadingSpinnerProps) {
  if (variant === "dots") {
    return (
      <div 
        className={cn("flex space-x-1", className)} 
        data-testid={testId}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-current rounded-full animate-bounce",
              size === "sm" && "h-1 w-1",
              size === "md" && "h-1.5 w-1.5", 
              size === "lg" && "h-2 w-2",
              size === "xl" && "h-3 w-3"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: speed === "slow" ? "1.5s" : speed === "fast" ? "0.5s" : "1s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div 
        className={cn("flex space-x-1 items-end", className)}
        data-testid={testId}
        {...props}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-current animate-pulse",
              size === "sm" && "w-0.5 h-2",
              size === "md" && "w-1 h-3",
              size === "lg" && "w-1 h-4", 
              size === "xl" && "w-1.5 h-6"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: speed === "slow" ? "1.8s" : speed === "fast" ? "0.6s" : "1.2s"
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          spinnerVariants({ size, speed: "normal" }),
          "rounded-full bg-current",
          speed === "slow" && "animate-pulse-slow",
          speed === "fast" && "animate-pulse-fast",
          className
        )}
        data-testid={testId}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(spinnerVariants({ variant, size, speed }), className)}
      data-testid={testId}
      {...props}
    />
  );
}