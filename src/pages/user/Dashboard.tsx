import { motion } from "framer-motion";
import { Truck, FileText, CheckCircle, Clock, DollarSign, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardService } from "@/services/dashboard_services";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DashboardData {
  pendingRequest: number;
  completedRequest: number;
  totalRequest: number;
  totalRevenue: number;
  recentRequests: any[];
}

interface RecentRequest {
  vehicleName?: string;
  status?: string;
  amount?: number;
  date?: string;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getUserDashboard();
        setDashboardData(data);
      } catch (error) {
        toast.error(t("user.dashboard.toast.loadFailed"), {
          style: { background: '#ef4444', color: '#ffffff' },
        });
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  // useEffect(() => {
  //   const initializeNotifications = async () => {
  //     try {
  //       const profile: GetProfileResponse = await getProfile();
  //       const userId = profile?.data?._id;
  //       if (userId) {
  //         await initBeams(userId);
  //       }
  //     } catch (error) {
  //       console.error("Failed to initialize Beams notifications:", error);
  //     }
  //   };

  //   initializeNotifications();
  // }, []);

  const stats = [
    {
      title: t("user.dashboard.stats.pending.title"),
      value: dashboardData?.pendingRequest.toString() || "0",
      description: t("user.dashboard.stats.pending.description"),
      icon: Clock,
      color: "text-blue-500",
    },
    {
      title: t("user.dashboard.stats.completed.title"),
      value: dashboardData?.completedRequest.toString() || "0",
      description: t("user.dashboard.stats.completed.description"),
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: t("user.dashboard.stats.total.title"),
      value: dashboardData?.totalRequest.toString() || "0",
      description: t("user.dashboard.stats.total.description"),
      icon: FileText,
      color: "text-orange-500",
    },
    {
      title: t("user.dashboard.stats.revenue.title"),
      value: dashboardData ? `$${dashboardData.totalRevenue.toLocaleString()}` : "$0",
      description: t("user.dashboard.stats.revenue.description"),
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  const renderRecentRequests = () => {
    if (isLoading) return null;
    
    const requests: any[] = dashboardData?.recentRequests || [];
    
    if (requests.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          {t("user.dashboard.recent.empty")}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request, index) => {
          const vehicleName = request.vehicleDetails 
            ? `${request.vehicleDetails.year} ${request.vehicleDetails.make} ${request.vehicleDetails.model}`
            : t("user.dashboard.recent.fallbackVehicle");
          
          const fromLocation = request.pickupLocation?.address || 
            `${request.pickupLocation?.city || ''}, ${request.pickupLocation?.state || ''}`.trim() || 
            t("user.dashboard.recent.unknownLocation");
          
          const toLocation = request.deliveryLocation?.address || 
            `${request.deliveryLocation?.city || ''}, ${request.deliveryLocation?.state || ''}`.trim() || 
            t("user.dashboard.recent.unknownLocation");

          const formatDate = (dateString: string) => {
            try {
              return new Date(dateString).toLocaleDateString();
            } catch {
              return '';
            }
          };

          const getStatusColor = (status: string) => {
            switch (status) {
              case 'DELIVERED': return 'text-green-600 bg-green-50';
              case 'IN_TRANSIT': return 'text-blue-600 bg-blue-50';
              case 'ASSIGNED': return 'text-yellow-600 bg-yellow-50';
              case 'LIVE': return 'text-purple-600 bg-purple-50';
              case 'COMPLETED': return 'text-emerald-600 bg-emerald-50';
              case 'CANCELLED': return 'text-red-600 bg-red-50';
              case 'DISPUTED': return 'text-orange-600 bg-orange-50';
              default: return 'text-gray-600 bg-gray-50';
            }
          };

          return (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              {/* Vehicle and Status */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{vehicleName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {request.vehicleDetails?.color && `Color: ${request.vehicleDetails.color}`}
                    {request.vehicleDetails?.drivetrain && ` • ${request.vehicleDetails.drivetrain}`}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status || t("user.dashboard.recent.fallbackStatus")}
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex-1">
                  <span className="font-medium">From:</span> {fromLocation}
                </div>
                <div className="flex-1">
                  <span className="font-medium">To:</span> {toLocation}
                </div>
              </div>

              {/* Distance and Deadline */}
              <div className="flex items-center justify-between text-xs">
                <div className="text-muted-foreground">
                  {request.distance && `Distance: ${request.distance.toLocaleString()} km`}
                  {request.estimatedTime && ` • ~${Math.round(request.estimatedTime / 60)} hrs`}
                </div>
                <div className="text-muted-foreground">
                  {request.deliveryDeadline && `Due: ${formatDate(request.deliveryDeadline)}`}
                </div>
              </div>

              {/* Amount and Date */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm font-medium">
                  {request.currentBid?.amount ? `$${request.currentBid.amount.toLocaleString()}` : 
                   request.amount ? `$${request.amount}` : 
                   t("user.dashboard.recent.fallbackAmount")}
                </div>
                <div className="text-xs text-muted-foreground">
                  {request.createdAt ? formatDate(request.createdAt) : ''}
                </div>
              </div>
            </div>
          );
        })}
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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("user.dashboard.title")}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("user.dashboard.subtitle")}
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
          <div className="grid gap-3 sm:gap-4 grid-cols-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{t("user.dashboard.recent.title")}</CardTitle>
                  <CardDescription>
                    {t("user.dashboard.recent.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {renderRecentRequests()}
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
