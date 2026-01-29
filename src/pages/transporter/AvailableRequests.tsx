import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Calendar,
  Gavel,
  DollarSign,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data - replace with API call
const mockLiveRequests = [
  {
    _id: "1",
    vehicleDetails: {
      make: "Toyota",
      model: "Camry",
      year: 2024,
      isRunning: true,
    },
    pickupLocation: {
      address: "123 Main St",
      city: "New York",
      state: "NY",
      country: "USA",
    },
    deliveryLocation: {
      address: "456 Oak Ave",
      city: "Los Angeles",
      state: "CA",
      country: "USA",
    },
    distance: 2789, // km
    pickupWindow: {
      start: new Date("2024-02-15"),
      end: new Date("2024-02-17"),
    },
    deliveryDeadline: new Date("2024-02-25"),
    status: "LIVE",
    currentBid: {
      amount: 850,
      placedAt: new Date("2024-02-10"),
    },
    auctionEndTime: new Date("2024-02-14T18:00:00"),
    instantAcceptPrice: 1200,
    photos: [],
  },
  {
    _id: "2",
    vehicleDetails: {
      make: "Honda",
      model: "Accord",
      year: 2023,
      isRunning: true,
    },
    pickupLocation: {
      address: "789 Pine Rd",
      city: "Chicago",
      state: "IL",
      country: "USA",
    },
    deliveryLocation: {
      address: "321 Elm St",
      city: "Miami",
      state: "FL",
      country: "USA",
    },
    distance: 1389,
    pickupWindow: {
      start: new Date("2024-02-20"),
      end: new Date("2024-02-22"),
    },
    deliveryDeadline: new Date("2024-03-01"),
    status: "LIVE",
    currentBid: {
      amount: 1200,
      placedAt: new Date("2024-02-08"),
    },
    auctionEndTime: new Date("2024-02-13T12:00:00"),
    instantAcceptPrice: null,
    photos: [],
  },
  {
    _id: "3",
    vehicleDetails: {
      make: "Ford",
      model: "F-150",
      year: 2022,
      isRunning: false,
    },
    pickupLocation: {
      address: "555 Maple Dr",
      city: "Houston",
      state: "TX",
      country: "USA",
    },
    deliveryLocation: {
      address: "777 Cedar Ln",
      city: "Phoenix",
      state: "AZ",
      country: "USA",
    },
    distance: 1180,
    pickupWindow: {
      start: new Date("2024-02-18"),
      end: new Date("2024-02-20"),
    },
    deliveryDeadline: new Date("2024-02-28"),
    status: "LIVE",
    currentBid: {
      amount: 950,
      placedAt: new Date("2024-02-09"),
    },
    auctionEndTime: new Date("2024-02-15T20:00:00"),
    instantAcceptPrice: 1500,
    photos: [],
  },
];

const AvailableRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = mockLiveRequests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      `${request.vehicleDetails.make} ${request.vehicleDetails.model}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.pickupLocation.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.deliveryLocation.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""} left`;
    }
    return `${hours}h ${minutes}m left`;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Available Requests</h1>
          <p className="text-muted-foreground">
            Browse live vehicle transport requests and place your bids
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by vehicle, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No requests found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery ? "Try adjusting your search" : "No live requests available at the moment"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request, index) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">
                              {request.vehicleDetails.year} {request.vehicleDetails.make}{" "}
                              {request.vehicleDetails.model}
                            </CardTitle>
                            <Badge variant="default" className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeRemaining(request.auctionEndTime)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {request.pickupLocation.city}, {request.pickupLocation.state} →{" "}
                                {request.deliveryLocation.city}, {request.deliveryLocation.state}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Distance:</span>
                              <span>{request.distance.toLocaleString()} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Pickup: {format(request.pickupWindow.start, "MMM d")} -{" "}
                                {format(request.pickupWindow.end, "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Vehicle Status:</span>
                              <Badge variant={request.vehicleDetails.isRunning ? "default" : "secondary"}>
                                {request.vehicleDetails.isRunning ? "Running" : "Not Running"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/transporter/auction/${request._id}`}>
                        <Button variant="hero" className="w-full sm:w-auto">
                          <Gavel className="mr-2 h-4 w-4" />
                          View Auction
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Lowest Bid</p>
                      <p className="text-lg font-semibold">
                        ${request.currentBid?.amount.toLocaleString() || "No bids yet"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Delivery Deadline</p>
                      <p className="text-sm font-medium">
                        {format(request.deliveryDeadline, "MMM d, yyyy")}
                      </p>
                    </div>
                    {request.instantAcceptPrice && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Instant Accept</p>
                        <p className="text-sm font-medium text-primary">
                          ${request.instantAcceptPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableRequests;
