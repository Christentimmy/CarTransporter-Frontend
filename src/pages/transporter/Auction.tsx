import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Calendar,
  Gavel,
  Clock,
  ArrowLeft,
  TrendingDown,
  Users,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getAuctionSocket,
  joinAuction,
  disconnectAuctionSocket,
  type NewBidPayload,
  type BidErrorPayload,
} from "@/services/auctionSocket";
import type { ListShipmentItem } from "@/types/shipment";

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
function normalizeBid(payload: NewBidPayload) {
  return {
    _id: payload._id ?? `bid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    amount: payload.amount,
    bidder: {
      _id: payload.bidder?._id ?? "unknown",
      company_name: payload.bidder?.company_name ?? "Bidder",
    },
    placedAt: payload.placedAt ? new Date(payload.placedAt) : new Date(),
    status: "PENDING" as const,
  };
}

const Auction = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState(mockBids);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketJoinedRef = useRef(false);

  const shipmentFromState = (location.state as { shipment?: ListShipmentItem } | null)?.shipment;
  const auctionData = shipmentFromState ?? mockAuctionData;

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

  const currentBid = (auctionData as { currentBid?: { amount: number; bidder: string; placedAt: string } })
    .currentBid;

  const pickupStart = new Date(auctionData.pickupWindow.start);
  const pickupEnd = new Date(auctionData.pickupWindow.end);
  const deliveryDeadline = new Date(auctionData.deliveryDeadline);

  // Socket: connect, join auction, listen to new-bid and bid-error
  useEffect(() => {
    if (!id) return;

    const socket = getAuctionSocket();
    if (!socket) return;

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    const onNewBid = (payload: NewBidPayload) => {
      setBids((prev) => [...prev, normalizeBid(payload)].sort((a, b) => a.amount - b.amount));
    };

    const onBidError = (payload: BidErrorPayload) => {
      toast.error(payload.message ?? "Bid failed", {
        style: { background: "#ef4444", color: "#fff" },
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new-bid", onNewBid);
    socket.on("bid-error", onBidError);

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
      socketJoinedRef.current = false;
      disconnectAuctionSocket();
    };
  }, [id]);

  // Get lowest bid (winner in reverse auction)
  const lowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.amount)) : 0;
  const lowestBidData = bids.find((b) => b.amount === lowestBid);

  // Calculate time remaining
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const end = auctionEndTime;
      const diff = end.getTime() - now.getTime();

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
  }, [auctionEndTime]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount) return;

    const newBid = {
      _id: `bid${Date.now()}`,
      amount: parseFloat(bidAmount),
      bidder: {
        _id: "current_user",
        company_name: "Your Company",
      },
      placedAt: new Date(),
      status: "PENDING",
    };

    // TODO: Make API call to submit bid
    console.log("Submitting bid:", newBid);

    // Add bid to list (sorted by amount ascending - lowest first)
    setBids((prev) => [...prev, newBid].sort((a, b) => a.amount - b.amount));
    setBidAmount("");

    // Show success toast
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = auctionEndTime;
    const diff = end.getTime() - now.getTime();
    return diff > 0;
  };

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
                    <Badge variant={auctionData.vehicleDetails.isRunning ? "default" : "secondary"} className="mt-2">
                      {auctionData.vehicleDetails.isRunning ? "Running" : "Not Running"}
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
                </div>
              </div>
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
                            <p className="text-sm text-muted-foreground">
                              {bid.bidder.company_name}
                            </p>
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
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold mb-2">{timeRemaining}</p>
                <p className="text-sm text-muted-foreground">
                  Auction ends: {format(auctionEndTime, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Lowest Bid */}
          {currentBid && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Lowest Bid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-3xl font-bold mb-2">
                    ${currentBid.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(currentBid.placedAt), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
                  disabled={!getTimeRemaining()}
                >
                  <Gavel className="mr-2 h-4 w-4" />
                  Submit Bid
                </Button>
                {!getTimeRemaining() && (
                  <p className="text-xs text-center text-muted-foreground">
                    This auction has ended
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Auction Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Bids</span>
                <span className="text-sm font-medium">{bids.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bidders</span>
                <span className="text-sm font-medium">
                  {new Set(bids.map((b) => b.bidder._id)).size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Started</span>
                <span className="text-sm font-medium">
                  {format(auctionStartTime, "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auction;
