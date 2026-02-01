import { getAuthHeader, API_ENDPOINTS } from "@/config/api";
import type {
  GetMyShipmentsResponse,
  ListShipmentsResponse,
} from "@/types/shipment";

export interface GetMyShipmentsParams {
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
  const headers = getAuthHeader();
  const response = await fetch(API_ENDPOINTS.USER.CREATE_SHIPMENT, {
    method: "POST",
    headers: {
      ...headers,
      // Do not set Content-Type; browser sets multipart/form-data with boundary
    },
    body: data,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create shipment");
  }

  return response.json();
};

// export const getGoogleMapsPlaceDetails = async (placeId: string) => {
//   try {
//     const response = await fetch(`/api/maps/place-details?placeId=${placeId}`);
//     if (!response.ok) {
//       throw new Error("Failed to fetch place details");
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Error fetching place details:", error);
//     throw error;
//   }
// };
