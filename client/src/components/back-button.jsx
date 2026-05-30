import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
export function BackButton({ href = "/", onClick, label = "Back" }) {
    if (onClick) {
        return (_jsxs(Button, { variant: "ghost", size: "sm", onClick: onClick, className: "mb-6 hover:bg-muted", "data-testid": "button-back", children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), label] }));
    }
    return (_jsx(Button, { variant: "ghost", size: "sm", asChild: true, className: "mb-6 hover:bg-muted", "data-testid": "button-back", children: _jsxs(Link, { href: href, children: [_jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }), label] }) }));
}
