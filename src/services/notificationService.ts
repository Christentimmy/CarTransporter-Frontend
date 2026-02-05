import { API_ENDPOINTS, getAuthHeader } from "@/config/api";
import { ITokenProvider } from "@pusher/push-notifications-web";

// Shape returned directly from backend: res.json(beamsToken)
// We keep it generic, as Beams client will consume it as-is.
export type BeamsAuthToken = ITokenProvider;

export const generateBeamsAuth = async (): Promise<BeamsAuthToken> => {
  const response = await fetch(API_ENDPOINTS.AUTH.GENERATE_BEAMS_AUTH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Failed to generate Beams auth token");
  }

  return response.json();
};
