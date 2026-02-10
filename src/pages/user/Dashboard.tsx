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
    
    const requests: RecentRequest[] = dashboardData?.recentRequests || [];
    
    if (requests.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          {t("user.dashboard.recent.empty")}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {request.vehicleName || t("user.dashboard.recent.fallbackVehicle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {request.status || t("user.dashboard.recent.fallbackStatus")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">
                {request.amount ? `$${request.amount}` : t("user.dashboard.recent.fallbackAmount")}
              </p>
              <p className="text-xs text-muted-foreground">
                {request.date || ''}
              </p>
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
