import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { DollarSign, Wallet, History, Loader2, Plus, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addPaymentMethod,
  listPaymentMethods,
  type PaymentMethodDto,
  type PaymentMethodType,
} from "@/services/paymentMethodService";
import {
  listWithdrawalRequests,
  type WithdrawalRequestDto,
  createWithdrawalRequest,
} from "@/services/withdrawalService";
import { getProfile, type GetProfileResponse } from "@/services/profileService";

type WithdrawalStatus = "pending" | "approved" | "rejected" | "processed";

interface WithdrawalPaymentMethod {
  name: string;
  type: PaymentMethodType;
  accountNumber?: string;
  email?: string;
  routingNumber?: string;
  bankName?: string;
}

interface WithdrawalRequestItem {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  paymentMethod: WithdrawalPaymentMethod;
  rejectionReason?: string;
  createdAt: string;
}

const statusVariantMap: Record<
  WithdrawalStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pending", variant: "outline" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
  processed: { label: "Processed", variant: "secondary" },
};

const Withdrawals = () => {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddMethodOpen, setIsAddMethodOpen] = useState(false);
  const [newMethodType, setNewMethodType] = useState<PaymentMethodType>("paypal");
  const [newMethodName, setNewMethodName] = useState<string>("");
  const [newAccountNumber, setNewAccountNumber] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newRoutingNumber, setNewRoutingNumber] = useState<string>("");
  const [newBankName, setNewBankName] = useState<string>("");

  const { data: profileData } = useQuery<GetProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: getProfile,
  });

  const balance = profileData?.data?.balance;
  const formattedBalance =
    typeof balance === "number"
      ? `$${balance.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";

  const {
    data: paymentMethodsData,
    isLoading: isLoadingMethods,
    isError: isMethodsError,
    error: methodsError,
  } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => listPaymentMethods(),
  });

  const createWithdrawalMutation = useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: async () => {
      toast.success("Withdrawal request submitted", {
        style: { background: "#22c55e", color: "#fff" },
      });

      setAmount("");
      setSelectedMethodId(null);

      await queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to submit withdrawal request", {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const methods: PaymentMethodDto[] = paymentMethodsData?.data ?? [];

  const {
    data: withdrawalRequestsData,
    isLoading: isLoadingWithdrawals,
    isError: isWithdrawalsError,
    error: withdrawalsError,
  } = useQuery({
    queryKey: ["withdrawal-requests"],
    queryFn: () => listWithdrawalRequests(),
  });

  const apiRequests: WithdrawalRequestItem[] =
    withdrawalRequestsData?.data.map((item: WithdrawalRequestDto) => ({
      id: item._id,
      amount: item.amount,
      status: item.status,
      paymentMethod: {
        name: item.paymentMethod.name,
        type: item.paymentMethod.type,
        accountNumber: item.paymentMethod.accountNumber,
        email: item.paymentMethod.email,
        routingNumber: item.paymentMethod.routingNumber,
        bankName: item.paymentMethod.bankName,
      },
      rejectionReason: item.rejectionReason,
      createdAt: item.createdAt,
    })) ?? [];

  const combinedRequests: WithdrawalRequestItem[] = apiRequests;

  const addMethodMutation = useMutation({
    mutationFn: addPaymentMethod,
    onSuccess: async () => {
      toast.success("Payment method added", {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsAddMethodOpen(false);
      setNewMethodName("");
      setNewAccountNumber("");
      setNewEmail("");
      setNewRoutingNumber("");
      setNewBankName("");
      await queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to add payment method", {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid withdrawal amount", {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    if (!selectedMethodId) {
      toast.error("Please select a payment method", {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    setIsSubmitting(true);
    createWithdrawalMutation.mutate(
      {
        paymentMethodId: selectedMethodId,
        amount: amount,
      },
      {
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  const renderMethodDetails = (m: WithdrawalPaymentMethod) => {
    if (m.type === "paypal") {
      return m.email || "PayPal";
    }
    if (m.type === "mobile_money") {
      return m.accountNumber || "Mobile money";
    }
    if (m.type === "bank") {
      if (m.bankName && m.accountNumber) return `${m.bankName} • ${m.accountNumber}`;
      if (m.accountNumber) return m.accountNumber;
      return m.bankName || "Bank";
    }
    return m.name;
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">Withdrawals</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Request payouts from your transporter earnings and track their status.
            </p>
          </div>
        </div>
        <div className="mt-1 sm:mt-0 flex flex-col items-start sm:items-end text-xs sm:text-sm">
          <span className="text-muted-foreground">Available balance</span>
          <span className="text-base sm:text-lg font-semibold">{formattedBalance}</span>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)]">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="h-4 w-4" />
                  Payment methods
                </CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="mt-1 sm:mt-0"
                  onClick={() => setIsAddMethodOpen(true)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add payment method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMethods ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading payment methods...
                </div>
              ) : isMethodsError ? (
                <div className="py-6 text-sm text-destructive">
                  {(methodsError instanceof Error && methodsError.message) ||
                    "Failed to load payment methods"}
                </div>
              ) : methods.length === 0 ? (
                <div className="py-6 text-sm text-muted-foreground">
                  You have no saved payment methods yet. Add one to request withdrawals.
                </div>
              ) : (
                <div className="space-y-3">
                  {methods.map((method) => (
                    <button
                      key={method._id}
                      type="button"
                      onClick={() => setSelectedMethodId(method._id)}
                      className={`w-full rounded-lg border p-3 text-left text-sm transition hover:bg-muted/60 ${
                        selectedMethodId === method._id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 min-w-0">
                          <p className="font-medium truncate">{method.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {renderMethodDetails({
                              name: method.name,
                              type: method.type,
                              accountNumber: method.accountNumber,
                              email: method.email,
                              routingNumber: method.routingNumber,
                              bankName: method.bankName,
                            })}
                          </p>
                        </div>
                        {selectedMethodId === method._id && (
                          <Badge variant="default" className="text-[10px]">
                            Selected
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4" />
                New withdrawal request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-6"
                      placeholder="Enter amount to withdraw"
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Select a payment method on the left, then enter the amount you want to withdraw.
                </p>

                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    "Submit withdrawal request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <History className="h-4 w-4" />
                Withdrawal history
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWithdrawals ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading withdrawal requests...
                </div>
              ) : isWithdrawalsError ? (
                <div className="py-6 text-sm text-destructive">
                  {(withdrawalsError instanceof Error && withdrawalsError.message) ||
                    "Failed to load withdrawal requests"}
                </div>
              ) : combinedRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                  <History className="mb-3 h-10 w-10 opacity-60" />
                  <p className="text-sm font-medium">No withdrawal requests yet</p>
                  <p className="mt-1 text-xs sm:text-sm">
                    Submit your first withdrawal request to see it listed here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {combinedRequests.map((item) => {
                    const statusConfig = statusVariantMap[item.status];
                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-3 rounded-lg border bg-card p-3 text-sm"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              ${item.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {renderMethodDetails(item.paymentMethod)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Requested on {format(new Date(item.createdAt), "MMM d, yyyy h:mm a")}
                          </p>
                          {item.rejectionReason && (
                            <p className="text-xs text-destructive">{item.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog
        open={isAddMethodOpen}
        onOpenChange={(open) => {
          setIsAddMethodOpen(open);
          if (!open) {
            setNewMethodName("");
            setNewAccountNumber("");
            setNewEmail("");
            setNewRoutingNumber("");
            setNewBankName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add payment method</DialogTitle>
            <DialogDescription>
              Save a payout destination you can reuse for future withdrawals.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={newMethodType}
                onValueChange={(v) => setNewMethodType(v as PaymentMethodType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="mobile_money">Mobile money</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newMethodName">Account name / label</Label>
              <Input
                id="newMethodName"
                value={newMethodName}
                onChange={(e) => setNewMethodName(e.target.value)}
                placeholder="e.g. Main business account"
              />
            </div>

            {newMethodType === "bank" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="newBankName">Bank name</Label>
                  <Input
                    id="newBankName"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="Bank name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newAccountNumber">Account number</Label>
                  <Input
                    id="newAccountNumber"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="newRoutingNumber">Routing number</Label>
                  <Input
                    id="newRoutingNumber"
                    value={newRoutingNumber}
                    onChange={(e) => setNewRoutingNumber(e.target.value)}
                    placeholder="Routing number"
                  />
                </div>
              </div>
            )}

            {newMethodType === "paypal" && (
              <div className="space-y-1.5">
                <Label htmlFor="newEmail">PayPal email</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            )}

            {newMethodType === "mobile_money" && (
              <div className="space-y-1.5">
                <Label htmlFor="newMobileNumber">Mobile money number</Label>
                <Input
                  id="newMobileNumber"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder="Enter mobile money number"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="hero"
              disabled={addMethodMutation.isPending}
              onClick={() => {
                if (!newMethodName || !newMethodType) {
                  toast.error("Name and type are required", {
                    style: { background: "#ef4444", color: "#fff" },
                  });
                  return;
                }

                if (newMethodType === "bank") {
                  if (!newBankName || !newRoutingNumber) {
                    toast.error("Bank name and routing number are required for bank accounts", {
                      style: { background: "#ef4444", color: "#fff" },
                    });
                    return;
                  }
                }

                const payload = {
                  name: newMethodName,
                  type: newMethodType,
                  accountNumber: newAccountNumber || undefined,
                  email: newEmail || undefined,
                  routingNumber: newRoutingNumber || undefined,
                  bankName: newBankName || undefined,
                };

                addMethodMutation.mutate(payload);
              }}
            >
              {addMethodMutation.isPending ? "Saving..." : "Save payment method"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Withdrawals;
