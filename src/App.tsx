import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Audience from "./pages/Audience";
import EditorialCalendar from "./pages/EditorialCalendar";
import Episodes from "./pages/Episodes";
import BrandStudio from "./pages/BrandStudio";
import DesignStudio from "./pages/DesignStudio";
import PromptBuilder from "./pages/PromptBuilder";
import MetricsPage from "./pages/Metrics";
import Resources from "./pages/Resources";
import Scorecard from "./pages/Scorecard";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/audience" element={<Audience />} />
                    <Route path="/calendar" element={<EditorialCalendar />} />
                    <Route path="/episodes" element={<Episodes />} />
                    <Route path="/brand" element={<BrandStudio />} />
                    <Route path="/design" element={<DesignStudio />} />
                    <Route path="/prompts" element={<PromptBuilder />} />
                    <Route path="/metrics" element={<MetricsPage />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/scorecard" element={<Scorecard />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
