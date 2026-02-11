import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth_services";
import { getAuthToken, getAuthRole } from "@/config/api";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component that validates the stored token on mount.
 * If token is invalid/missing, it logs out and redirects to /login.
 * If token is valid, it renders children.
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    const role = getAuthRole();

    // If no token, redirect to login
    if (!token) {
      navigate("/login");
      return;
    }

    // Validate token with backend
    authService.validateToken().then((isValid) => {
      if (!isValid) {
        authService.logout();
        navigate("/login");
      } else if (role && window.location.pathname === "/") {
        // Token is valid and we're on root, redirect to correct dashboard
        navigate(role === "transporter" ? "/transporter/dashboard" : "/user/dashboard");
      }
    });
  }, [navigate]);

  // Render children while validating (they'll handle loading states)
  return <>{children}</>;
};
