import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiLoadingProvider } from "@/components/ui/api-request-loader";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import Docs from "@/pages/docs";
import Login from "@/pages/login";
import CategoryPage from "@/pages/category";
import Landing from "@/pages/landing";
import About from "@/pages/about";
import Admin from "@/pages/admin";
import AdminEnhanced from "@/pages/admin-enhanced";
import NotFound from "@/pages/not-found";
function Router() {
    return (_jsxs(Switch, { children: [_jsx(Route, { path: "/", component: Landing }), _jsx(Route, { path: "/docs", component: Docs }), _jsx(Route, { path: "/home", component: Home }), _jsx(Route, { path: "/login", component: Login }), _jsx(Route, { path: "/category/:categoryId", component: CategoryPage }), _jsx(Route, { path: "/about", component: About }), _jsx(Route, { path: "/admin", component: AdminEnhanced }), _jsx(Route, { path: "/admin-basic", component: Admin }), _jsx(Route, { path: "/admin-enhanced", component: AdminEnhanced }), _jsx(Route, { component: NotFound })] }));
}
function App() {
    return (_jsx(ThemeProvider, { defaultTheme: "dark", storageKey: "brokenvzn-ui-theme", children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(ApiLoadingProvider, { showGlobalOverlay: false, children: _jsxs(TooltipProvider, { children: [_jsx(Toaster, {}), _jsxs("div", { className: "min-h-screen flex flex-col", children: [_jsx(Navigation, {}), _jsx("main", { className: "flex-1", children: _jsx(Router, {}) }), _jsx(Footer, {})] })] }) }) }) }));
}
export default App;
