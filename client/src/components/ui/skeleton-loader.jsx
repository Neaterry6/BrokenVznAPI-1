import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
export function Skeleton({ className, "data-testid": testId, ...props }) {
    return (_jsx("div", { className: cn("animate-pulse rounded-md bg-muted", className), "data-testid": testId, ...props }));
}
// Preset skeleton components for common use cases
export function SkeletonText({ lines = 3, className }) {
    return (_jsx("div", { className: cn("space-y-2", className), "data-testid": "skeleton-text", children: Array.from({ length: lines }).map((_, i) => (_jsx(Skeleton, { className: cn("h-4", i === lines - 1 ? "w-3/4" : "w-full") }, i))) }));
}
export function SkeletonCard({ className }) {
    return (_jsxs("div", { className: cn("space-y-3", className), "data-testid": "skeleton-card", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-4 w-1/2" }), _jsx(Skeleton, { className: "h-24 w-full" })] }));
}
export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (_jsxs("div", { className: "space-y-3", "data-testid": "skeleton-table", children: [_jsx("div", { className: "flex space-x-4", children: Array.from({ length: cols }).map((_, i) => (_jsx(Skeleton, { className: "h-4 flex-1" }, `header-${i}`))) }), Array.from({ length: rows }).map((_, rowIndex) => (_jsx("div", { className: "flex space-x-4", children: Array.from({ length: cols }).map((_, colIndex) => (_jsx(Skeleton, { className: cn("h-4 flex-1", colIndex === 0 && "w-1/4", colIndex === cols - 1 && "w-1/6") }, `cell-${rowIndex}-${colIndex}`))) }, `row-${rowIndex}`)))] }));
}
