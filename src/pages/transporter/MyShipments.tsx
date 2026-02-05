import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Filter,
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
import { getMyAssignedShipments, updateShipmentStatus } from "@/services/shipmentService";
import type { AssignedShipment } from "@/types/shipment";

function formatLocation(loc: AssignedShipment["pickupLocation"]) {
  if (loc.address) return loc.address;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.length ? parts.join(", ") : loc.country || "—";
}

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
  const [page] = useState(1);
  const limit = 40;
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-assigned-shipments", page, limit],
    queryFn: () => getMyAssignedShipments({ page, limit }),
  });

  const { mutateAsync: mutateShipmentStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ shipmentId, status }: { shipmentId: string; status: string }) =>
      updateShipmentStatus(shipmentId, status),
    onSuccess: async (res) => {
      toast.success(res.message ?? "Shipment status updated", {
        style: { background: "#22c55e", color: "#fff" },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-assigned-shipments"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Failed to update shipment status", {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const shipments = (data?.data ?? []) as AssignedShipment[];

  const parseDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      return Number.isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      searchQuery === "" ||
      `${shipment.vehicleDetails.make} ${shipment.vehicleDetails.model}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      formatLocation(shipment.pickupLocation).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatLocation(shipment.deliveryLocation).toLowerCase().includes(searchQuery.toLowerCase());

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

    await mutateShipmentStatus({ shipmentId: selectedShipment, status: newStatus });

    setIsStatusDialogOpen(false);
    setSelectedShipment(null);
    setNewStatus("");
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

  const selectedShipmentData = shipments.find((s) => s._id === selectedShipment);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your shipments...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive font-medium">Failed to load shipments</p>
        <p className="text-muted-foreground text-sm mt-2">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

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
                : "You haven't been assigned any shipments yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredShipments.map((shipment, index) => {
            // Allow status update only when escrow has been paid into and status is not terminal
            const isEscrowPaidIn = shipment.escrowStatus === "PAID_IN_ESCROW";
            const canUpdateStatus =
              isEscrowPaidIn &&
              shipment.status !== "COMPLETED" &&
              shipment.status !== "CANCELLED" &&
              shipment.status !== "DELIVERED";

            const pickupStart = parseDate(shipment.pickupWindow?.start);
            const pickupEnd = parseDate(shipment.pickupWindow?.end);
            const deliveryDeadline = parseDate(shipment.deliveryDeadline);
            const assignedAt = parseDate(shipment.updatedAt);
            const winningAmount = shipment.currentBid?.amount;

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
                                  <span className="text-muted-foreground/80">From </span>
                                  {formatLocation(shipment.pickupLocation)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 opacity-60" />
                                <span>
                                  <span className="text-muted-foreground/80">To </span>
                                  {formatLocation(shipment.deliveryLocation)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Pickup:{" "}
                                  {pickupStart ? format(pickupStart, "MMM d") : "—"} -{" "}
                                  {pickupEnd ? format(pickupEnd, "MMM d, yyyy") : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Distance:</span>
                                <span>
                                  {shipment.distance != null
                                    ? `${(shipment.distance / 1000).toFixed(1)} km`
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 md:col-span-2">
                                <span className="font-medium">Winning Bid:</span>
                                <span className="font-semibold text-primary">
                                  {winningAmount != null ? `$${winningAmount.toLocaleString()}` : "—"}
                                </span>
                              </div>

                              {(shipment.vehicleDetails.color ||
                                shipment.vehicleDetails.drivetrain ||
                                shipment.vehicleDetails.weight != null ||
                                shipment.vehicleDetails.size?.length != null ||
                                shipment.vehicleDetails.size?.width != null ||
                                shipment.vehicleDetails.size?.height != null ||
                                shipment.vehicleDetails.isAccidented != null ||
                                shipment.vehicleDetails.keysAvailable != null ||
                                shipment.vehicleDetails.isRunning != null) && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 md:col-span-2">
                                  <Badge
                                    variant={(shipment.vehicleDetails.isRunning ?? true) ? "default" : "secondary"}
                                  >
                                    {(shipment.vehicleDetails.isRunning ?? true) ? "Running" : "Not Running"}
                                  </Badge>
                                  {shipment.vehicleDetails.isAccidented === true && (
                                    <Badge variant="secondary">Accidented</Badge>
                                  )}
                                  {shipment.vehicleDetails.keysAvailable != null && (
                                    <Badge
                                      variant={shipment.vehicleDetails.keysAvailable ? "default" : "secondary"}
                                    >
                                      {shipment.vehicleDetails.keysAvailable ? "Keys" : "No Keys"}
                                    </Badge>
                                  )}
                                  {shipment.vehicleDetails.color && (
                                    <Badge variant="outline">{shipment.vehicleDetails.color}</Badge>
                                  )}
                                  {shipment.vehicleDetails.drivetrain && (
                                    <Badge variant="outline">{shipment.vehicleDetails.drivetrain}</Badge>
                                  )}
                                  {shipment.vehicleDetails.weight != null && (
                                    <Badge variant="outline">{shipment.vehicleDetails.weight} kg</Badge>
                                  )}
                                  {(shipment.vehicleDetails.size?.length != null ||
                                    shipment.vehicleDetails.size?.width != null ||
                                    shipment.vehicleDetails.size?.height != null) && (
                                    <Badge variant="outline">
                                      {(shipment.vehicleDetails.size?.length ?? "—")}
                                      x
                                      {(shipment.vehicleDetails.size?.width ?? "—")}
                                      x
                                      {(shipment.vehicleDetails.size?.height ?? "—")} m
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        {canUpdateStatus && (
                          <Dialog
                            open={isStatusDialogOpen && selectedShipment === shipment._id}
                            onOpenChange={setIsStatusDialogOpen}
                          >
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
                                <Button
                                  type="button"
                                  variant="hero"
                                  onClick={handleStatusSubmit}
                                  disabled={isUpdatingStatus}
                                >
                                  {isUpdatingStatus ? "Updating..." : "Update Status"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {!canUpdateStatus && shipment.status === "ASSIGNED" && (
                          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs text-left sm:text-right">
                            Waiting for client payment before you can update this shipment's status.
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Assigned Date</p>
                        <p className="text-sm font-medium">
                          {assignedAt ? format(assignedAt, "MMM d, yyyy") : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Delivery Deadline</p>
                        <p className="text-sm font-medium">
                          {deliveryDeadline ? format(deliveryDeadline, "MMM d, yyyy") : "—"}
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
