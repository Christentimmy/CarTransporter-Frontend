import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Truck, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PostRequest = () => {
  const navigate = useNavigate();

  // Location states
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupCity, setPickupCity] = useState("");
  const [pickupState, setPickupState] = useState("");
  const [pickupCountry, setPickupCountry] = useState("");
  const [pickupZipCode, setPickupZipCode] = useState("");

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");
  const [deliveryZipCode, setDeliveryZipCode] = useState("");

  // Vehicle details
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [isRunning, setIsRunning] = useState(true);
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  // Dates
  const [pickupWindowStart, setPickupWindowStart] = useState<Date>();
  const [pickupWindowEnd, setPickupWindowEnd] = useState<Date>();
  const [deliveryDeadline, setDeliveryDeadline] = useState<Date>();
  const [auctionStartTime, setAuctionStartTime] = useState<Date>();

  // Auction settings
  const [auctionDuration, setAuctionDuration] = useState("24");
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

    // Calculate auction end time
    const auctionEndTime = auctionStartTime
      ? new Date(auctionStartTime.getTime() + parseInt(auctionDuration) * 60 * 60 * 1000)
      : undefined;

    // TODO: Get coordinates from address (you might want to use a geocoding service)
    const formData = {
      pickupLocation: {
        type: "Point",
        coordinates: [0, 0], // TODO: Get from geocoding
        address: pickupAddress,
        city: pickupCity,
        state: pickupState,
        country: pickupCountry,
        zipCode: pickupZipCode,
      },
      deliveryLocation: {
        type: "Point",
        coordinates: [0, 0], // TODO: Get from geocoding
        address: deliveryAddress,
        city: deliveryCity,
        state: deliveryState,
        country: deliveryCountry,
        zipCode: deliveryZipCode,
      },
      vehicleDetails: {
        make,
        model,
        year: parseInt(year),
        isRunning,
        weight: weight ? parseFloat(weight) : undefined,
        size: {
          length: length ? parseFloat(length) : undefined,
          width: width ? parseFloat(width) : undefined,
          height: height ? parseFloat(height) : undefined,
        },
      },
      pickupWindow: {
        start: pickupWindowStart,
        end: pickupWindowEnd,
      },
      deliveryDeadline,
      auctionDuration: parseInt(auctionDuration),
      instantAcceptPrice: instantAcceptPrice ? parseFloat(instantAcceptPrice) : undefined,
      auctionStartTime: auctionStartTime || new Date(),
      auctionEndTime,
    };

    // TODO: Upload photos and add to formData
    // TODO: Make API call to create shipment
    console.log("Form Data:", formData);

    // For now, just navigate back to dashboard
    navigate("/user/dashboard");
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Post Vehicle Request</h1>
        <p className="text-muted-foreground">
          Create a new vehicle transport request and let transporters bid on it.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pickup Location
            </CardTitle>
            <CardDescription>Where should the vehicle be picked up?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup-address">Address</Label>
              <Input
                id="pickup-address"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Street address"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-city">City</Label>
                <Input
                  id="pickup-city"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup-state">State</Label>
                <Input
                  id="pickup-state"
                  value={pickupState}
                  onChange={(e) => setPickupState(e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup-country">Country</Label>
                <Input
                  id="pickup-country"
                  value={pickupCountry}
                  onChange={(e) => setPickupCountry(e.target.value)}
                  placeholder="Country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup-zip">Zip Code</Label>
                <Input
                  id="pickup-zip"
                  value={pickupZipCode}
                  onChange={(e) => setPickupZipCode(e.target.value)}
                  placeholder="Zip Code"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Location
            </CardTitle>
            <CardDescription>Where should the vehicle be delivered?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-address">Address</Label>
              <Input
                id="delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Street address"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-city">City</Label>
                <Input
                  id="delivery-city"
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-state">State</Label>
                <Input
                  id="delivery-state"
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  placeholder="State"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery-country">Country</Label>
                <Input
                  id="delivery-country"
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  placeholder="Country"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-zip">Zip Code</Label>
                <Input
                  id="delivery-zip"
                  value={deliveryZipCode}
                  onChange={(e) => setDeliveryZipCode(e.target.value)}
                  placeholder="Zip Code"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Vehicle Details
            </CardTitle>
            <CardDescription>Information about the vehicle to be transported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Pickup Window
            </CardTitle>
            <CardDescription>When can the vehicle be picked up?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pickup Window Start</Label>
                <Popover>
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
                      onSelect={setPickupWindowStart}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Pickup Window End</Label>
                <Popover>
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
                      onSelect={setPickupWindowEnd}
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Delivery Deadline
            </CardTitle>
            <CardDescription>When must the vehicle be delivered by?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Delivery Deadline</Label>
              <Popover>
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
                    onSelect={setDeliveryDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Auction Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Auction Settings</CardTitle>
            <CardDescription>Configure how the bidding will work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auction-duration">Auction Duration (hours)</Label>
                <Input
                  id="auction-duration"
                  type="number"
                  value={auctionDuration}
                  onChange={(e) => setAuctionDuration(e.target.value)}
                  min="1"
                  required
                />
              </div>
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
            </div>
            <div className="space-y-2">
              <Label>Auction Start Time (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !auctionStartTime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {auctionStartTime ? (
                      format(auctionStartTime, "PPP")
                    ) : (
                      <span>Defaults to now</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={auctionStartTime}
                    onSelect={setAuctionStartTime}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              <div className="grid grid-cols-4 gap-4">
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
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/user/dashboard")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="hero" size="lg">
            Create Request
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostRequest;
