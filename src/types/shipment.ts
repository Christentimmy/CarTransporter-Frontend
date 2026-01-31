import { z } from "zod";

export const vehicleDetailsSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 1),
  isRunning: z.boolean().default(true),
  weight: z.number().min(1, "Weight is required").positive(),
  size: z.object({
    length: z.number().positive("Length must be positive"),
    width: z.number().positive("Width must be positive"),
    height: z.number().positive("Height must be positive"),
  }),
});

export const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const shipmentFormSchema = z.object({
  // Step 1: Vehicle Details
  vehicleDetails: vehicleDetailsSchema,

  // Step 2: Pickup & Delivery
  pickupLocation: locationSchema,
  deliveryLocation: locationSchema,

  // Step 3: Scheduling
  pickupWindow: z.object({
    start: z.date(),
    end: z.date(),
  }),
  deliveryDeadline: z.date(),

  // Step 4: Auction & Pricing
  auctionType: z.enum(["auction", "instant"]),
  instantAcceptPrice: z.number().optional(),
  auctionStartTime: z.date().optional(),
  auctionEndTime: z.date().optional(),

  // Step 5: Photos
  photos: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required")
    .max(10, "Maximum 10 photos allowed"),
});

export type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;
export type LocationData = z.infer<typeof locationSchema>;
export type VehicleDetails = z.infer<typeof vehicleDetailsSchema>;

/**
 * GeoJSON Point + address fields for API create-shipment.
 * Matches backend schema: type (enum 'Point'), coordinates [lng, lat] required;
 * address, city, state, country, zipCode optional.
 * Coordinates come from autocomplete (LocationIQ) and are required to submit.
 */
export interface CreateShipmentLocation {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude] – required, from autocomplete
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

/** Build payload for backend: only type + coordinates (required) and present address fields */
export function toShipmentLocationPayload(loc: CreateShipmentLocation): Record<string, unknown> {
  const out: Record<string, unknown> = {
    type: "Point",
    coordinates: loc.coordinates,
  };
  if (loc.address != null && loc.address !== "") out.address = loc.address;
  if (loc.city != null && loc.city !== "") out.city = loc.city;
  if (loc.state != null && loc.state !== "") out.state = loc.state;
  if (loc.country != null && loc.country !== "") out.country = loc.country;
  if (loc.zipCode != null && loc.zipCode !== "") out.zipCode = loc.zipCode;
  return out;
}

/** Location shape returned by get-my-shipments API */
export interface MyShipmentLocation {
  type: "Point";
  coordinates: [number, number];
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

/** Vehicle details returned by get-my-shipments API */
export interface MyShipmentVehicleDetails {
  make: string;
  model: string;
  year: number;
  isRunning: boolean;
}

/** Single shipment from get-my-shipments API */
export interface MyShipment {
  _id: string;
  shipper: string;
  pickupLocation: MyShipmentLocation;
  deliveryLocation: MyShipmentLocation;
  vehicleDetails: MyShipmentVehicleDetails;
  pickupWindow: { start: string; end: string };
  deliveryDeadline: string;
  distance?: number;
  estimatedTime?: number;
  photos: string[];
  auctionDuration?: number;
  auctionStartTime?: string;
  auctionEndTime?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/** Pagination meta from get-my-shipments API */
export interface MyShipmentsPagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/** Response shape for GET /user/get-my-shipments */
export interface GetMyShipmentsResponse {
  data: MyShipment[];
  pagination: MyShipmentsPagination;
}
