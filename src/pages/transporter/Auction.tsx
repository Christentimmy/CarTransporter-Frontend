import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  MapPin,
  Calendar,
  Gavel,
  Clock,
  ArrowLeft,
  TrendingDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getShipmentBids, type ShipmentBidDto } from "@/services/shipmentService";
import {
  getAuctionSocket,
  joinAuction,
  disconnectAuctionSocket,
  type BidErrorPayload,
} from "@/services/auctionSocket";
import { getProfile } from "@/services/profileService";
import type { ListShipmentItem } from "@/types/shipment";
import { AuctionMap } from "@/components/AuctionMap";

// Mock data - replace with API call
const mockAuctionData = {
  _id: "1",
  vehicleDetails: {
    make: "Toyota",
    model: "Camry",
    year: 2024,
    isRunning: true,
    weight: 1500,
    size: {
      length: 4.9,
      width: 1.8,
      height: 1.4,
    },
  },
  pickupLocation: {
    address: "123 Main St",
    city: "New York",
    state: "NY",
    country: "USA",
    zipCode: "10001",
  },
  deliveryLocation: {
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    country: "USA",
    zipCode: "90001",
  },
  distance: 2789,
  estimatedTime: 2880, // minutes
  pickupWindow: {
    start: new Date("2024-02-15"),
    end: new Date("2024-02-17"),
  },
  deliveryDeadline: new Date("2024-02-25"),
  status: "LIVE",
  auctionStartTime: new Date("2024-02-10T10:00:00"),
  auctionEndTime: new Date("2024-02-14T18:00:00"),
  instantAcceptPrice: 1200,
  photos: [],
};

// Mock bids - replace with API call (sorted by amount ascending - lowest first)
const mockBids = [
  {
    _id: "bid5",
    amount: 850,
    bidder: {
      _id: "transporter5",
      company_name: "Premium Auto Transport",
    },
    placedAt: new Date("2024-02-14T15:10:00"),
    status: "PENDING",
  },
  {
    _id: "bid4",
    amount: 880,
    bidder: {
      _id: "transporter4",
      company_name: "Coast to Coast Transport",
    },
    placedAt: new Date("2024-02-14T15:15:00"),
    status: "PENDING",
  },
  {
    _id: "bid3",
    amount: 900,
    bidder: {
      _id: "transporter3",
      company_name: "Express Logistics",
    },
    placedAt: new Date("2024-02-14T15:20:00"),
    status: "PENDING",
  },
  {
    _id: "bid2",
    amount: 920,
    bidder: {
      _id: "transporter2",
      company_name: "Reliable Movers",
    },
    placedAt: new Date("2024-02-14T15:25:00"),
    status: "PENDING",
  },
  {
    _id: "bid1",
    amount: 950,
    bidder: {
      _id: "transporter1",
      company_name: "Fast Transport Co.",
    },
    placedAt: new Date("2024-02-14T15:30:00"),
    status: "PENDING",
  },
];

