import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import Layout from "./components/Layout";
import RestaurantPage from "./pages/RestaurantPage";
import NGOPage from "./pages/NGOPage";
import VolunteerPage from "./pages/VolunteerPage";
import ImpactPage from "./pages/ImpactPage";
import EventPage from "./pages/EventPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { AppStoreProvider } from "./store/AppStore";
import NotificationsPanel from "./components/NotificationsPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/restaurant" replace />} />
              <Route path="/restaurant" element={<RestaurantPage />} />
              <Route path="/event" element={<EventPage />} />
              <Route path="/ngo" element={<NGOPage />} />
              <Route path="/volunteer" element={<VolunteerPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/impact" element={<ImpactPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NotificationsPanel />
        </BrowserRouter>
      </AppStoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
