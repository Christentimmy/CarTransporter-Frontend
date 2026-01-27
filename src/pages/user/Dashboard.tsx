import { motion } from "framer-motion";
import { Truck, FileText, Gavel, Package, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Requests",
      value: "3",
      description: "Requests awaiting bids",
      icon: FileText,
      color: "text-blue-500",
    },
    {
      title: "Total Bids",
      value: "12",
      description: "Bids received",
      icon: Gavel,
      color: "text-green-500",
    },
    {
      title: "Active Shipments",
      value: "2",
      description: "In transit",
      icon: Package,
      color: "text-orange-500",
    },
    {
      title: "Total Spent",
      value: "$2,450",
      description: "This month",
      icon: DollarSign,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your activity.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Requests</CardTitle>
              <CardDescription>
                Your latest vehicle transport requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">2024 Toyota Camry</p>
                    <p className="text-xs text-muted-foreground">
                      Posted 2 hours ago • 5 bids
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">2023 Honda Accord</p>
                    <p className="text-xs text-muted-foreground">
                      Posted 1 day ago • 8 bids
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full rounded-md border p-3 text-left text-sm hover:bg-accent">
                  <div className="font-medium">Post New Vehicle Request</div>
                  <div className="text-xs text-muted-foreground">
                    Create a new transport request
                  </div>
                </button>
                <button className="w-full rounded-md border p-3 text-left text-sm hover:bg-accent">
                  <div className="font-medium">View All Bids</div>
                  <div className="text-xs text-muted-foreground">
                    Check bids on your requests
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
