import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
export default function Navigation() {
    const [location] = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navItems = [
        { href: "/", label: "Home" },
        { href: "/docs", label: "API Playground" },
        { href: "/about", label: "About" },
    ];
    return (_jsx("header", { className: "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", children: _jsxs("div", { className: "container mx-auto px-4 lg:px-8", children: [_jsxs("div", { className: "flex h-16 items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs(Link, { href: "/", className: "flex items-center space-x-3", children: [_jsx("img", { src: "https://files.catbox.moe/ixmjf3.jpg", alt: "BrokenVZN API Logo", className: "h-8 w-8 rounded-lg", "data-testid": "img-logo" }), _jsx("h1", { className: "text-xl font-bold text-foreground", children: "BrokenVZN API" })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "h-2 w-2 rounded-full status-online" }), _jsx("span", { className: "text-sm text-muted-foreground", children: "API Online" })] })] }), _jsxs("nav", { className: "hidden md:flex items-center space-x-6", children: [navItems.map((item) => (_jsx(Link, { href: item.href, className: `text-sm font-medium transition-colors ${location === item.href
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"}`, children: item.label }, item.href))), _jsx(ThemeToggle, {})] }), _jsxs("div", { className: "flex items-center space-x-2 md:hidden", children: [_jsx(ThemeToggle, {}), _jsx("button", { className: "text-muted-foreground hover:text-foreground", onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen), "data-testid": "button-mobile-menu", children: _jsx("i", { className: "fas fa-bars" }) })] })] }), isMobileMenuOpen && (_jsx("div", { className: "md:hidden border-t border-border py-4", children: _jsx("nav", { className: "flex flex-col space-y-4", children: navItems.map((item) => (_jsx(Link, { href: item.href, className: `text-sm font-medium transition-colors ${location === item.href
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"}`, onClick: () => setIsMobileMenuOpen(false), children: item.label }, item.href))) }) }))] }) }));
}
