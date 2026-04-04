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
import CategoryPage from "@/pages/category";
import Docs from "@/pages/docs";
import Landing from "@/pages/landing";
import About from "@/pages/about";
import Admin from "@/pages/admin";
import AdminEnhanced from "@/pages/admin-enhanced";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/docs" component={Home} />
      <Route path="/category/:categoryId" component={CategoryPage} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={AdminEnhanced} />
      <Route path="/admin-basic" component={Admin} />
      <Route path="/admin-enhanced" component={AdminEnhanced} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="brokenvzn-ui-theme">
      <QueryClientProvider client={queryClient}>
        <ApiLoadingProvider showGlobalOverlay={false}>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-1">
                <Router />
              </main>
              <Footer />
            </div>
          </TooltipProvider>
        </ApiLoadingProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
