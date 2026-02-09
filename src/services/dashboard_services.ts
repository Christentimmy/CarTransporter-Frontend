import { API_ENDPOINTS, getAuthHeader } from "@/config/api";

interface DashboardStats {
  pendingRequest: number;
  completedRequest: number;
  totalRequest: number;
  totalRevenue: number;
  recentRequests: any[];
}

interface DashboardResponse {
  message: string;
  data: DashboardStats;
}

export interface TransporterDashboardStats {
  pendingRequest: number;
  completedRequest: number;
  totalRequest: number;
  totalBalance: number;
  recentRequests: Array<{
    _id: string;
    status: string;
    vehicleDetails: {
      make: string;
      model: string;
      year: number;
      serialNumber?: string;
      color?: string;
      drivetrain?: string;
      isRunning?: boolean;
      isAccidented?: boolean;
      keysAvailable?: boolean;
    };
    pickupLocation: {
      address: string;
      state?: string;
      country: string;
      zipCode?: string;
    };
    deliveryLocation: {
      address: string;
      state?: string;
      country: string;
      zipCode?: string;
    };
    currentBid?: {
      amount: number;
      bidder: string;
      placedAt: string;
    };
    pickupWindow: {
      start: string;
      end: string;
    };
    deliveryDeadline: string;
    distance: number;
    estimatedTime: number;
    photos: string[];
    auctionStartTime?: string;
    auctionEndTime?: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

interface TransporterDashboardResponse {
  message: string;
  data: TransporterDashboardStats;
}

class DashboardService {
  private static instance: DashboardService;

  private constructor() {}

  public static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  public async getUserDashboard(): Promise<DashboardStats> {
    try {
      const response = await fetch(API_ENDPOINTS.USER.DASHBOARD, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data");
      }

      const data: DashboardResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to fetch user dashboard:", error);
      throw error;
    }
  }

  public async getTransporterDashboard(): Promise<TransporterDashboardStats> {
    try {
      const response = await fetch(API_ENDPOINTS.TRANSPORTER.DASHBOARD, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch transporter dashboard data",
        );
      }

      const data: TransporterDashboardResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to fetch transporter dashboard:", error);
      throw error;
    }
  }
}

export const dashboardService = DashboardService.getInstance();
