import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initSocket } from "./lib/socket";
import { useSocketInvalidation } from "./hooks/useSocketInvalidation";
import { useAuth } from "./hooks/use-auth";
import Layout from "./components/layout";
import CustomerHome from "./pages/customer/home";
import RestaurantMenu from "./pages/customer/restaurant-menu";
import OrderTracker from "./pages/customer/order-tracker";
import OrderHistory from "./pages/customer/order-history";
import RestaurantDashboard from "./pages/restaurant/dashboard";
import RestaurantOnboarding from "./pages/restaurant/onboarding";
import DriverDashboard from "./pages/driver/dashboard";
import ProfilePage from "./pages/profile";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSocket();
  }, []);
  useSocketInvalidation();
  return <>{children}</>;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, fetchUser } = useAuth();
  const [location] = useLocation();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const publicPaths = ["/login", "/register", "/"];
  const isPublicPage = publicPaths.includes(location) || location.startsWith("/menu/");

  if (!user && !isPublicPage) {
    return <Redirect to="/login" />;
  }

  // Only redirect authenticated users away from auth pages, not all public pages
  const isAuthPage = location === "/login" || location === "/register";
  if (user && isAuthPage) {
    if (user.role === "restaurant") return <Redirect to="/restaurant" />;
    if (user.role === "driver") return <Redirect to="/driver" />;
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/" component={CustomerHome} />
      <Route path="/menu/:id" component={RestaurantMenu} />
      <Route path="/track/:id" component={OrderTracker} />
      <Route path="/orders" component={OrderHistory} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/restaurant" component={RestaurantDashboard} />
      <Route path="/restaurant/add" component={RestaurantOnboarding} />
      <Route path="/driver" component={DriverDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SocketProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthGuard>
              <Layout>
                <AppRouter />
              </Layout>
            </AuthGuard>
          </WouterRouter>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fafafa",
              },
            }}
          />
        </SocketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
