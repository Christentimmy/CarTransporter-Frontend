import { API_ENDPOINTS, getAuthHeader } from "@/config/api";

export type UserRole = "user" | "transporter" | "admin" | "super_admin";

export type UserStatus = "approved" | "rejected" | "pending" | "banned" | null;

export interface Region {
  country: string;
  state: string;
  postalCode: string;
}

export interface Insurance {
  name: string;
  policyNumber: string;
  expiryDate: string;
}

export interface UserProfile {
  _id: string;
  email: string;
  phone_number: string;
  region?: Region | null;
  insurance?: Insurance | null;
  status: UserStatus;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  company_name?: string;
  business_address?: string;
  tax_number?: string;
  balance?: number;
}

export interface GetProfileResponse {
  message: string;
  data: UserProfile;
}

export const getProfile = async (): Promise<GetProfileResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.GET_PROFILE, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch profile");
  }

  return response.json();
};

export type UpdateProfilePayload = {
  email?: string;
  phone_number?: string;
  company_name?: string;
  business_address?: string;
  tax_number?: string;
  region?: Region;
  insurance?: Partial<Insurance>;
};

export interface UpdateProfileResponse {
  message: string;
  data: UserProfile;
}

export const updateProfile = async (
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.UPDATE_PROFILE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update profile");
  }

  return response.json();
};
