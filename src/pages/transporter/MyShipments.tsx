import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Truck,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock data - replace with API call
const mockShipments = [
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
    distance: 2789,
    pickupWindow: {
      start: new Date("2024-02-15"),
      end: new Date("2024-02-17"),
    },
    deliveryDeadline: new Date("2024-02-25"),
    status: "ASSIGNED",
    winningBid: {
      amount: 850,
      placedAt: new Date("2024-02-10"),
    },
    assignedAt: new Date("2024-02-11"),
    startedAt: null,
    completedAt: null,
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
    distance: 1389,
    pickupWindow: {
      start: new Date("2024-02-20"),
      end: new Date("2024-02-22"),
    },
    deliveryDeadline: new Date("2024-03-01"),
    status: "IN_TRANSIT",
    winningBid: {
      amount: 1200,
      placedAt: new Date("2024-02-08"),
    },
    assignedAt: new Date("2024-02-09"),
    startedAt: new Date("2024-02-15"),
    completedAt: null,
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
    distance: 1180,
    pickupWindow: {
      start: new Date("2024-01-10"),
      end: new Date("2024-01-12"),
    },
    deliveryDeadline: new Date("2024-01-20"),
    status: "DELIVERED",
    winningBid: {
      amount: 950,
      placedAt: new Date("2024-01-05"),
    },
    assignedAt: new Date("2024-01-06"),
    startedAt: new Date("2024-01-10"),
    completedAt: new Date("2024-01-18"),
  },
];

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any; nextStatus?: string }
> = {
  ASSIGNED: {
    label: "Assigned",
    variant: "default",
    icon: CheckCircle2,
    nextStatus: "IN_TRANSIT",
  },
  IN_TRANSIT: {
    label: "In Transit",
    variant: "default",
    icon: Package,
    nextStatus: "DELIVERED",
  },
  DELIVERED: {
    label: "Delivered",
    variant: "default",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Completed",
    variant: "default",
    icon: CheckCircle2,
  },
  DISPUTED: {
    label: "Disputed",
    variant: "destructive",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    variant: "destructive",
    icon: XCircle,
  },
};

const MyShipments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      searchQuery === "" ||
      `${shipment.vehicleDetails.make} ${shipment.vehicleDetails.model}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.pickupLocation.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.deliveryLocation.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (shipmentId: string, currentStatus: string) => {
    setSelectedShipment(shipmentId);
    // Default to first available option
    setNewStatus("IN_TRANSIT");
    setIsStatusDialogOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedShipment || !newStatus) return;

    // TODO: Make API call to update status
    console.log("Updating shipment status:", {
      shipmentId: selectedShipment,
      newStatus,
    });

    setIsStatusDialogOpen(false);
    setSelectedShipment(null);
    setNewStatus("");
    // Show success toast
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || statusConfig.ASSIGNED;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const selectedShipmentData = mockShipments.find((s) => s._id === selectedShipment);

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
          <h1 className="text-3xl font-bold tracking-tight">My Shipments</h1>
          <p className="text-muted-foreground">
            View and manage shipments you've won
          </p>
        </div>
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
            <SelectItem value="ASSIGNED">Assigned</SelectItem>
            <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
            <SelectItem value="DELIVERED">Delivered</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DISPUTED">Disputed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Shipments List */}
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shipments found</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "You haven't won any auctions yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredShipments.map((shipment, index) => {
            // Allow status update for all shipments except COMPLETED and CANCELLED
            const canUpdateStatus = shipment.status !== "COMPLETED" && shipment.status !== "CANCELLED";

            return (
              <motion.div
                key={shipment._id}
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
                                {shipment.vehicleDetails.year} {shipment.vehicleDetails.make}{" "}
                                {shipment.vehicleDetails.model}
                              </CardTitle>
                              {getStatusBadge(shipment.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  {shipment.pickupLocation.city}, {shipment.pickupLocation.state} →{" "}
                                  {shipment.deliveryLocation.city}, {shipment.deliveryLocation.state}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Distance:</span>
                                <span>{shipment.distance.toLocaleString()} km</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Pickup: {format(shipment.pickupWindow.start, "MMM d")} -{" "}
                                  {format(shipment.pickupWindow.end, "MMM d, yyyy")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Winning Bid:</span>
                                <span className="font-semibold text-primary">
                                  ${shipment.winningBid.amount.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {canUpdateStatus && (
                          <Dialog open={isStatusDialogOpen && selectedShipment === shipment._id} onOpenChange={setIsStatusDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => handleStatusUpdate(shipment._id, shipment.status)}
                                className="w-full sm:w-auto"
                              >
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Shipment Status</DialogTitle>
                                <DialogDescription>
                                  Update the status of this shipment
                                </DialogDescription>
                              </DialogHeader>
                              {selectedShipmentData && (
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Current Status</Label>
                                    <p className="text-sm font-medium">
                                      {statusConfig[selectedShipmentData.status]?.label}
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="new-status">New Status</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                      <SelectTrigger id="new-status">
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="IN_TRANSIT">
                                          {statusConfig.IN_TRANSIT.label}
                                        </SelectItem>
                                        <SelectItem value="DELIVERED">
                                          {statusConfig.DELIVERED.label}
                                        </SelectItem>
                                        <SelectItem value="DISPUTED">
                                          {statusConfig.DISPUTED.label}
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  {newStatus === "IN_TRANSIT" && (
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                      <p className="text-sm text-blue-900 dark:text-blue-100">
                                        Marking as "In Transit" means you've started the pickup process and the vehicle is now being transported.
                                      </p>
                                    </div>
                                  )}
                                  {newStatus === "DELIVERED" && (
                                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                                      <p className="text-sm text-green-900 dark:text-green-100">
                                        Marking as "Delivered" means the vehicle has been successfully delivered to the destination.
                                      </p>
                                    </div>
                                  )}
                                  {newStatus === "DISPUTED" && (
                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                      <p className="text-sm text-red-900 dark:text-red-100">
                                        Marking as "Disputed" indicates there is an issue with this shipment that needs to be resolved.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsStatusDialogOpen(false);
                                    setSelectedShipment(null);
                                    setNewStatus("");
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button type="button" variant="hero" onClick={handleStatusSubmit}>
                                  Update Status
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Assigned Date</p>
                        <p className="text-sm font-medium">
                          {format(shipment.assignedAt, "MMM d, yyyy")}
                        </p>
                      </div>
                      {shipment.startedAt && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Started Date</p>
                          <p className="text-sm font-medium">
                            {format(shipment.startedAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                      {shipment.completedAt && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Completed Date</p>
                          <p className="text-sm font-medium">
                            {format(shipment.completedAt, "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Delivery Deadline</p>
                        <p className="text-sm font-medium">
                          {format(shipment.deliveryDeadline, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyShipments;
