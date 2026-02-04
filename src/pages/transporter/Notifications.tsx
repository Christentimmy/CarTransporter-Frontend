import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Bell,
  CheckCircle2,
  Truck,
  Package,
  AlertCircle,
  CheckCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock transporter notifications - replace with API call
const mockTransporterNotifications = [
  {
    _id: "1",
    type: "SHIPMENT_ASSIGNED",
    title: "New Shipment Assigned",
    message: "You have been assigned a new shipment from New York to Chicago",
    read: false,
    createdAt: new Date("2024-02-10T10:30:00"),
    icon: Truck,
    color: "text-blue-500",
  },
  {
    _id: "2",
    type: "SHIPMENT_STATUS",
    title: "Pickup Confirmed",
    message: "Pickup confirmed for shipment #SH-2024-001",
    read: false,
    createdAt: new Date("2024-02-09T14:20:00"),
    icon: Package,
    color: "text-green-500",
  },
  {
    _id: "3",
    type: "PAYOUT_PROCESSED",
    title: "Payout Processed",
    message: "Your payout of $450 for shipment #SH-2024-0005 has been processed",
    read: true,
    createdAt: new Date("2024-02-08T09:15:00"),
    icon: Wallet,
    color: "text-emerald-500",
  },
  {
    _id: "4",
    type: "SHIPMENT_DELIVERED",
    title: "Shipment Delivered",
    message: "Shipment #SH-2024-0003 has been marked as delivered",
    read: true,
    createdAt: new Date("2024-02-07T16:45:00"),
    icon: Package,
    color: "text-green-500",
  },
  {
    _id: "5",
    type: "REMINDER",
    title: "Upcoming Pickup",
    message: "You have a pickup scheduled in 2 hours for shipment #SH-2024-0007",
    read: false,
    createdAt: new Date("2024-02-10T08:00:00"),
    icon: AlertCircle,
    color: "text-yellow-500",
  },
];

const TransporterNotifications = () => {
  const [notifications, setNotifications] = useState(mockTransporterNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n._id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
            Notifications
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Stay updated with your shipments, bids, and payouts
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications"}
                </h3>
                <p className="text-muted-foreground text-center">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "You'll see notifications here when you receive shipment updates or payouts"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => {
                const Icon = notification.icon;
                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer hover:shadow-md transition-all ${
                        !notification.read ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg bg-background border ${
                              !notification.read
                                ? "border-primary/30 bg-primary/10"
                                : "border-border"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${notification.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3
                                    className={`font-semibold ${
                                      !notification.read
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {notification.title}
                                  </h3>
                                  {!notification.read && (
                                    <Badge
                                      variant="default"
                                      className="h-2 w-2 p-0 rounded-full"
                                    />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(notification.createdAt, "MMM d, yyyy 'at' h:mm a")}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification._id);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification._id);
                                  }}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransporterNotifications;
