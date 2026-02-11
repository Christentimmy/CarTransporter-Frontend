import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { UserLayout } from "./layouts/UserLayout";
import UserDashboard from "./pages/user/Dashboard";
import PostRequest from "./pages/user/PostRequest";
import MyRequests from "./pages/user/MyRequests";
import UserAuction from "./pages/user/Auction";
import Notifications from "./pages/user/Notifications";
import Profile from "./pages/user/Profile";
import { TransporterLayout } from "./layouts/TransporterLayout";
import TransporterDashboard from "./pages/transporter/Dashboard";
import AvailableRequests from "./pages/transporter/AvailableRequests";
import Auction from "./pages/transporter/Auction";
import MyShipments from "./pages/transporter/MyShipments";
import Withdrawals from "./pages/transporter/Withdrawals";
import TransporterNotifications from "./pages/transporter/Notifications";
import TransporterProfile from "./pages/transporter/Profile";
import VerifyOtp from "./pages/VerifyOtp";
import NotFound from "./pages/NotFound";
import AboutUs from "./pages/footer/AboutUs";
import HelpCenter from "./pages/footer/HelpCenter";
import Safety from "./pages/footer/Safety";
import FAQ from "./pages/footer/FAQ";
import TermsOfService from "./pages/footer/TermsOfService";
import PrivacyPolicy from "./pages/footer/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* User Module Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="post-request" element={<PostRequest />} />
            <Route path="my-requests" element={<MyRequests />} />
            <Route path="auction/:id" element={<UserAuction />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            {/* Add more user routes here */}
          </Route>
          {/* Transporter Module Routes */}
          <Route path="/transporter" element={<TransporterLayout />}>
            <Route index element={<Navigate to="/transporter/dashboard" replace />} />
            <Route path="dashboard" element={<TransporterDashboard />} />
            <Route path="post-request" element={<PostRequest />} />
            <Route path="available-requests" element={<AvailableRequests />} />
            <Route path="auction/:id" element={<Auction />} />
            <Route path="my-shipments" element={<MyShipments />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="notifications" element={<TransporterNotifications />} />
            <Route path="profile" element={<TransporterProfile />} />
            {/* Add more transporter routes here */}
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
