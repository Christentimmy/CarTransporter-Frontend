import { API_ENDPOINTS, getAuthHeader } from "@/config/api";
import type { PaymentMethodType } from "@/services/paymentMethodService";

export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "processed";

export interface WithdrawalPaymentMethodDto {
  name: string;
  type: PaymentMethodType;
  accountNumber?: string;
  email?: string;
  routingNumber?: string;
  bankName?: string;
  cardNumber?: string;
  cardHolderName?: string;
  cvv?: string;
  expiryDate?: string;
}

export interface WithdrawalRequestDto {
  _id: string;
  user: string;
  amount: number;
  status: WithdrawalStatus;
  paymentMethod: WithdrawalPaymentMethodDto;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;

}

export interface ListWithdrawalRequestsResponse {
  message: string;
  data: WithdrawalRequestDto[];
}

export const listWithdrawalRequests =
  async (): Promise<ListWithdrawalRequestsResponse> => {
    const response = await fetch(API_ENDPOINTS.USER.GET_WITHDRAWAL_REQUESTS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch withdrawal requests");
    }

    return response.json();
  };

export const createWithdrawalRequest = async (
  payload: CreateWithdrawalRequestPayload,
): Promise<CreateWithdrawalRequestResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.CREATE_WITHDRAWAL_REQUEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create withdrawal request");
  }

  return response.json();
};

export interface CreateWithdrawalRequestPayload {
  paymentMethodId: string;
  amount: string;
}

export interface CreateWithdrawalRequestResponse {
  message: string;
  data: WithdrawalRequestDto;
}
