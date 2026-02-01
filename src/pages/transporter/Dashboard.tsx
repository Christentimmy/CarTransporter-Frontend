import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Gavel, Package, DollarSign, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { dashboardService, type TransporterDashboardStats } from "@/services/dashboard_services";
import { toast } from "sonner";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<TransporterDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getTransporterDashboard();
        setDashboardData(data);
      } catch (error) {
        toast.error("Failed to load dashboard data", {
          style: { background: "#ef4444", color: "#ffffff" },
        });
        console.error("Error fetching transporter dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Active Bids",
      value: dashboardData?.activeBids?.toString() ?? "0",
      description: "Bids submitted",
      icon: Gavel,
      color: "text-blue-500",
    },
    {
      title: "Won Bids",
      value: dashboardData?.wonBids?.toString() ?? "0",
      description: "Accepted bids",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Active Shipments",
      value: dashboardData?.activeShipments?.toString() ?? "0",
      description: "In transit",
      icon: Package,
      color: "text-orange-500",
    },
    {
      title: "Total Earnings",
      value: dashboardData?.totalRevenue != null ? `$${dashboardData.totalRevenue.toLocaleString()}` : "$0",
      description: "This month",
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  const renderRecentBids = () => {
    if (isLoading) return null;

    const bids = dashboardData?.recentBids ?? [];
    if (bids.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          No recent bids found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {bids.map((bid, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Gavel className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {bid.vehicleName ?? "Vehicle transport"}
              </p>
              <p className="text-xs text-muted-foreground">
                {bid.amount != null ? `Bid: $${bid.amount}` : "Bid: N/A"} • {bid.status ?? "Pending"}
              </p>
            </div>
            {bid.date && (
              <p className="text-xs text-muted-foreground shrink-0">{bid.date}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back! Here's an overview of your transporter activity.
        </p>
      </motion.div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${stat.color} flex-shrink-0`} />
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bids</CardTitle>
                  <CardDescription>
                    Your latest bid submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRecentBids()}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/transporter/available-requests">
                      <Button variant="outline" className="w-full justify-start">
                        <Search className="mr-2 h-4 w-4" />
                        Browse Available Requests
                      </Button>
                    </Link>
                    <Link to="/transporter/my-bids">
                      <Button variant="outline" className="w-full justify-start">
                        <Gavel className="mr-2 h-4 w-4" />
                        View My Bids
                      </Button>
                    </Link>
                    <Link to="/transporter/my-shipments">
                      <Button variant="outline" className="w-full justify-start">
                        <Package className="mr-2 h-4 w-4" />
                        Track Shipments
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
