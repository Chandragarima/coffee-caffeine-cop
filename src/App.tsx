import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Ask from "./pages/Ask";
import CoffeeGuide from "./pages/CoffeeGuide";
import InstallPrompt from "./components/InstallPrompt";
import { FloatingLogButton } from "./components/FloatingLogButton";
import SleepCheckinPrompt from "./components/SleepCheckinPrompt";
import NotificationPermissionPrompt from "./components/NotificationPermissionPrompt";
import NotificationManager from "./components/NotificationManager";

const queryClient = new QueryClient();

// Determine basename based on environment
// In production, use the GitHub Pages path, in development use root
const basename = import.meta.env.PROD ? '/coffee-caffeine-cop' : '/';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <InstallPrompt />
      <BrowserRouter basename={basename} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Ask />} />
          <Route path="/coffee-guide" element={<CoffeeGuide />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* Floating Log Button - Available on all pages */}
        <FloatingLogButton />
        <SleepCheckinPrompt />
        <NotificationPermissionPrompt />
        <NotificationManager />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
