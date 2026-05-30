import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LoadingSpinner } from "./loading-spinner";
import { cn } from "@/lib/utils";
export function LoadingOverlay({ isLoading, message = "Loading...", variant = "default", size = "lg", className, overlayClassName, children, "data-testid": testId, }) {
    return (_jsxs("div", { className: cn("relative", className), "data-testid": testId, children: [children, isLoading && (_jsxs("div", { className: cn("absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-50", overlayClassName), children: [_jsx(LoadingSpinner, { variant: variant, size: size, className: "text-primary", "data-testid": "loading-spinner" }), message && (_jsx("p", { className: "mt-3 text-sm text-muted-foreground font-medium", "data-testid": "loading-message", children: message }))] }))] }));
}
