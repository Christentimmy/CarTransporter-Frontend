import { getAuthHeader, API_ENDPOINTS } from "@/config/api";
import type {
  GetMyAssignedShipmentsResponse,
  GetMyShipmentsResponse,
  ListShipmentsResponse,
} from "@/types/shipment";

export interface GetMyShipmentsParams {
  page?: number;
  limit?: number;
}

export interface GetMyAssignedShipmentsParams {
  page?: number;
  limit?: number;
}

/** Params for list-shipments (LIVE/DRAFT shipments for transporters) */
export interface ListShipmentsParams {
  page?: number;
  limit?: number;
}

export const getListShipments = async (
  params?: ListShipmentsParams,
): Promise<ListShipmentsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const url = query
    ? `${API_ENDPOINTS.USER.LIST_SHIPMENTS}?${query}`
    : API_ENDPOINTS.USER.LIST_SHIPMENTS;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch list of shipments");
  }

  return response.json();
};

export interface CancelShipmentResponse {
  message?: string;
  data?: unknown;
}

export const cancelShipment = async (
  shipmentId: string,
): Promise<CancelShipmentResponse> => {
  const response = await fetch(
    `${API_ENDPOINTS.USER.CANCEL_SHIPMENT}/${shipmentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to cancel shipment");
  }

  return response.json().catch(() => ({}));
};

export interface UpdateShipmentStatusRequest {
  shipmentId: string;
  status: string;
  keysGivenTo?: string;
  vehicleDroppedAt?: string;
  photos?: File[];
  issue?: string;
  disputePhotos?: File[];
}

export interface UpdateShipmentStatusResponse {
  message?: string;
  data?: unknown;
}

export const updateShipmentStatus = async (
  shipmentId: string,
  status: string,
  keysGivenTo?: string,
  vehicleDroppedAt?: string,
  photos?: File[],
  issue?: string,
  disputePhotos?: File[],
): Promise<UpdateShipmentStatusResponse> => {
  // If photos are included (delivery or dispute), use FormData
  if (
    (photos && photos.length > 0) ||
    (disputePhotos && disputePhotos.length > 0)
  ) {
    const formData = new FormData();
    formData.append("shipmentId", shipmentId);
    formData.append("status", status);

    if (keysGivenTo) {
      formData.append("keysGivenTo", keysGivenTo);
    }

    if (vehicleDroppedAt) {
      formData.append("vehicleDroppedAt", vehicleDroppedAt);
    }

    if (issue) {
      formData.append("issue", issue);
    }

    photos?.forEach((file) => formData.append("photos", file));
    disputePhotos?.forEach((file) => formData.append("photos", file));

    const response = await fetch(API_ENDPOINTS.USER.UPDATE_SHIPMENT_STATUS, {
      method: "POST",
      headers: {
        ...getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to update shipment status");
    }

    return response.json().catch(() => ({}));
  }

  // For regular status updates without photos, use JSON
  const response = await fetch(API_ENDPOINTS.USER.UPDATE_SHIPMENT_STATUS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({
      shipmentId,
      status,
      ...(keysGivenTo && { keysGivenTo }),
      ...(vehicleDroppedAt && { vehicleDroppedAt }),
      ...(issue && { issue }),
    } satisfies UpdateShipmentStatusRequest),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update shipment status");
  }

  return response.json().catch(() => ({}));
};

export const getMyAssignedShipments = async (
  params?: GetMyAssignedShipmentsParams,
): Promise<GetMyAssignedShipmentsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const url = query
    ? `${API_ENDPOINTS.USER.GET_MY_ASSIGNED_SHIPMENTS}?${query}`
    : API_ENDPOINTS.USER.GET_MY_ASSIGNED_SHIPMENTS;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch assigned shipments");
  }

  return response.json();
};

export interface AcceptBidRequest {
  bidId: string;
}

export interface AcceptBidResponse {
  message?: string;
  data?: unknown;
}

export const acceptBid = async (bidId: string): Promise<AcceptBidResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.ACCEPT_BID, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ bidId } satisfies AcceptBidRequest),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to accept bid");
  }

  return response.json().catch(() => ({}));
};

export interface ShipmentBidDto {
  _id: string;
  shipment: string;
  bidder: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  company_name?: string;
}

export interface GetShipmentBidsResponse {
  data: ShipmentBidDto[];
}

export const getShipmentBids = async (
  shipmentId: string,
): Promise<GetShipmentBidsResponse> => {
  const response = await fetch(
    `${API_ENDPOINTS.USER.GET_SHIPMENT_BIDS}/${shipmentId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch shipment bids");
  }

  return response.json();
};

export const getMyShipments = async (
  params?: GetMyShipmentsParams,
): Promise<GetMyShipmentsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.limit != null) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  const url = query
    ? `${API_ENDPOINTS.USER.GET_MY_SHIPMENTS}?${query}`
    : API_ENDPOINTS.USER.GET_MY_SHIPMENTS;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch my shipments");
  }

  return response.json();
};

export const createShipment = async (data: FormData) => {
  const response = await fetch(API_ENDPOINTS.USER.CREATE_SHIPMENT, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
    },
    body: data,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create shipment");
  }

  return response.json();
};

export interface ProcessPaymentRequest {
  shipmentId: string;
  sourceId: string;
}

export interface ProcessPaymentResponse {
  success: boolean;
  message?: string;
  paymentId?: string;
}

export interface ResolveDisputeRequest {
  shipmentId: string;
}

export interface ResolveDisputeResponse {
  success: boolean;
  message?: string;
}

export interface ViewShipmentAssignedToRequest {
  shipmentId: string;
}

export interface ViewShipmentAssignedToResponse {
  success: boolean;
  message?: string;
  data: {
    company_name: string;
    business_address: string;
    email: string;
  };
}

export const processPayment = async (
  data: ProcessPaymentRequest,
): Promise<ProcessPaymentResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.PROCESS_PAYMENT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Payment processing failed");
  }

  return response.json();
};

export const resolveDispute = async (
  data: ResolveDisputeRequest,
): Promise<ResolveDisputeResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.RESOLVE_DISPUTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to resolve dispute");
  }

  return response.json();
};

export const viewShipmentAssignedTo = async (
  data: ViewShipmentAssignedToRequest,
): Promise<ViewShipmentAssignedToResponse> => {
  const response = await fetch(API_ENDPOINTS.USER.VIEW_SHIPMENT_ASSIGNED_TO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch company information");
  }

  return response.json();
};
