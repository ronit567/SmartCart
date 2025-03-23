import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ScanPage from "@/pages/scan-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import ConfirmationPage from "@/pages/confirmation-page";
import OrderHistoryPage from "@/pages/order-history-page";
import AIAssistantPage from "@/pages/ai-assistant-page";
import RewardsPage from "@/pages/rewards-page";
import ProfilePage from "@/pages/profile-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { CartProvider } from "@/contexts/cart-context";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import { VoiceControl } from "@/components/VoiceControl";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { useAccessibility } from "@/contexts/accessibility-context";
import { FontSizeScaler } from "@/components/FontSizeScaler";
import { Navigation } from "@/components/Navigation";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/scan" component={ScanPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/confirmation" component={ConfirmationPage} />
      <ProtectedRoute path="/order-history" component={OrderHistoryPage} />
      <ProtectedRoute path="/ai-assistant" component={AIAssistantPage} />
      <ProtectedRoute path="/rewards" component={RewardsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AccessibilityFeatures() {
  const { voiceControlEnabled } = useAccessibility();
  
  return (
    <>
      <AccessibilityPanel />
      {voiceControlEnabled && <VoiceControl />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AccessibilityProvider>
            <FontSizeScaler>
              <Router />
              <div className="pb-16 md:pb-0">
                <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden">
                  <Navigation />
                </div>
              </div>
              <AccessibilityFeatures />
              <Toaster />
            </FontSizeScaler>
          </AccessibilityProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
