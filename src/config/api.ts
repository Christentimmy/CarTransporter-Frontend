const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
  },
  USER: {
    DASHBOARD: `${API_BASE_URL}/user/get-user-dashboard`,
  },
  // Add other API endpoints here
};

export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const storeAuthToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("authToken");
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};
