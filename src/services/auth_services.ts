import {
  API_ENDPOINTS,
  storeAuthToken,
  storeAuthRole,
  removeAuthToken,
  removeAuthRole,
  getAuthHeader,
  type AuthRole,
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
  identifier: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  message: string;
  role?: AuthRole;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
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

      // Store the token and role
      if (data.token) {
        storeAuthToken(data.token);
      }
      if (data.role) {
        storeAuthRole(data.role);
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
    removeAuthRole();
  }

  public isAuthenticated(): boolean {
    return !!getAuthHeader();
  }

  public async verifyOtp(data: VerifyOtpPayload): Promise<{ message: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: data.otp,
          email: data.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP verification failed");
      }

      const result = await response.json();
      if (result.token) {
        storeAuthToken(result.token);
      }
      if (result.role) {
        storeAuthRole(result.role);
      }
      return result;
    } catch (error) {
      console.error("OTP Verification error:", error);
      throw error;
    }
  }

  public async resendOtp(data: ResendOtpPayload): Promise<{ message: string }> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.SEND_OTP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send OTP");
      }

      return await response.json();
    } catch (error) {
      console.error("Send OTP error:", error);
      throw error;
    }
  }
}

export const authService = AuthService.getInstance();
