import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Calendar,
  Gavel,
  Eye,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data - replace with API call
const mockRequests = [
  {
    _id: "1",
    vehicleDetails: {
      make: "Toyota",
      model: "Camry",
      year: 2024,
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
    bidCount: 5,
    auctionEndTime: new Date("2024-02-14"),
    photos: [],
  },
  {
    _id: "2",
    vehicleDetails: {
      make: "Honda",
      model: "Accord",
      year: 2023,
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
    pickupWindow: {
      start: new Date("2024-02-20"),
      end: new Date("2024-02-22"),
    },
    deliveryDeadline: new Date("2024-03-01"),
    status: "ASSIGNED",
    currentBid: {
      amount: 1200,
      placedAt: new Date("2024-02-08"),
    },
    bidCount: 8,
    assignedTo: "Transporter Co.",
    photos: [],
  },
  {
    _id: "3",
    vehicleDetails: {
      make: "Ford",
      model: "F-150",
      year: 2022,
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
    pickupWindow: {
      start: new Date("2024-02-18"),
      end: new Date("2024-02-20"),
    },
    deliveryDeadline: new Date("2024-02-28"),
    status: "IN_TRANSIT",
    currentBid: {
      amount: 950,
      placedAt: new Date("2024-02-09"),
    },
    bidCount: 3,
    assignedTo: "Fast Transport LLC",
    startedAt: new Date("2024-02-15"),
    photos: [],
  },
  {
    _id: "4",
    vehicleDetails: {
      make: "Tesla",
      model: "Model 3",
      year: 2023,
    },
    pickupLocation: {
      address: "999 Birch Way",
      city: "Seattle",
      state: "WA",
      country: "USA",
    },
    deliveryLocation: {
      address: "111 Spruce Ave",
      city: "Portland",
      state: "OR",
      country: "USA",
    },
    pickupWindow: {
      start: new Date("2024-01-10"),
      end: new Date("2024-01-12"),
    },
    deliveryDeadline: new Date("2024-01-20"),
    status: "DELIVERED",
    currentBid: {
      amount: 1100,
      placedAt: new Date("2024-01-05"),
    },
    bidCount: 6,
    assignedTo: "Eco Transport",
    completedAt: new Date("2024-01-18"),
    photos: [],
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  DRAFT: { label: "Draft", variant: "outline", icon: Clock },
  LIVE: { label: "Live", variant: "default", icon: Clock },
  ENDED: { label: "Ended", variant: "secondary", icon: XCircle },
  ASSIGNED: { label: "Assigned", variant: "default", icon: CheckCircle2 },
  IN_TRANSIT: { label: "In Transit", variant: "default", icon: Package },
  DELIVERED: { label: "Delivered", variant: "default", icon: CheckCircle2 },
  COMPLETED: { label: "Completed", variant: "default", icon: CheckCircle2 },
  DISPUTED: { label: "Disputed", variant: "destructive", icon: XCircle },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

const MyRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      `${request.vehicleDetails.make} ${request.vehicleDetails.model}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.pickupLocation.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.deliveryLocation.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.DRAFT;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View and manage all your vehicle transport requests
          </p>
        </div>
        <Link to="/user/post-request" className="w-full sm:w-auto">
          <Button variant="hero" className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="LIVE">Live</SelectItem>
            <SelectItem value="ENDED">Ended</SelectItem>
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DISPUTED">Disputed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No requests found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first vehicle transport request"}
            </p>
            {(!searchQuery && statusFilter === "all") && (
              <Link to="/user/post-request">
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Request
                </Button>
              </Link>
            )}
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
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <CardTitle className="text-lg sm:text-xl truncate">
                              {request.vehicleDetails.year} {request.vehicleDetails.make}{" "}
                              {request.vehicleDetails.model}
                            </CardTitle>
                            <div className="flex-shrink-0">
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {request.pickupLocation.city}, {request.pickupLocation.state} →{" "}
                                {request.deliveryLocation.city}, {request.deliveryLocation.state}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Pickup: {format(request.pickupWindow.start, "MMM d")} -{" "}
                                {format(request.pickupWindow.end, "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {request.status === "LIVE" ? (
                        <Link to={`/user/auction/${request._id}`}>
                          <Button variant="hero" size="sm">
                            <Gavel className="mr-2 h-4 w-4" />
                            View Live Auction
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/user/bids?requestId=${request._id}`}>
                          <Button variant="outline" size="sm">
                            <Gavel className="mr-2 h-4 w-4" />
                            View Bids ({request.bidCount})
                          </Button>
                        </Link>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                      <p className="text-lg font-semibold">
                        ${request.currentBid?.amount.toLocaleString() || "No bids yet"}
                      </p>
                      {request.currentBid && (
                        <p className="text-xs text-muted-foreground">
                          {format(request.currentBid.placedAt, "MMM d, yyyy")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Delivery Deadline</p>
                      <p className="text-sm font-medium">
                        {format(request.deliveryDeadline, "MMM d, yyyy")}
                      </p>
                    </div>
                    {request.status === "LIVE" && request.auctionEndTime && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Auction Ends</p>
                        <p className="text-sm font-medium">
                          {format(request.auctionEndTime, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    )}
                    {request.assignedTo && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
                        <p className="text-sm font-medium">{request.assignedTo}</p>
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

export default MyRequests;
