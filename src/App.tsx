import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import { lazy, Suspense } from "react";

// Eager load auth (small, critical path)
import Auth from "./pages/Auth";

// Lazy load all other pages
const Index = lazy(() => import("./pages/Index"));
const Audience = lazy(() => import("./pages/Audience"));
const EditorialCalendar = lazy(() => import("./pages/EditorialCalendar"));
const Episodes = lazy(() => import("./pages/Episodes"));
const Guests = lazy(() => import("./pages/Guests"));
const BrandStudio = lazy(() => import("./pages/BrandStudio"));
const DesignStudio = lazy(() => import("./pages/DesignStudio"));
const PromptBuilder = lazy(() => import("./pages/PromptBuilder"));
const ScriptGenerator = lazy(() => import("./pages/ScriptGenerator"));
const Templates = lazy(() => import("./pages/Templates"));
const MetricsPage = lazy(() => import("./pages/Metrics"));
const Mentions = lazy(() => import("./pages/Mentions"));
const Resources = lazy(() => import("./pages/Resources"));
const Scorecard = lazy(() => import("./pages/Scorecard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const NotFound = lazy(() => import("./pages/NotFound"));
const VisualPromptGenerator = lazy(() => import("./pages/VisualPromptGenerator"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 min stale time to reduce refetches
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/audience" element={<Audience />} />
                        <Route path="/calendar" element={<EditorialCalendar />} />
                        <Route path="/episodes" element={<Episodes />} />
                        <Route path="/guests" element={<Guests />} />
                        <Route path="/brand" element={<BrandStudio />} />
                        <Route path="/design" element={<DesignStudio />} />
                        <Route path="/prompts" element={<PromptBuilder />} />
                        <Route path="/scripts" element={<ScriptGenerator />} />
                        <Route path="/templates" element={<Templates />} />
                        <Route path="/metrics" element={<MetricsPage />} />
                        <Route path="/mentions" element={<Mentions />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/scorecard" element={<Scorecard />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </AppLayout>
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
