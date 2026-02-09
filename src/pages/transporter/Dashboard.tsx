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
      title: "Pending Requests",
      value: dashboardData?.pendingRequest?.toString() ?? "0",
      description: "Awaiting your bid",
      icon: Gavel,
      color: "text-blue-500",
    },
    {
      title: "Completed Requests",
      value: dashboardData?.completedRequest?.toString() ?? "0",
      description: "Successfully delivered",
      icon: CheckCircle2,
      color: "text-green-500",
    },
    {
      title: "Total Requests",
      value: dashboardData?.totalRequest?.toString() ?? "0",
      description: "All time",
      icon: Package,
      color: "text-orange-500",
    },
    {
      title: "Total Balance",
      value: dashboardData?.totalBalance != null ? `$${dashboardData.totalBalance.toLocaleString()}` : "$0",
      description: "All time balance",
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  const renderRecentRequests = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      );
    }

    const requests = dashboardData?.recentRequests ?? [];
    if (requests.length === 0) {
      return (
        <div className="text-center py-4 text-sm text-muted-foreground">
          No recent requests
        </div>
      );
    }

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };

    return (
      <div className="space-y-3">
        {requests.slice(0, 5).map((request) => (
          <div 
            key={request._id} 
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors group"
          >
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium truncate">
                  {request.vehicleDetails.make} {request.vehicleDetails.model}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {request.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>
                  {request.distance.toLocaleString()} mi
                </span>
                {request.currentBid && (
                  <span className="font-medium text-foreground">
                    ${request.currentBid.amount.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDate(request.updatedAt)}
            </div>
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
                  <CardTitle className="text-base">Recent Requests</CardTitle>
                  <CardDescription>
                    Latest 5 requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRecentRequests()}
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
