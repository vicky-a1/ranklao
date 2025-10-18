import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { validateEnvironment } from "./utils/env-validation";
import { reportWebVitals } from "./utils/performance-monitoring";
import { logger } from "./utils/error-handler";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import BrowseMentors from "./pages/BrowseMentors";
import MentorProfile from "./pages/MentorProfile";
import BookSession from "./pages/BookSession";
import Messages from "./pages/Messages";
import Onboarding from "./pages/Onboarding";

import ProfileSetup from "./pages/ProfileSetup";

import ProgressTracking from "./pages/ProgressTracking";
import SessionManagement from "./pages/SessionManagement";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import RefundCancellation from "./pages/RefundCancellation";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PricingPolicy from "./pages/PricingPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import About from "./pages/About";
import PaymentSuccess from "./pages/PaymentSuccess";
import JourneyOverview from "./pages/JourneyOverview";


// Initialize environment validation on app startup
try {
  validateEnvironment();
  logger.info('Environment validation passed');
} catch (error) {
  logger.error('Environment validation failed', error);
  // In production, you might want to show an error page instead
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Report web vitals after app loads
  setTimeout(() => {
    reportWebVitals();
  }, 1000);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard/:role" element={<Dashboard />} />
              <Route path="/browse-mentors" element={<BrowseMentors />} />
              <Route path="/mentors" element={<BrowseMentors />} />
              <Route path="/messages/:mentorId" element={<Messages />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/book-session/:mentorId" element={<BookSession />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund-cancellation" element={<RefundCancellation />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/pricing-policy" element={<PricingPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />
              <Route path="/journey-overview" element={<JourneyOverview />} />
              <Route path="/mentor-profile/:mentorId" element={<MentorProfile />} />
              <Route path="/session/:sessionId" element={<SessionManagement />} />
              <Route path="/progress" element={<ProgressTracking />} />

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
