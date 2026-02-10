import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Calendar,
  Gavel,
  Search,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { getAuctionSocket } from "@/services/auctionSocket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getListShipments } from "@/services/shipmentService";
import type { ListShipmentItem } from "@/types/shipment";
import { useTranslation } from "react-i18next";

function formatLocation(loc: ListShipmentItem["pickupLocation"]) {
  if (loc.address) return loc.address;
  const parts = [loc.city, loc.state, loc.country].filter(Boolean);
  return parts.length ? parts.join(", ") : loc.country || "—";
}

function parseDate(dateStr: string) {
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

function getTimeRemaining(endTimeStr: string, t: (key: string) => string) {
  const endTime = parseDate(endTimeStr);
  if (!endTime) return "—";
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();
  if (diff <= 0) return t("availableRequests.card.ended");
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} ${t("availableRequests.card.daysLeft")}`;
  }
  return `${hours}h ${minutes}m ${t("availableRequests.card.hoursLeft")}`;
}

const AvailableRequests = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  const handleViewAuction = (shipment: ListShipmentItem) => {
    if (shipment.status !== "LIVE") {
      toast.error(t("availableRequests.toast.auctionNotLive"));
      return;
    }
    const shipmentId = shipment._id;
    const s = getAuctionSocket();
    if (!s) {
      toast.error(t("availableRequests.toast.connectionFailed"));
      return;
    }

    s.emit("join-auction", { shipmentId });

    const handleNewBid = (data: unknown) => {
      console.log("New bid:", data);
    };

    const handleBidError = (error: unknown) => {
      console.error("Bid error:", error);
      if (error && typeof error === "object" && "message" in error) {
        toast.error(String((error as { message?: unknown }).message ?? t("availableRequests.toast.bidError")));
      } else {
        toast.error(t("availableRequests.toast.bidError"));
      }
    };

    s.off("new-bid");
    s.off("bid-error");
    s.on("new-bid", handleNewBid);
    s.on("bid-error", handleBidError);

    navigate(`/transporter/auction/${shipmentId}`, {
      state: { shipment },
    });
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["list-shipments", page, limit],
    queryFn: () => getListShipments({ page, limit }),
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
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{t("availableRequests.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t("availableRequests.error.title")}</h3>
          <p className="text-muted-foreground text-center mb-4">
            {error instanceof Error ? error.message : t("availableRequests.error.somethingWrong")}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            {t("availableRequests.error.retry")}
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
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("availableRequests.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("availableRequests.subtitle")}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-4"
      >
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground shrink-0" />
          <Input
            placeholder={t("availableRequests.search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* Requests List */}
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("availableRequests.empty.title")}</h3>
            <p className="text-muted-foreground text-center">
              {searchQuery
                ? t("availableRequests.empty.adjustSearch")
                : t("availableRequests.empty.noRequests")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
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
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                              <CardTitle className="text-base sm:text-xl truncate">
                                {request.vehicleDetails.year} {request.vehicleDetails.make}{" "}
                                {request.vehicleDetails.model}
                              </CardTitle>
                              {request.auctionEndTime && request.status === "LIVE" && (
                                <Badge variant="default" className="flex items-center gap-1 shrink-0">
                                  <Clock className="h-3 w-3" />
                                  {getTimeRemaining(request.auctionEndTime, t)}
                                </Badge>
                              )}
                              {request.status === "DRAFT" && (
                                <Badge variant="secondary" className="shrink-0">
                                  {t("availableRequests.card.draft")}
                                </Badge>
                              )}
                              {request.status === "DRAFT" && request.auctionStartTime && (
                                <Badge variant="outline" className="flex items-center gap-1 shrink-0">
                                  <Clock className="h-3 w-3" />
                                  <span className="truncate">
                                    {t("availableRequests.card.starts")} {format(parseDate(request.auctionStartTime)!, "MMM d, yyyy h:mm a")}
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex gap-2 min-w-0">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
                                <span className="break-words line-clamp-2 min-w-0">
                                  <span className="text-muted-foreground/80">{t("availableRequests.card.from")} </span>
                                  {formatLocation(request.pickupLocation)}
                                </span>
                              </div>
                              {request.pickupLocation.note && (
                                <p className="ml-5 text-xs text-muted-foreground/80 break-words">
                                  {t("availableRequests.card.note")}{request.pickupLocation.note}
                                </p>
                              )}
                              <div className="flex gap-2 min-w-0">
                                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5 opacity-60" />
                                <span className="break-words line-clamp-2 min-w-0">
                                  <span className="text-muted-foreground/80">{t("availableRequests.card.to")} </span>
                                  {formatLocation(request.deliveryLocation)}
                                </span>
                              </div>
                              {request.deliveryLocation.note && (
                                <p className="ml-5 text-xs text-muted-foreground/80 break-words">
                                  {t("availableRequests.card.note")}{request.deliveryLocation.note}
                                </p>
                              )}
                              <div className="flex items-center gap-2 pt-0.5 min-w-0">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span>
                                  {t("availableRequests.card.pickup")}{" "}
                                  {parseDate(request.pickupWindow.start)
                                    ? format(parseDate(request.pickupWindow.start)!, "MMM d")
                                    : "—"}{" "}
                                  –{" "}
                                  {parseDate(request.pickupWindow.end)
                                    ? format(parseDate(request.pickupWindow.end)!, "MMM d, yyyy")
                                    : "—"}
                                </span>
                              </div>
                              {request.distance != null && (
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-foreground/80">{t("availableRequests.card.distance")}</span>
                                  <span>{request.distance.toLocaleString()} km</span>
                                </div>
                              )}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground/80">{t("availableRequests.card.vehicle")}</span>
                                <Badge
                                  variant={(request.vehicleDetails.isRunning ?? true) ? "default" : "secondary"}
                                >
                                  {(request.vehicleDetails.isRunning ?? true) ? t("availableRequests.card.running") : t("availableRequests.card.notRunning")}
                                </Badge>
                                {request.vehicleDetails.isAccidented === true && (
                                  <Badge variant="secondary">{t("availableRequests.card.accidented")}</Badge>
                                )}
                                {request.vehicleDetails.keysAvailable != null && (
                                  <Badge
                                    variant={request.vehicleDetails.keysAvailable ? "default" : "secondary"}
                                  >
                                    {request.vehicleDetails.keysAvailable ? t("availableRequests.card.keys") : t("availableRequests.card.noKeys")}
                                  </Badge>
                                )}
                                {request.vehicleDetails.color && (
                                  <Badge variant="outline">{request.vehicleDetails.color}</Badge>
                                )}
                                {request.vehicleDetails.drivetrain && (
                                  <Badge variant="outline">{request.vehicleDetails.drivetrain}</Badge>
                                )}
                                {request.vehicleDetails.weight != null && (
                                  <Badge variant="outline">{request.vehicleDetails.weight} kg</Badge>
                                )}
                                {(request.vehicleDetails.size?.length != null ||
                                  request.vehicleDetails.size?.width != null ||
                                  request.vehicleDetails.size?.height != null) && (
                                  <Badge variant="outline">
                                    {(request.vehicleDetails.size?.length ?? "—")}
                                    x
                                    {(request.vehicleDetails.size?.width ?? "—")}
                                    x
                                    {(request.vehicleDetails.size?.height ?? "—")} m
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        {request.status === "LIVE" && (
                          <Button
                            variant="hero"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => handleViewAuction(request)}
                          >
                            <Gavel className="mr-2 h-4 w-4 shrink-0" />
                            {t("availableRequests.card.viewAuction")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-2 sm:gap-4 pt-3 sm:pt-4 border-t">
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                          {t("availableRequests.card.currentBid")}
                        </p>
                        <p className="text-sm sm:text-lg font-semibold">
                          ${request.currentBid?.amount.toLocaleString() ?? t("availableRequests.card.noBids")}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                          {t("availableRequests.card.deliveryDeadline")}
                        </p>
                        <p className="text-xs sm:text-sm font-medium">
                          {parseDate(request.deliveryDeadline)
                            ? format(parseDate(request.deliveryDeadline)!, "MMM d, yyyy")
                            : "—"}
                        </p>
                      </div>
                      {request.estimatedTime != null && (
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-0.5 sm:mb-1">
                            Est. Time
                          </p>
                          <p className="text-xs sm:text-sm font-medium">
                            ~{Math.round(request.estimatedTime / 60)} hrs
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
    </div>
  );
};

export default AvailableRequests;