/** Normalize bid from socket or API to UI shape */
function normalizeBid(payload: unknown) {
  const p = payload as {
    _id?: string;
    amount?: number;
    bidder?: { _id?: string; company_name?: string } | string;
    company_name?: string;
    placedAt?: string;
    createdAt?: string;
    status?: string;
  };

  const bidderId = typeof p.bidder === "string" ? p.bidder : p.bidder?._id;
  const bidderName =
    typeof p.bidder === "string" ? p.company_name : p.bidder?.company_name;

  return {
    _id: p._id ?? `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    amount: p.amount ?? 0,
    bidder: {
      _id: bidderId ?? "unknown",
      company_name: bidderName ?? "Bidder",
    },
    placedAt: p.placedAt
      ? new Date(p.placedAt)
      : p.createdAt
        ? new Date(p.createdAt)
        : new Date(),
    status: (p.status ?? "PENDING"),
  };
}

const Auction = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState(mockBids);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);
  const [isEndingSoon, setIsEndingSoon] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const socketJoinedRef = useRef(false);

  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getProfile,
  });

  const myUserId = profileData?.data?._id;

  const shipmentFromState = (location.state as { shipment?: ListShipmentItem } | null)?.shipment;
  const auctionData = shipmentFromState;

  const auctionEndTime =
    auctionData.auctionEndTime != null
      ? new Date(auctionData.auctionEndTime)
      : mockAuctionData.auctionEndTime;

  const auctionStartTime =
    auctionData.auctionStartTime != null
      ? new Date(auctionData.auctionStartTime)
      : mockAuctionData.auctionStartTime;

  const instantAcceptPrice =
    typeof (auctionData as { instantAcceptPrice?: unknown }).instantAcceptPrice === "number"
      ? ((auctionData as { instantAcceptPrice: number }).instantAcceptPrice as number)
      : undefined;

  const pickupStart = new Date(auctionData.pickupWindow.start);
  const pickupEnd = new Date(auctionData.pickupWindow.end);
  const deliveryDeadline = new Date(auctionData.deliveryDeadline);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    getShipmentBids(id)
      .then((res) => {
        if (cancelled) return;
        const normalized = (res.data ?? [])
          .map((b: ShipmentBidDto) =>
            normalizeBid({
              _id: b._id,
              amount: b.amount,
              bidder: b.bidder,
              company_name: b.company_name,
              createdAt: b.createdAt,
              status: b.status,
            }),
          )
          .sort((a, b) => a.amount - b.amount);

        setBids(normalized);
      })
      .catch(() => {
        // Keep current UI; socket updates may still arrive
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Socket: connect, join auction, listen to new-bid and bid-error
  useEffect(() => {
    if (!id) return;

    const socket = getAuctionSocket();
    if (!socket) return;

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    const onNewBid = (payload: unknown) => {
      const nextBid = normalizeBid(payload);
      setBids((prev) => {
        if (prev.some((b) => b._id === nextBid._id)) return prev;
        return [...prev, nextBid].sort((a, b) => a.amount - b.amount);
      });
    };

    const onBidError = (payload: BidErrorPayload) => {
      toast.error(payload.message ?? "Bid failed", {
        style: { background: "#ef4444", color: "#fff" },
      });
    };

    const onAuctionEnded = () => {
      setIsAuctionEnded(true);
      setTimeRemaining("Auction Ended");
      toast("Auction ended", {
        description: "Bidding is now closed.",
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-bid", onNewBid);
    socket.on("bid-error", onBidError);
    socket.on("auction-ended", onAuctionEnded);

    if (!socketJoinedRef.current) {
      joinAuction(id);
      socketJoinedRef.current = true;
    }

    if (socket.connected) setIsSocketConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new-bid", onNewBid);
      socket.off("bid-error", onBidError);
      socket.off("auction-ended", onAuctionEnded);
      socketJoinedRef.current = false;
      disconnectAuctionSocket();
    };
  }, [id]);

  // Get lowest bid (winner in reverse auction)
  const lowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.amount)) : 0;
  const lowestBidData = bids.find((b) => b.amount === lowestBid);

  // Calculate time remaining
  useEffect(() => {
    if (isAuctionEnded) {
      setTimeRemaining("Auction Ended");
      setIsEndingSoon(false);
      return;
    }
    const updateTimer = () => {
      const now = new Date();
      const end = auctionEndTime;
      const diff = end.getTime() - now.getTime();

      setIsEndingSoon(diff > 0 && diff <= 5 * 60 * 1000);

      if (diff <= 0) {
        setTimeRemaining("Auction Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d ${hours % 24}h ${minutes}m`);
      } else {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [auctionEndTime, isAuctionEnded]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("Missing shipment id");
      return;
    }
    if (!bidAmount) return;

    const amount = Number(bidAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid bid amount");
      return;
    }

    const socket = getAuctionSocket();
    if (!socket) {
      toast.error("Failed to connect to auction server");
      return;
    }

    socket.emit("submit-bid", {
      shipmentId: id,
      amount,
    });

    setBidAmount("");
  };

  const getTimeRemaining = () => {
    if (isAuctionEnded) return false;
    const now = new Date();
    const end = auctionEndTime;
    const diff = end.getTime() - now.getTime();
    return diff > 0;
  };

  const parsedBidAmount = bidAmount ? Number(bidAmount) : NaN;
  const bidAmountCents = Number.isFinite(parsedBidAmount)
    ? Math.round(parsedBidAmount * 100)
    : NaN;

  const myBidAmountCentsSet = new Set<number>(
    myUserId
      ? bids
          .filter((b) => b.bidder?._id === myUserId)
          .map((b) => Math.round((b.amount ?? 0) * 100))
      : [],
  );

  const isDuplicateBid = Number.isFinite(bidAmountCents) && myBidAmountCentsSet.has(bidAmountCents);
  const isInvalidBid = !Number.isFinite(parsedBidAmount) || parsedBidAmount <= 0;
  const isNotBetterThanLowest = lowestBid > 0 && Number.isFinite(parsedBidAmount) && parsedBidAmount >= lowestBid;
  const isBidButtonDisabled = !getTimeRemaining() || isInvalidBid || isDuplicateBid || isNotBetterThanLowest;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/transporter/available-requests")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Live Auction</h1>
          <p className="text-muted-foreground">Bid on this vehicle transport request</p>
        </div>
        <Badge variant={isSocketConnected ? "default" : "secondary"} className="shrink-0">
          {isSocketConnected ? "Live" : "Connecting…"}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Request Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos Section - Full-width carousel */}
          {auctionData.photos && auctionData.photos.length > 0 && (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-video w-full">
                    <img
                      src={auctionData.photos[currentPhotoIndex]}
                      alt={`Vehicle photo ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {auctionData.photos.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={() => setCurrentPhotoIndex((prev) => (prev === 0 ? auctionData.photos.length - 1 : prev - 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                        onClick={() => setCurrentPhotoIndex((prev) => (prev === auctionData.photos.length - 1 ? 0 : prev + 1))}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {auctionData.photos.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentPhotoIndex ? "bg-white" : "bg-white/50"
                            }`}
                            onClick={() => setCurrentPhotoIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={() => window.open(auctionData.photos[currentPhotoIndex], '_blank')}
                  >
                    View Full Size
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicle Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">
                    {auctionData.vehicleDetails.year} {auctionData.vehicleDetails.make}{" "}
                    {auctionData.vehicleDetails.model}
                  </CardTitle>
                  <CardDescription>
                    <Badge
                      variant={(auctionData.vehicleDetails.isRunning ?? true) ? "default" : "secondary"}
                      className="mt-2"
                    >
                      {(auctionData.vehicleDetails.isRunning ?? true) ? "Running" : "Not Running"}
                    </Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Pickup Location</p>
                  <p className="text-sm font-medium">
                    {auctionData.pickupLocation.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {auctionData.pickupLocation.city}, {auctionData.pickupLocation.state}{" "}
                    {auctionData.pickupLocation.zipCode}
                  </p>
                  {auctionData.pickupLocation.note && (
                    <p className="text-sm text-muted-foreground">Note: {auctionData.pickupLocation.note}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Location</p>
                  <p className="text-sm font-medium">
                    {auctionData.deliveryLocation.address}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {auctionData.deliveryLocation.city}, {auctionData.deliveryLocation.state}{" "}
                    {auctionData.deliveryLocation.zipCode}
                  </p>
                  {auctionData.deliveryLocation.note && (
                    <p className="text-sm text-muted-foreground">Note: {auctionData.deliveryLocation.note}</p>
                  )}
                </div>
              </div>

              {(auctionData.vehicleDetails.color ||
                auctionData.vehicleDetails.drivetrain ||
                auctionData.vehicleDetails.weight != null ||
                auctionData.vehicleDetails.size?.length != null ||
                auctionData.vehicleDetails.size?.width != null ||
                auctionData.vehicleDetails.size?.height != null ||
                auctionData.vehicleDetails.isAccidented != null ||
                auctionData.vehicleDetails.keysAvailable != null ||
                auctionData.vehicleDetails.note) && (
                <div className="flex flex-wrap items-center gap-2">
                  {auctionData.vehicleDetails.isAccidented === true && (
                    <Badge variant="secondary">Accidented</Badge>
                  )}
                  {auctionData.vehicleDetails.keysAvailable != null && (
                    <Badge
                      variant={auctionData.vehicleDetails.keysAvailable ? "default" : "secondary"}
                    >
                      {auctionData.vehicleDetails.keysAvailable ? "Keys" : "No Keys"}
                    </Badge>
                  )}
                  {auctionData.vehicleDetails.color && (
                    <Badge variant="outline">{auctionData.vehicleDetails.color}</Badge>
                  )}
                  {auctionData.vehicleDetails.note && (
                    <Badge variant="secondary" className="max-w-full">
                      <span className="truncate" title={auctionData.vehicleDetails.note}>
                        Note: {auctionData.vehicleDetails.note}
                      </span>
                    </Badge>
                  )}
                  {auctionData.vehicleDetails.drivetrain && (
                    <Badge variant="outline">{auctionData.vehicleDetails.drivetrain}</Badge>
                  )}
                  {auctionData.vehicleDetails.weight != null && (
                    <Badge variant="outline">{auctionData.vehicleDetails.weight} kg</Badge>
                  )}
                  {(auctionData.vehicleDetails.size?.length != null ||
                    auctionData.vehicleDetails.size?.width != null ||
                    auctionData.vehicleDetails.size?.height != null) && (
                    <Badge variant="outline">
                      {(auctionData.vehicleDetails.size?.length ?? "—")}
                      x
                      {(auctionData.vehicleDetails.size?.width ?? "—")}
                      x
                      {(auctionData.vehicleDetails.size?.height ?? "—")} m
                    </Badge>
                  )}
                </div>
              )}

              <Separator />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Distance</p>
                  <p className="font-medium">{auctionData.distance.toLocaleString()} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Pickup Window</p>
                  <p className="font-medium">
                    {format(pickupStart, "MMM d")} - {format(pickupEnd, "MMM d")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Delivery Deadline</p>
                  <p className="font-medium">
                    {format(deliveryDeadline, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Bid History
              </CardTitle>
              <CardDescription>
                All bids placed on this request (lowest bid wins - sorted by amount)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {bids.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Gavel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No bids yet. Be the first to bid!</p>
                    </div>
                  ) : (
                    bids.map((bid, index) => (
                      <motion.div
                        key={bid._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index === 0 ? "bg-primary/5 border-primary/30" : "bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              index === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index === 0 ? (
                              <TrendingDown className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-bold">#{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">
                              ${bid.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                              {/* <p className="text-sm text-muted-foreground">
                                {bid.bidder.company_name}
                              </p> */}
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(bid.placedAt, { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        {index === 0 && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Lowest
                          </Badge>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bidding Panel */}
        <div className="space-y-6">
          {/* Auction Timer */}
          <Card
            className={
              isEndingSoon
                ? "border-red-500/60 bg-red-500/10 animate-pulse"
                : "border-primary/30 bg-primary/5"
            }
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p
                  className={
                    isEndingSoon
                      ? "text-3xl font-bold mb-2 text-red-600 animate-pulse"
                      : "text-3xl font-bold mb-2"
                  }
                >
                  {timeRemaining}
                </p>
                <p className="text-sm text-muted-foreground">
                  Auction ends: {format(auctionEndTime, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Instant Accept */}
          {instantAcceptPrice != null && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Instant Accept Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">
                  ${instantAcceptPrice.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Bid this amount to instantly win the request
                </p>
              </CardContent>
            </Card>
          )}

          {/* Bid Form */}
          <Card>
            <CardHeader>
              <CardTitle>Place Your Bid</CardTitle>
              <CardDescription>
                Enter your bid amount (must be higher than current highest bid)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bid-amount">Bid Amount ($)</Label>
                  <Input
                    id="bid-amount"
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="Enter bid amount"
                    max={lowestBid > 0 ? lowestBid - 0.01 : undefined}
                    step="0.01"
                    required
                    disabled={!getTimeRemaining()}
                  />
                  {lowestBid > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Your bid must be lower than ${lowestBid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to win
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isBidButtonDisabled}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Submit Bid
                </Button>
                {isDuplicateBid && (
                  <p className="text-xs text-center text-muted-foreground">
                    You already placed this exact bid amount.
                  </p>
                )}
                {!getTimeRemaining() && (
                  <p className="text-xs text-center text-muted-foreground">
                    This auction has ended
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Route Map */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Route Map
              </CardTitle>
              <CardDescription>
                Pickup and delivery locations for this shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuctionMap
                pickupLocation={auctionData.pickupLocation}
                deliveryLocation={auctionData.deliveryLocation}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auction;
