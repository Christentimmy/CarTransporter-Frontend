import {
  API_ENDPOINTS,
  storeAuthToken,
  removeAuthToken,
  getAuthHeader,
} from "@/config/api";

export interface RegisterPayload {
  email: string;
  phone_number: string;
  password: string;
  role: "user" | "transporter";
  company_name?: string;
  business_address?: string;
  tax_number?: string;
  region?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async register(userData: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const data: AuthResponse = await response.json();

      // Store the token
      if (data.token) {
        storeAuthToken(data.token);
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  public async login(credentials: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data: AuthResponse = await response.json();

      // Store the token
      if (data.token) {
        storeAuthToken(data.token);
      }

      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  public logout(): void {
    removeAuthToken();
    // You might want to redirect to login page or handle other cleanup here
  }

  public isAuthenticated(): boolean {
    return !!getAuthHeader();
  }

  // Add other authentication related methods here
}

export const authService = AuthService.getInstance();
