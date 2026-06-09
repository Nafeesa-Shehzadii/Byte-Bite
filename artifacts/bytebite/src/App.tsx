import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initSocket } from "./lib/socket";
import Layout from "./components/layout";
import CustomerHome from "./pages/customer/home";
import RestaurantMenu from "./pages/customer/restaurant-menu";
import OrderTracker from "./pages/customer/order-tracker";
import RestaurantDashboard from "./pages/restaurant/dashboard";
import DriverDashboard from "./pages/driver/dashboard";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient();

function SocketProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initSocket(queryClient);
  }, []);
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={CustomerHome} />
      <Route path="/menu/:id" component={RestaurantMenu} />
      <Route path="/track/:id" component={OrderTracker} />
      <Route path="/restaurant" component={RestaurantDashboard} />
      <Route path="/driver" component={DriverDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SocketProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Layout>
              <Router />
            </Layout>
          </WouterRouter>
          <Toaster />
        </SocketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}