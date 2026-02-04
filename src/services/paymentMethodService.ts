import { API_ENDPOINTS, getAuthHeader } from "@/config/api";

export type PaymentMethodType = "bank" | "paypal" | "mobile_money" | "other";

export interface PaymentMethodDto {
  _id: string;
  name: string;
  type: PaymentMethodType;
  accountNumber?: string;
  email?: string;
  routingNumber?: string;
  bankName?: string;
  lastUsed?: string;
}

export interface ListPaymentMethodsResponse {
  message: string;
  data: PaymentMethodDto[];
}

export interface AddPaymentMethodRequest {
  name: string;
  type: PaymentMethodType;
  accountNumber?: string;
  email?: string;
  routingNumber?: string;
  bankName?: string;
}

export interface AddPaymentMethodResponse {
  message: string;
  data: PaymentMethodDto;
}

export const listPaymentMethods =
  async (): Promise<ListPaymentMethodsResponse> => {
    const response = await fetch(API_ENDPOINTS.USER.LIST_PAYMENT_METHODS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to fetch payment methods");
    }

    return response.json();
  };

export const addPaymentMethod = async (
  data: AddPaymentMethodRequest,
): Promise<AddPaymentMethodResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.ADD_PAYMENT_METHOD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to add payment method");
  }

  return response.json();
};
