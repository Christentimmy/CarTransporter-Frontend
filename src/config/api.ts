const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
    SEND_OTP: `${API_BASE_URL}/auth/send-otp`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    GENERATE_BEAMS_AUTH: `${API_BASE_URL}/auth/generate-beams-auth`,
    VALIDATE_TOKEN: `${API_BASE_URL}/auth/validate-token`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  USER: {
    DASHBOARD: `${API_BASE_URL}/user/get-user-dashboard`,
    CREATE_SHIPMENT: `${API_BASE_URL}/user/create-shipment`,
    GET_MY_SHIPMENTS: `${API_BASE_URL}/user/get-my-shipments`,
    GET_MY_ASSIGNED_SHIPMENTS: `${API_BASE_URL}/user/get-my-assigned-shipments`,
    LIST_SHIPMENTS: `${API_BASE_URL}/user/list-shipments`,
    GET_SHIPMENT_BIDS: `${API_BASE_URL}/user/get-shipment-bids`,
    ACCEPT_BID: `${API_BASE_URL}/user/accept-bid`,
    UPDATE_SHIPMENT_STATUS: `${API_BASE_URL}/user/update-shipment-status`,
    PROCESS_PAYMENT: `${API_BASE_URL}/payments/pay`,
    LIST_PAYMENT_METHODS: `${API_BASE_URL}/user/list-payment-methods`,
    ADD_PAYMENT_METHOD: `${API_BASE_URL}/user/add-payment-method`,
    GET_WITHDRAWAL_REQUESTS: `${API_BASE_URL}/user/get-withdrawal-requests`,
    CREATE_WITHDRAWAL_REQUEST: `${API_BASE_URL}/user/create-withdrawal-request`,
    GET_PROFILE: `${API_BASE_URL}/user/get-profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/user/update-profile`,
  },
  TRANSPORTER: {
    DASHBOARD: `${API_BASE_URL}/user/get-transporter-dashboard`,
  },
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

const AUTH_ROLE_KEY = "authRole";

export type AuthRole = "user" | "transporter";

export const getAuthRole = (): AuthRole | null => {
  const role = localStorage.getItem(AUTH_ROLE_KEY);
  return role === "user" || role === "transporter" ? role : null;
};

export const storeAuthRole = (role: AuthRole): void => {
  localStorage.setItem(AUTH_ROLE_KEY, role);
};

export const removeAuthRole = (): void => {
  localStorage.removeItem(AUTH_ROLE_KEY);
};
