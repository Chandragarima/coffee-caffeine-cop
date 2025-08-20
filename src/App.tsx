import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Ask from "./pages/Ask";
import CaffeineTrackerPage from "./pages/CaffeineTrackerPage";
import SmartTrackerPage from "./pages/SmartTrackerPage";
import CoffeeLogDemo from "./pages/CoffeeLogDemo";
import InstallPrompt from "./components/InstallPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Ask />} />
          <Route path="/ask" element={<Ask />} />
          <Route path="/caffeine-tracker" element={<CaffeineTrackerPage />} />
          <Route path="/smart-tracker" element={<SmartTrackerPage />} />
          <Route path="/coffee-log-demo" element={<CoffeeLogDemo />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
