import { getAuthHeader, API_ENDPOINTS } from "@/config/api";

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

export const getGoogleMapsPlaceDetails = async (placeId: string) => {
  try {
    const response = await fetch(`/api/maps/place-details?placeId=${placeId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch place details");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching place details:", error);
    throw error;
  }
};
