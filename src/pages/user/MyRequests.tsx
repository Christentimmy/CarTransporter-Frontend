import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Calendar,
  Gavel,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getMyShipments, processPayment } from "@/services/shipmentService";
import type { MyShipment } from "@/types/shipment";

declare global {
  interface Window {
    Square?: unknown;
  }
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }
> = {
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

const getEscrowStatusLabel = (escrowStatus?: MyShipment["escrowStatus"]) => {
  switch (escrowStatus) {
    case "PAID_IN_ESCROW":
      return "Paid in escrow";
    case "PAID_OUT":
      return "Paid out";
    case "REFUNDED":
      return "Refunded";
    case "NONE":
    case undefined:
    default:
      return "Awaiting payment";
  }
};

function formatLocation(loc: MyShipment["pickupLocation"]) {
  if (loc.address) return loc.address;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.length ? parts.join(", ") : loc.country || "—";
}

const MyRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedShipmentForPayment, setSelectedShipmentForPayment] = useState<MyShipment | null>(null);
  const [isPaymentReady, setIsPaymentReady] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const queryClient = useQueryClient();
  const limit = 10;

  const squareCardRef = useRef<unknown>(null);
  const squarePaymentsRef = useRef<unknown>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["my-shipments", page, limit],
    queryFn: () => getMyShipments({ page, limit }),
  });

  const shipments = data?.data ?? [];
  const pagination = data?.pagination;

  const filteredShipments = shipments.filter((request) => {
    const matchesSearch =
      searchQuery === "" ||
      `${request.vehicleDetails.make} ${request.vehicleDetails.model}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      formatLocation(request.pickupLocation).toLowerCase().includes(searchQuery.toLowerCase()) ||
      formatLocation(request.deliveryLocation).toLowerCase().includes(searchQuery.toLowerCase());
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

  const parseDate = (dateStr: string) => {
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!isPayDialogOpen) {
      squareCardRef.current = null;
      squarePaymentsRef.current = null;
      setIsPaymentReady(false);
      return;
    }

    const sanitizeEnv = (v?: string) => {
      if (!v) return "";
      const trimmed = v.trim();
      if (
        (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ) {
        return trimmed.slice(1, -1).trim();
      }
      return trimmed;
    };

    const appId = sanitizeEnv(import.meta.env.VITE_SQUARE_APP_ID as string | undefined);
    const locationId = sanitizeEnv(import.meta.env.VITE_SQUARE_LOCATION_ID as string | undefined);

    const isAppIdValid = /^(sandbox-sq0idb-|sq0idp-)/.test(appId);
    const isLocationIdValid = /^L[A-Z0-9]+$/.test(locationId);

    if (!appId || !locationId) {
      toast.error("Square payment is not configured", {
        style: { background: "#ef4444", color: "#fff" },
      });
      setIsPayDialogOpen(false);
      return;
    }

    if (!isAppIdValid) {
      toast.error("Square applicationId is invalid", {
        description: "Expected something like sandbox-sq0idb-... (sandbox) or sq0idp-... (production).",
        style: { background: "#ef4444", color: "#fff" },
      });
      setIsPayDialogOpen(false);
      return;
    }

    if (!isLocationIdValid) {
      toast.error("Square locationId is invalid", {
        description: "Location IDs usually start with L (e.g. LHKVK9WN372RF).",
        style: { background: "#ef4444", color: "#fff" },
      });
      setIsPayDialogOpen(false);
      return;
    }

    let cancelled = false;

    const loadSquareScript = async () => {
      const isSandbox = appId.startsWith("sandbox-");
      const desiredSrc = isSandbox
        ? "https://sandbox.web.squarecdn.com/v1/square.js"
        : "https://web.squarecdn.com/v1/square.js";

      await new Promise<void>((resolve, reject) => {
        const existing = document.querySelector(
          'script[data-square="web-payments"]',
        ) as HTMLScriptElement | null;
        if (existing) {
          if (existing.src === desiredSrc) {
            resolve();
            return;
          }

          toast.error("Square SDK environment mismatch", {
            description:
              "Reloading the correct Square script. If you still see this, hard refresh the page.",
            style: { background: "#ef4444", color: "#fff" },
          });

          try {
            existing.remove();
          } catch {
            // ignore
          }
        }

        const script = document.createElement("script");
        script.src = desiredSrc;
        script.async = true;
        script.dataset.square = "web-payments";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Square SDK"));
        document.body.appendChild(script);
      });
    };

    const setupCard = async () => {
      try {
        setIsPaymentReady(false);
        await loadSquareScript();
        if (cancelled) return;

        const SquareAny = window.Square as any;
        if (!SquareAny?.payments) throw new Error("Square payments SDK not available");

        const payments = await SquareAny.payments(appId, locationId);
        if (cancelled) return;

        const card = await payments.card();
        if (cancelled) return;

        const container = document.getElementById("square-card-container");
        if (!container) throw new Error("Card container not found");

        container.innerHTML = "";
        await card.attach("#square-card-container");

        squarePaymentsRef.current = payments;
        squareCardRef.current = card;
        setIsPaymentReady(true);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to initialize payment", {
          style: { background: "#ef4444", color: "#fff" },
        });
        setIsPayDialogOpen(false);
      }
    };

    void setupCard();

    return () => {
      cancelled = true;
      const card = squareCardRef.current as any;
      if (card?.destroy) {
        try {
          card.destroy();
        } catch {
          // ignore
        }
      }
      squareCardRef.current = null;
      squarePaymentsRef.current = null;
      setIsPaymentReady(false);
    };
  }, [isPayDialogOpen]);

  const handlePayNow = async () => {
    if (!selectedShipmentForPayment) return;
    if (isProcessingPayment) return;

    const card = squareCardRef.current as any;
    if (!card?.tokenize) {
      toast.error("Payment form not ready", {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    try {
      setIsProcessingPayment(true);
      const result = await card.tokenize();
      if (result?.status !== "OK" || !result?.token) {
        throw new Error(result?.errors?.[0]?.message ?? "Failed to tokenize card");
      }

      const sourceId = result.token as string;
      
      // Process the payment with the shipmentId and sourceId
      await processPayment({
        shipmentId: selectedShipmentForPayment._id,
        sourceId: sourceId,
      });

      toast.success("Payment processed successfully!", {
        style: { background: "#22c55e", color: "#fff" },
      });

      // Close the dialog and reset state
      setIsPayDialogOpen(false);
      setSelectedShipmentForPayment(null);

      // Refresh the shipments list to show updated status
      await queryClient.invalidateQueries({ queryKey: ["myShipments"] });
    } catch (e) {
      console.error("Payment error:", e);
      toast.error(e instanceof Error ? e.message : "Payment processing failed", {
        style: { background: "#ef4444", color: "#fff" },
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your requests...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to load requests</h3>
          <p className="text-muted-foreground text-center mb-4">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-3xl">My Requests</h1>
          <p className="text-xs text-muted-foreground sm:text-base">
            View and manage your transport requests
          </p>
        </div>
        <Link to="/user/post-request" className="w-full sm:w-auto shrink-0">
          <Button variant="hero" className="w-full sm:w-auto" size="sm">
            <Plus className="mr-2 h-4 w-4 shrink-0" />
            New Request
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:gap-4"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-muted-foreground" />
          <Input
            placeholder="Search vehicle, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-9 sm:h-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:h-10 sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4 shrink-0" />
            <SelectValue placeholder="Status" />
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
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No requests found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first vehicle transport request"}
            </p>
            {!searchQuery && statusFilter === "all" && (
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
        <>
          <div className="grid gap-3 sm:gap-4">
            {filteredShipments.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="min-w-0"
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-3 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex gap-3 sm:gap-4">
                          {request.photos?.[0] ? (
                            <img
                              src={request.photos[0]}
                              alt={`${request.vehicleDetails.make} ${request.vehicleDetails.model}`}
                              className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                              <Truck className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
                              <CardTitle className="text-base sm:text-xl truncate">
                                {request.vehicleDetails.year} {request.vehicleDetails.make}{" "}
                                {request.vehicleDetails.model}
                              </CardTitle>
                              {getStatusBadge(request.status)}
                            </div>
                            {request.status === "ASSIGNED" && (
                              <p className="text-xs text-muted-foreground mb-1">
                                Payment status: {getEscrowStatusLabel(request.escrowStatus)}
                              </p>
                            )}
                            {/* Mobile: stack pickup → delivery on two lines */}
                            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex gap-2 min-w-0">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                <span className="break-words line-clamp-2 min-w-0">
                                  <span className="text-muted-foreground/80">From </span>
                                  {formatLocation(request.pickupLocation)}
                                </span>
                              </div>
                              <div className="flex gap-2 min-w-0">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 opacity-60" />
                                <span className="break-words line-clamp-2 min-w-0">
                                  <span className="text-muted-foreground/80">To </span>
                                  {formatLocation(request.deliveryLocation)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 pt-0.5 min-w-0">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>
                                  Pickup:{" "}
                                  {parseDate(request.pickupWindow.start)
                                    ? format(parseDate(request.pickupWindow.start)!, "MMM d")
                                    : "—"}{" "}
                                  –{" "}
                                  {parseDate(request.pickupWindow.end)
                                    ? format(parseDate(request.pickupWindow.end)!, "MMM d, yyyy")
                                    : "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {request.status === "LIVE" && (
                        <Link
                          to={`/user/auction/${request._id}`}
                          state={{ shipment: request }}
                          className="w-full sm:w-auto shrink-0"
                        >
                          <Button variant="hero" size="sm" className="w-full sm:w-auto">
                            <Gavel className="mr-2 h-4 w-4 shrink-0" />
                            View Live Auction
                          </Button>
                        </Link>
                      )}

                      {request.status === "ASSIGNED" && request.escrowStatus !== "PAID_IN_ESCROW" && (
                        <Button
                          type="button"
                          variant="hero"
                          size="sm"
                          className="w-full sm:w-auto shrink-0"
                          onClick={() => {
                            setSelectedShipmentForPayment(request);
                            setIsPayDialogOpen(true);
                          }}
                        >
                          Pay now
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Delivery Deadline</p>
                        <p className="text-xs sm:text-sm font-medium truncate" title={parseDate(request.deliveryDeadline) ? format(parseDate(request.deliveryDeadline)!, "MMM d, yyyy") : undefined}>
                          {parseDate(request.deliveryDeadline)
                            ? format(parseDate(request.deliveryDeadline)!, "MMM d, yyyy")
                            : "—"}
                        </p>
                      </div>
                      {request.distance != null && (
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Distance</p>
                          <p className="text-xs sm:text-sm font-medium">
                            {(request.distance / 1000).toFixed(1)} km
                          </p>
                        </div>
                      )}
                      {request.estimatedTime != null && (
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Est. Time</p>
                          <p className="text-xs sm:text-sm font-medium">
                            ~{Math.round(request.estimatedTime / 60)} hrs
                          </p>
                        </div>
                      )}
                      {request.status === "DRAFT" && request.auctionStartTime && (
                        <div className="min-w-0 col-span-2 md:col-span-1">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Auction Starts</p>
                          <p className="text-xs sm:text-sm font-medium break-words">
                            {parseDate(request.auctionStartTime)
                              ? format(parseDate(request.auctionStartTime)!, "MMM d, h:mm a")
                              : "—"}
                          </p>
                        </div>
                      )}
                      {request.status === "LIVE" && request.auctionEndTime && (
                        <div className="min-w-0 col-span-2 md:col-span-1">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">Auction Ends</p>
                          <p className="text-xs sm:text-sm font-medium break-words">
                            {parseDate(request.auctionEndTime)
                              ? format(parseDate(request.auctionEndTime)!, "MMM d, h:mm a")
                              : "—"}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-4 px-1"
            >
              <Pagination>
                <PaginationContent className="flex-wrap justify-center gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasPrevPage) setPage((p) => p - 1);
                      }}
                      className={
                        !pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                        isActive={p === pagination.page}
                        className="min-w-9"
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.hasNextPage) setPage((p) => p + 1);
                      }}
                      className={
                        !pagination.hasNextPage ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </motion.div>
          )}
        </>
      )}

      <Dialog
        open={isPayDialogOpen}
        onOpenChange={(open) => {
          setIsPayDialogOpen(open);
          if (!open) setSelectedShipmentForPayment(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay for shipment</DialogTitle>
            <DialogDescription>
              Enter your card details to pay for this assigned shipment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {selectedShipmentForPayment && (
              <div className="rounded-md border p-3 text-sm">
                <p className="font-medium mb-1">Payment summary</p>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipment amount</span>
                  <span>
                    {selectedShipmentForPayment.currentBid?.amount != null
                      ? `$${selectedShipmentForPayment.currentBid.amount.toLocaleString()}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground mt-1">
                  <span>Platform fee (10%)</span>
                  <span>
                    {selectedShipmentForPayment.currentBid?.amount != null
                      ? `$${(selectedShipmentForPayment.currentBid.amount * 0.1).toFixed(2)}`
                      : "—"}
                  </span>
                </div>
                <div className="mt-2 border-t pt-2 flex items-center justify-between">
                  <span className="font-semibold">Total to pay</span>
                  <span className="font-semibold">
                    {selectedShipmentForPayment.currentBid?.amount != null
                      ? `$${(selectedShipmentForPayment.currentBid.amount * 1.1).toFixed(2)}`
                      : "—"}
                  </span>
                </div>
              </div>
            )}
            <div className="rounded-md border p-3">
              <div id="square-card-container" />
            </div>

            {!isPaymentReady && (
              <p className="text-sm text-muted-foreground">Loading payment form...</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="hero"
              onClick={handlePayNow}
              disabled={!isPaymentReady || isProcessingPayment}
            >
              {isProcessingPayment ? "Processing..." : "Pay now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRequests;
