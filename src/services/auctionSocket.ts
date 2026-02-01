import { io, Socket } from "socket.io-client";
import { getAuthToken } from "@/config/api";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "";

let socket: Socket | null = null;

/**
 * Get or create the socket connection. Uses VITE_SOCKET_URL from .env.
 * Includes authentication token in the connection headers if available.
 */
export function getAuctionSocket(): Socket | null {
  if (!SOCKET_URL) {
    console.warn("VITE_SOCKET_URL is not set");
    return null;
  }
  if (!socket) {
    const token = getAuthToken();

    if (!token) {
      console.warn(
        "Socket auth token is missing (authToken not found in localStorage)",
      );
      return null;
    }

    socket = io(SOCKET_URL, {
      autoConnect: true,
      auth: { token },
      transports: ["websocket"],
      timeout: 10000,
    });

    socket.on("connect_error", (err: unknown) => {
      const e = err as {
        message?: string;
        description?: unknown;
        context?: unknown;
        data?: unknown;
        type?: unknown;
      };

      console.error("Socket connect_error", {
        message: e?.message,
        description: e?.description,
        type: e?.type,
        data: e?.data,
        context: e?.context,
      });
    });
  }
  return socket;
}

/**
 * Emit join-auction with shipmentId. Call this when the auction page loads.
 */
export function joinAuction(shipmentId: string): void {
  const s = getAuctionSocket();
  if (s) {
    s.emit("join-auction", { shipmentId });
  }
}

/**
 * Disconnect the socket. Call when leaving the auction page.
 */
export function disconnectAuctionSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Payload for new-bid event (adjust to match backend) */
export interface NewBidPayload {
  _id?: string;
  amount: number;
  bidder?: { _id: string; company_name?: string };
  placedAt?: string;
}

/** Payload for bid-error event (adjust to match backend) */
export interface BidErrorPayload {
  message?: string;
}
