import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Truck, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlacesAutocomplete } from "@/components/PlacesAutocomplete";
import { createShipment } from "@/services/shipmentService";
import { type CreateShipmentLocation, toShipmentLocationPayload } from "@/types/shipment";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PostRequest = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pickup: address string for input + full location from Places (with coordinates)
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupLocation, setPickupLocation] = useState<CreateShipmentLocation | null>(null);
  const [pickupNote, setPickupNote] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState<CreateShipmentLocation | null>(null);
  const [deliveryNote, setDeliveryNote] = useState("");

  // Vehicle details
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [drivetrain, setDrivetrain] = useState("");
  const [isRunning, setIsRunning] = useState(true);
  const [isAccidented, setIsAccidented] = useState(false);
  const [keysAvailable, setKeysAvailable] = useState(true);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // Dates
  const [pickupWindowStart, setPickupWindowStart] = useState<Date>();
  const [pickupWindowEnd, setPickupWindowEnd] = useState<Date>();
  const [deliveryDeadline, setDeliveryDeadline] = useState<Date>();
  const [auctionStartTime, setAuctionStartTime] = useState<Date>();
  const [auctionEndTime, setAuctionEndTime] = useState<Date>();

  // Date popover open states
  const [isPickupStartOpen, setIsPickupStartOpen] = useState(false);
  const [isPickupEndOpen, setIsPickupEndOpen] = useState(false);
  const [isDeliveryDeadlineOpen, setIsDeliveryDeadlineOpen] = useState(false);

  // Auction settings
  const [instantAcceptPrice, setInstantAcceptPrice] = useState("");

  // Photos
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pickupLocation?.coordinates?.length) {
      toast.error("Please select a pickup address from the suggestions.");
      return;
    }
    if (!deliveryLocation?.coordinates?.length) {
      toast.error("Please select a delivery address from the suggestions.");
      return;
    }
    if (!pickupWindowStart || !pickupWindowEnd) {
      toast.error("Please set the pickup window dates.");
      return;
    }
    if (!deliveryDeadline) {
      toast.error("Please set the delivery deadline.");
      return;
    }
    if (!auctionStartTime) {
      toast.error("Please set the auction start date and time.");
      return;
    }
    if (!auctionEndTime) {
      toast.error("Please set the auction end date and time.");
      return;
    }
    if (auctionEndTime.getTime() <= auctionStartTime.getTime()) {
      toast.error("Auction end must be after auction start.");
      return;
    }

    const durationHours = Math.round(
      (auctionEndTime.getTime() - auctionStartTime.getTime()) / (60 * 60 * 1000)
    );

    const form = new FormData();

    form.append(
      "pickupLocation",
      JSON.stringify(
        toShipmentLocationPayload({
          ...pickupLocation,
          note: pickupNote || undefined,
        })
      )
    );
    form.append(
      "deliveryLocation",
      JSON.stringify(
        toShipmentLocationPayload({
          ...deliveryLocation,
          note: deliveryNote || undefined,
        })
      )
    );
    form.append(
      "vehicleDetails",
      JSON.stringify({
        make,
        model,
        year: parseInt(year, 10),
        color: color || undefined,
        drivetrain: drivetrain || undefined,
        isRunning,
        isAccidented,
        keysAvailable,
        weight: weight ? parseFloat(weight) : undefined,
        size: {
          length: length ? parseFloat(length) : undefined,
          width: width ? parseFloat(width) : undefined,
          height: height ? parseFloat(height) : undefined,
        },
      })
    );
    form.append(
      "pickupWindow",
      JSON.stringify({
        start: pickupWindowStart.toISOString(),
        end: pickupWindowEnd.toISOString(),
      })
    );
    form.append("deliveryDeadline", deliveryDeadline.toISOString());
    form.append("auctionDuration", String(durationHours));
    form.append("auctionStartTime", auctionStartTime.toISOString());
    form.append("auctionEndTime", auctionEndTime.toISOString());
    if (instantAcceptPrice) form.append("instantAcceptPrice", instantAcceptPrice);

    photos.forEach((file) => form.append("photos", file));

    setIsSubmitting(true);
    try {
      await createShipment(form);
      toast.success("Shipment request created.");
      navigate("/user/my-requests");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create shipment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Post Vehicle Request</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Create a new vehicle transport request and let transporters bid on it.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Pickup Location */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Pickup Location
            </CardTitle>
            <CardDescription className="text-sm">Where should the vehicle be picked up? Start typing and select an address.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="pickup-address">Address</Label>
              <PlacesAutocomplete
                id="pickup-address"
                value={pickupAddress}
                onChange={setPickupAddress}
                onPlaceSelect={(loc) => {
                  setPickupLocation(loc);
                  setPickupAddress(loc.address ?? "");
                }}
                placeholder="Street address, city, state..."
              />
              {pickupLocation && (
                <p className="text-xs text-muted-foreground">
                  {[pickupLocation.city, pickupLocation.state, pickupLocation.country, pickupLocation.zipCode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="pickup-note">Note (Optional)</Label>
              <Input
                id="pickup-note"
                value={pickupNote}
                onChange={(e) => setPickupNote(e.target.value)}
                placeholder="e.g., Call on arrival, gate code, loading instructions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Location */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
              Delivery Location
            </CardTitle>
            <CardDescription className="text-sm">Where should the vehicle be delivered? Start typing and select an address.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="delivery-address">Address</Label>
              <PlacesAutocomplete
                id="delivery-address"
                value={deliveryAddress}
                onChange={setDeliveryAddress}
                onPlaceSelect={(loc) => {
                  setDeliveryLocation(loc);
                  setDeliveryAddress(loc.address ?? "");
                }}
                placeholder="Street address, city, state..."
              />
              {deliveryLocation && (
                <p className="text-xs text-muted-foreground">
                  {[deliveryLocation.city, deliveryLocation.state, deliveryLocation.country, deliveryLocation.zipCode].filter(Boolean).join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="delivery-note">Note (Optional)</Label>
              <Input
                id="delivery-note"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="e.g., Receiver contact, delivery instructions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
              Vehicle Details
            </CardTitle>
            <CardDescription className="text-sm">Information about the vehicle to be transported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g., Toyota"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., Camry"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="drivetrain">Drivetrain</Label>
                <Input
                  id="drivetrain"
                  value={drivetrain}
                  onChange={(e) => setDrivetrain(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-running"
                checked={isRunning}
                onCheckedChange={(checked) => setIsRunning(checked as boolean)}
              />
              <Label htmlFor="is-running" className="cursor-pointer">
                Vehicle is running
              </Label>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-accidented"
                  checked={isAccidented}
                  onCheckedChange={(checked) => setIsAccidented(checked as boolean)}
                />
                <Label htmlFor="is-accidented" className="cursor-pointer">
                  Accidented
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keys-available"
                  checked={keysAvailable}
                  onCheckedChange={(checked) => setKeysAvailable(checked as boolean)}
                />
                <Label htmlFor="keys-available" className="cursor-pointer">
                  Keys available
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Optional"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Dimensions (meters) - Optional</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="Length"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="Width"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Height"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pickup Window */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Pickup Window
            </CardTitle>
            <CardDescription className="text-sm">When can the vehicle be picked up?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Pickup Window Start</Label>
                <Popover open={isPickupStartOpen} onOpenChange={setIsPickupStartOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !pickupWindowStart && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupWindowStart ? (
                        format(pickupWindowStart, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pickupWindowStart}
                      onSelect={(date) => {
                        setPickupWindowStart(date);
                        if (date) {
                          setIsPickupStartOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Pickup Window End</Label>
                <Popover open={isPickupEndOpen} onOpenChange={setIsPickupEndOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !pickupWindowEnd && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupWindowEnd ? (
                        format(pickupWindowEnd, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={pickupWindowEnd}
                      onSelect={(date) => {
                        setPickupWindowEnd(date);
                        if (date) {
                          setIsPickupEndOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Deadline */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Delivery Deadline
            </CardTitle>
            <CardDescription className="text-sm">When must the vehicle be delivered by?</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label>Delivery Deadline</Label>
              <Popover open={isDeliveryDeadlineOpen} onOpenChange={setIsDeliveryDeadlineOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDeadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDeadline ? (
                      format(deliveryDeadline, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deliveryDeadline}
                    onSelect={(date) => {
                      setDeliveryDeadline(date);
                      if (date) {
                        setIsDeliveryDeadlineOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Auction Settings */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Auction Settings</CardTitle>
            <CardDescription className="text-sm">Configure how the bidding will work. Pick date and time for start and end.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="auction-start">Auction Start Time (date & time) *</Label>
                <Input
                  id="auction-start"
                  type="datetime-local"
                  required
                  value={auctionStartTime ? format(auctionStartTime, "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) =>
                    setAuctionStartTime(e.target.value ? new Date(e.target.value) : undefined)
                  }
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auction-end">Auction End Time (date & time) *</Label>
                <Input
                  id="auction-end"
                  type="datetime-local"
                  required
                  value={auctionEndTime ? format(auctionEndTime, "yyyy-MM-dd'T'HH:mm") : ""}
                  onChange={(e) =>
                    setAuctionEndTime(e.target.value ? new Date(e.target.value) : undefined)
                  }
                  min={
                    auctionStartTime
                      ? format(auctionStartTime, "yyyy-MM-dd'T'HH:mm")
                      : format(new Date(), "yyyy-MM-dd'T'HH:mm")
                  }
                />
              </div>
            </div>
            {auctionStartTime && auctionEndTime && (
              <p className="text-sm text-muted-foreground">
                Duration: {Math.round((auctionEndTime.getTime() - auctionStartTime.getTime()) / (60 * 60 * 1000))} hours
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="instant-accept">Instant Accept Price ($) - Optional</Label>
              <Input
                id="instant-accept"
                type="number"
                value={instantAcceptPrice}
                onChange={(e) => setInstantAcceptPrice(e.target.value)}
                placeholder="Buy it now price"
                min="0"
                step="0.01"
              />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Vehicle Photos
            </CardTitle>
            <CardDescription>Upload photos of the vehicle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photos">Upload Photos</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="cursor-pointer"
              />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Vehicle ${index + 1}`}
                      className="h-32 w-full rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/user/dashboard")}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" variant="hero" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostRequest;
