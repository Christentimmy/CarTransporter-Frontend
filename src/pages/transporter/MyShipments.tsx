import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Filter,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMyAssignedShipments, updateShipmentStatus, viewShipmentClient } from "@/services/shipmentService";
import type { AssignedShipment } from "@/types/shipment";
import { useTranslation } from "react-i18next";

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
  ENDED: {
    label: "Ended",
    variant: "secondary",
    icon: CheckCircle2,
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
  EN_ROUTE: {
    label: "En route",
    variant: "default",
    icon: XCircle,
  }
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

const MyShipments = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page] = useState(1);
  const limit = 40;
  const [selectedShipment, setSelectedShipment] = useState<string | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [keysGivenTo, setKeysGivenTo] = useState<string>("");
  const [vehicleDroppedAt, setVehicleDroppedAt] = useState<string>("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [issue, setIssue] = useState<string>("");
  const [disputePhotos, setDisputePhotos] = useState<File[]>([]);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [viewingDisputeShipment, setViewingDisputeShipment] = useState<string | null>(null);
  
  // View client dialog state
  const [isViewClientDialogOpen, setIsViewClientDialogOpen] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState(false);

  // View vehicle photos dialog state
  const [isViewPhotosDialogOpen, setIsViewPhotosDialogOpen] = useState(false);
  const [vehiclePhotos, setVehiclePhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-assigned-shipments", page, limit],
    queryFn: () => getMyAssignedShipments({ page, limit }),
  });

  const { mutateAsync: mutateShipmentStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ shipmentId, status, keysGivenTo, vehicleDroppedAt, photos, issue, disputePhotos }: { 
      shipmentId: string; 
      status: string; 
      keysGivenTo?: string; 
      vehicleDroppedAt?: string; 
      photos?: File[];
      issue?: string;
      disputePhotos?: File[];
    }) =>
      updateShipmentStatus(shipmentId, status, keysGivenTo, vehicleDroppedAt, photos, issue, disputePhotos),
    onSuccess: async (res) => {
      toast.success(res.message ?? t("myShipments.toast.statusUpdated"), {
        style: { background: "#22c55e", color: "#fff" },
      });
      await queryClient.invalidateQueries({ queryKey: ["my-assigned-shipments"] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : t("myShipments.toast.updateFailed"), {
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
    setNewStatus("EN_ROUTE");
    setIsStatusDialogOpen(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleDisputePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files);
      setDisputePhotos([...disputePhotos, ...newPhotos]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const removeDisputePhoto = (index: number) => {
    setDisputePhotos(disputePhotos.filter((_, i) => i !== index));
  };

  const handleViewDispute = (shipmentId: string) => {
    setViewingDisputeShipment(shipmentId);
    setIsDisputeDialogOpen(true);
  };

  const handleViewClient = async (shipmentId: string) => {
    setClientInfo(null);
    setIsLoadingClient(true);
    setIsViewClientDialogOpen(true);
    try {
      const response = await viewShipmentClient({ shipmentId });
      setClientInfo(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch client information", {
        style: { background: "#ef4444", color: "#fff" },
      });
      setIsViewClientDialogOpen(false);
    } finally {
      setIsLoadingClient(false);
    }
  };

  const handleViewVehiclePhotos = (photos: string[]) => {
    setVehiclePhotos(photos);
    setCurrentPhotoIndex(0);
    setIsViewPhotosDialogOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedShipment || !newStatus) return;

    // Validation for DELIVERED status
    if (newStatus === "DELIVERED") {
      if (!keysGivenTo || keysGivenTo.trim() === "") {
        toast.error("Keys Given To is required for delivered status", {
          style: { background: "#ef4444", color: "#fff" },
        });
        return;
      }
      if (!vehicleDroppedAt || vehicleDroppedAt.trim() === "") {
        toast.error("Vehicle Dropped At is required for delivered status", {
          style: { background: "#ef4444", color: "#fff" },
        });
        return;
      }
      if (!photos || photos.length === 0) {
        toast.error("Delivery photos are required for delivered status", {
          style: { background: "#ef4444", color: "#fff" },
        });
        return;
      }
    }

    await mutateShipmentStatus({ 
      shipmentId: selectedShipment, 
      status: newStatus,
      keysGivenTo: keysGivenTo || undefined,
      vehicleDroppedAt: vehicleDroppedAt || undefined,
      photos: photos.length > 0 ? photos : undefined,
      issue: issue || undefined,
      disputePhotos: disputePhotos.length > 0 ? disputePhotos : undefined,
    });

    setIsStatusDialogOpen(false);
    setSelectedShipment(null);
    setNewStatus("");
    setKeysGivenTo("");
    setVehicleDroppedAt("");
    setPhotos([]);
    setIssue("");
    setDisputePhotos([]);
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
  const viewingDisputeShipmentData = shipments.find((s) => s._id === viewingDisputeShipment);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t("myShipments.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-destructive font-medium">{t("myShipments.error.title")}</p>
        <p className="text-muted-foreground text-sm mt-2">
          {error instanceof Error ? error.message : t("myShipments.error.unknown")}
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
          <h1 className="text-3xl font-bold tracking-tight">{t("myShipments.title")}</h1>
          <p className="text-muted-foreground">
            {t("myShipments.subtitle")}
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
            placeholder={t("myShipments.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("myShipments.filter.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("myShipments.filter.all")}</SelectItem>
            <SelectItem value="ASSIGNED">{t("myShipments.filter.assigned")}</SelectItem>
            <SelectItem value="IN_TRANSIT">{t("myShipments.filter.inTransit")}</SelectItem>
            <SelectItem value="DELIVERED">{t("myShipments.filter.delivered")}</SelectItem>
            <SelectItem value="COMPLETED">{t("myShipments.filter.completed")}</SelectItem>
            <SelectItem value="DISPUTED">{t("myShipments.filter.disputed")}</SelectItem>
            <SelectItem value="CANCELLED">{t("myShipments.filter.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Shipments List */}
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("myShipments.empty.title")}</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery || statusFilter !== "all"
                ? t("myShipments.empty.adjustFilters")
                : t("myShipments.empty.noShipments")}
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
              shipment.status !== "DISPUTED" &&
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
                            <img
                              src="/logo.png"
                              alt="BID4TOW"
                              className="h-10 w-10 object-contain"
                              draggable={false}
                            />
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
                                  <span className="text-muted-foreground/80">{t("myShipments.card.from")} </span>
                                  {formatLocation(shipment.pickupLocation)}
                                </span>
                              </div>
                              {shipment.pickupLocation.note && (
                                <p className="md:col-span-2 ml-6 text-xs text-muted-foreground/80 break-words">
                                  {t("myShipments.card.note")}{shipment.pickupLocation.note}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 opacity-60" />
                                <span>
                                  <span className="text-muted-foreground/80">{t("myShipments.card.to")} </span>
                                  {formatLocation(shipment.deliveryLocation)}
                                </span>
                              </div>
                              {shipment.deliveryLocation.note && (
                                <p className="md:col-span-2 ml-6 text-xs text-muted-foreground/80 break-words">
                                  {t("myShipments.card.note")}{shipment.deliveryLocation.note}
                                </p>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {t("myShipments.card.pickup")}{" "}
                                  {pickupStart ? format(pickupStart, "MMM d") : "—"} -{" "}
                                  {pickupEnd ? format(pickupEnd, "MMM d, yyyy") : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{t("myShipments.card.distance")}</span>
                                <span>
                                  {shipment.distance != null
                                    ? `${shipment.distance.toLocaleString()} km`
                                    : "—"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 md:col-span-2">
                                <span className="font-medium">{t("myShipments.card.winningBid")}</span>
                                <span className="font-semibold text-primary">
                                  {winningAmount != null ? `$${winningAmount.toLocaleString()}` : "—"}
                                </span>
                              </div>

                              {shipment.vehicleDetails.serialNumber && (
                                <div className="flex items-center gap-2 md:col-span-2">
                                  <span className="font-medium">{t("myShipments.card.serialNumber")}</span>
                                  <span>{shipment.vehicleDetails.serialNumber}</span>
                                </div>
                              )}

                              {(shipment.vehicleDetails.color ||
                                shipment.vehicleDetails.drivetrain ||
                                shipment.vehicleDetails.weight ||
                                shipment.vehicleDetails.size?.length ||
                                shipment.vehicleDetails.size?.width ||
                                shipment.vehicleDetails.size?.height ||
                                shipment.vehicleDetails.isAccidented ||
                                shipment.vehicleDetails.keysAvailable !== undefined ||
                                shipment.vehicleDetails.isRunning !== undefined) && (
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 md:col-span-2">
                                  <Badge
                                    variant={shipment.vehicleDetails.isRunning ? "default" : "secondary"}
                                  >
                                    {shipment.vehicleDetails.isRunning ? t("myShipments.card.running") : t("myShipments.card.notRunning")}
                                  </Badge>
                                  {shipment.vehicleDetails.isAccidented && (
                                    <Badge variant="secondary">{t("myShipments.card.accidented")}</Badge>
                                  )}
                                  {shipment.vehicleDetails.keysAvailable !== undefined && (
                                    <Badge
                                      variant={shipment.vehicleDetails.keysAvailable ? "default" : "secondary"}
                                    >
                                      {shipment.vehicleDetails.keysAvailable ? t("myShipments.card.keys") : t("myShipments.card.noKeys")}
                                    </Badge>
                                  )}
                                  {shipment.vehicleDetails.color && (
                                    <Badge variant="outline">{shipment.vehicleDetails.color}</Badge>
                                  )}
                                  {shipment.vehicleDetails.drivetrain && (
                                    <Badge variant="outline">{shipment.vehicleDetails.drivetrain}</Badge>
                                  )}
                                  {shipment.vehicleDetails.weight && (
                                    <Badge variant="outline">{shipment.vehicleDetails.weight} kg</Badge>
                                  )}
                                  {(shipment.vehicleDetails.size?.length ||
                                    shipment.vehicleDetails.size?.width ||
                                    shipment.vehicleDetails.size?.height) && (
                                    <Badge variant="outline">
                                      {shipment.vehicleDetails.size?.length ?? "—"}
                                      x
                                      {shipment.vehicleDetails.size?.width ?? "—"}
                                      x
                                      {shipment.vehicleDetails.size?.height ?? "—"} m
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-start sm:items-end">
                        {/* Show Client button - conditional display */}
                        {shipment.status !== "ENDED" && 
                         shipment.status !== "CANCELLED" && 
                         shipment.status !== "DRAFT" && 
                         shipment.status !== "LIVE" && 
                         !(shipment.status === "ASSIGNED" && shipment.escrowStatus !== "NONE") && (
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleViewClient(shipment._id)}
                          >
                            Show Client
                          </Button>
                        )}

                        {/* View Vehicle Photos button */}
                        {shipment.photos && shipment.photos.length > 0 && (
                          <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => handleViewVehiclePhotos(shipment.photos)}
                          >
                            View Vehicle Photos
                          </Button>
                        )}

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
                                {t("myShipments.card.updateStatus")}
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t("myShipments.statusDialog.title")}</DialogTitle>
                                <DialogDescription>
                                  {t("myShipments.statusDialog.description")}
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh]">
                                {selectedShipmentData && (
                                  <div className="space-y-4 pr-4">
                                    <div className="space-y-2">
                                      <Label>{t("myShipments.statusDialog.currentStatus")}</Label>
                                      <p className="text-sm font-medium">
                                        {statusConfig[selectedShipmentData.status]?.label}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="new-status">{t("myShipments.statusDialog.newStatus")}</Label>
                                      <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger id="new-status">
                                          <SelectValue placeholder={t("myShipments.statusDialog.selectStatus")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="EN_ROUTE">
                                            {t("myShipments.status.enRoute")}
                                          </SelectItem>
                                          <SelectItem value="IN_TRANSIT">
                                            {t("myShipments.status.inTransit")}
                                          </SelectItem>
                                          <SelectItem value="DELIVERED">
                                            {t("myShipments.status.delivered")}
                                          </SelectItem>
                                          <SelectItem value="DISPUTED">
                                            {t("myShipments.status.disputed")}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    {newStatus === "EN_ROUTE" && (
                                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                                          {t("myShipments.statusDialog.enRouteInfo")}
                                        </p>
                                      </div>
                                    )}
                                    {newStatus === "IN_TRANSIT" && (
                                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                          {t("myShipments.statusDialog.inTransitInfo")}
                                        </p>
                                      </div>
                                    )}
                                    {newStatus === "DELIVERED" && (
                                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-green-900 dark:text-green-100">
                                          {t("myShipments.statusDialog.deliveredInfo")}
                                        </p>
                                      </div>
                                    )}
                                    {newStatus === "DELIVERED" && (
                                      <div className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="keys-given-to">Keys Given To *</Label>
                                          <Input
                                            id="keys-given-to"
                                            value={keysGivenTo}
                                            onChange={(e) => setKeysGivenTo(e.target.value)}
                                            placeholder="Name of person who received the keys"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="vehicle-dropped-at">Vehicle Dropped At *</Label>
                                          <Input
                                            id="vehicle-dropped-at"
                                            value={vehicleDroppedAt}
                                            onChange={(e) => setVehicleDroppedAt(e.target.value)}
                                            placeholder="Specific location where vehicle was dropped"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="delivery-photos">Delivery Photos *</Label>
                                          <Input
                                            id="delivery-photos"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                            className="cursor-pointer"
                                          />
                                          <p className="text-xs text-muted-foreground">At least one photo is required</p>
                                          {photos.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                              {photos.map((photo, index) => (
                                                <div key={index} className="relative">
                                                  <img
                                                    src={URL.createObjectURL(photo)}
                                                    alt={`Delivery photo ${index + 1}`}
                                                    className="h-20 w-full rounded-md object-cover"
                                                  />
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -right-1 -top-1 h-5 w-5"
                                                    onClick={() => removePhoto(index)}
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    {newStatus === "DISPUTED" && (
                                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                                        <p className="text-sm text-red-900 dark:text-red-100">
                                          {t("myShipments.statusDialog.disputedInfo")}
                                        </p>
                                      </div>
                                    )}
                                    {newStatus === "DISPUTED" && (
                                      <div className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="issue-description">Issue Description</Label>
                                          <textarea
                                            id="issue-description"
                                            value={issue}
                                            onChange={(e) => setIssue(e.target.value)}
                                            placeholder="Please describe the issue in detail"
                                            rows={4}
                                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                            required
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="dispute-photos">Dispute Photos (Evidence)</Label>
                                          <Input
                                            id="dispute-photos"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleDisputePhotoUpload}
                                            className="cursor-pointer"
                                          />
                                          {disputePhotos.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                              {disputePhotos.map((photo, index) => (
                                                <div key={index} className="relative">
                                                  <img
                                                    src={URL.createObjectURL(photo)}
                                                    alt={`Dispute photo ${index + 1}`}
                                                    className="h-20 w-full rounded-md object-cover"
                                                  />
                                                  <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute -right-1 -top-1 h-5 w-5"
                                                    onClick={() => removeDisputePhoto(index)}
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </ScrollArea>
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsStatusDialogOpen(false);
                                    setSelectedShipment(null);
                                    setNewStatus("");
                                    setKeysGivenTo("");
                                    setVehicleDroppedAt("");
                                    setPhotos([]);
                                    setIssue("");
                                    setDisputePhotos([]);
                                  }}
                                >
                                  {t("myShipments.statusDialog.cancel")}
                                </Button>
                                <Button
                                  type="button"
                                  variant="hero"
                                  onClick={handleStatusSubmit}
                                  disabled={isUpdatingStatus}
                                >
                                  {isUpdatingStatus ? t("myShipments.statusDialog.updating") : t("myShipments.statusDialog.update")}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {shipment.status === "DISPUTED" && (
                          <Dialog
                            open={isDisputeDialogOpen && viewingDisputeShipment === shipment._id}
                            onOpenChange={setIsDisputeDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => handleViewDispute(shipment._id)}
                                className="w-full sm:w-auto"
                              >
                                View Dispute
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Dispute Details</DialogTitle>
                                <DialogDescription>
                                  Review the dispute information for this shipment
                                </DialogDescription>
                              </DialogHeader>
                              {viewingDisputeShipmentData?.disputeInfo && (
                                <div className="space-y-4">
                                  {viewingDisputeShipmentData.disputeInfo.issue && (
                                    <div className="space-y-2">
                                      <Label>Issue Description</Label>
                                      <div className="p-3 rounded-lg dark:bg-gray-900 border">
                                        <p className="text-sm">{viewingDisputeShipmentData.disputeInfo.issue}</p>
                                      </div>
                                    </div>
                                  )}
                                  {viewingDisputeShipmentData.disputeInfo.disputePhotos && 
                                   viewingDisputeShipmentData.disputeInfo.disputePhotos.length > 0 && (
                                    <div className="space-y-2">
                                      <Label>Dispute Photos</Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {viewingDisputeShipmentData.disputeInfo.disputePhotos.map((photo, index) => (
                                          <div key={index} className="relative">
                                            <img
                                              src={photo}
                                              alt={`Dispute photo ${index + 1}`}
                                              className="h-20 w-full rounded-md object-cover cursor-pointer"
                                              onClick={() => window.open(photo, '_blank')}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                              <DialogFooter>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsDisputeDialogOpen(false);
                                    setViewingDisputeShipment(null);
                                  }}
                                >
                                  Close
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        {!canUpdateStatus && shipment.status === "ASSIGNED" && (
                          <p className="text-xs sm:text-sm text-muted-foreground max-w-xs text-left sm:text-right">
                            {t("myShipments.card.waitingPayment")}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("myShipments.card.assignedDate")}</p>
                        <p className="text-sm font-medium">
                          {assignedAt ? format(assignedAt, "MMM d, yyyy") : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("myShipments.card.deliveryDeadline")}</p>
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

      {/* View Client Dialog */}
      <Dialog open={isViewClientDialogOpen} onOpenChange={setIsViewClientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Information</DialogTitle>
            <DialogDescription>
              View details of client for this shipment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isLoadingClient ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading client information...</p>
              </div>
            ) : clientInfo ? (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="p-3 border rounded-md bg-muted/50">
                    <p className="text-sm">{clientInfo.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="p-3 border rounded-md bg-muted/50">
                    <p className="text-sm">{clientInfo.phone_number}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-3">
                    {clientInfo.avatar ? (
                      <img
                        src={clientInfo.avatar}
                        alt="Client avatar"
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No avatar</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load client information</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsViewClientDialogOpen(false);
                setClientInfo(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Photos Dialog */}
      <Dialog open={isViewPhotosDialogOpen} onOpenChange={setIsViewPhotosDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vehicle Photos</DialogTitle>
            <DialogDescription>
              View all photos of the vehicle you are transporting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {vehiclePhotos.length > 0 ? (
              <>
                <div className="relative">
                  <img
                    src={vehiclePhotos[currentPhotoIndex]}
                    alt={`Vehicle photo ${currentPhotoIndex + 1}`}
                    className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
                  />
                  {vehiclePhotos.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => setCurrentPhotoIndex((prev) => prev === 0 ? vehiclePhotos.length - 1 : prev - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => setCurrentPhotoIndex((prev) => prev === vehiclePhotos.length - 1 ? 0 : prev + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                
                {vehiclePhotos.length > 1 && (
                  <div className="flex justify-center gap-2">
                    {vehiclePhotos.map((_, index) => (
                      <Button
                        key={index}
                        variant={index === currentPhotoIndex ? "default" : "outline"}
                        size="sm"
                        className="w-2 h-2 p-0"
                        onClick={() => setCurrentPhotoIndex(index)}
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-center text-sm text-muted-foreground">
                  Photo {currentPhotoIndex + 1} of {vehiclePhotos.length}
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No photos available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsViewPhotosDialogOpen(false);
                setVehiclePhotos([]);
                setCurrentPhotoIndex(0);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyShipments;
