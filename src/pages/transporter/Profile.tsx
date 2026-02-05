import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Building2,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  AlertCircle,
  Save,
  Edit,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile, type GetProfileResponse, updateProfile, type UpdateProfilePayload } from "@/services/profileService";
import { changePassword, type ChangePasswordPayload } from "@/services/securityService";
import { authService } from "@/services/auth_services";
import { toast } from "sonner";

const TransporterProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    company_name: "",
    business_address: "",
    tax_number: "",
    region: {
      country: "",
      state: "",
      postalCode: "",
    },
  });

  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const {
    data: profileData,
    isLoading,
    isError,
    error,
  } = useQuery<GetProfileResponse>({
    queryKey: ["user-profile"],
    queryFn: getProfile,
  });

  const user = profileData?.data;

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        phone_number: user.phone_number?.toString() || "",
        company_name: user.company_name || "",
        business_address: user.business_address || "",
        tax_number: user.tax_number || "",
        region: {
          country: user.region?.country || "",
          state: user.region?.state || "",
          postalCode: user.region?.postalCode || "",
        },
      }));
    }
  }, [user]);

  const statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      icon: any;
    }
  > = {
    approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
    rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
    pending: { label: "Pending", variant: "secondary", icon: Clock },
    banned: { label: "Banned", variant: "destructive", icon: AlertCircle },
  };

  const roleConfig: Record<string, { label: string; icon: any }> = {
    user: { label: "User", icon: User },
    transporter: { label: "Transporter", icon: Truck },
    admin: { label: "Admin", icon: Shield },
    super_admin: { label: "Super Admin", icon: Shield },
  };

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: async () => {
      toast.success("Profile updated", {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update profile", {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully", {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to change password", {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload: UpdateProfilePayload = {};
    if (formData.phone_number !== user.phone_number) {
      payload.phone_number = formData.phone_number;
    }
    if (formData.company_name !== (user.company_name || "")) {
      payload.company_name = formData.company_name || undefined;
    }
    if (formData.business_address !== (user.business_address || "")) {
      payload.business_address = formData.business_address || undefined;
    }
    if (formData.tax_number !== (user.tax_number || "")) {
      payload.tax_number = formData.tax_number || undefined;
    }

    const currentRegion = {
      country: user.region?.country || "",
      state: user.region?.state || "",
      postalCode: user.region?.postalCode || "",
    };
    const newRegion = formData.region;

    const regionChanged =
      currentRegion.country !== newRegion.country ||
      currentRegion.state !== newRegion.state ||
      currentRegion.postalCode !== newRegion.postalCode;

    if (regionChanged) {
      payload.region = {
        country: newRegion.country,
        state: newRegion.state,
        postalCode: newRegion.postalCode,
      };
    }

    const emailChanged = formData.email !== user.email;

    if (emailChanged) {
      setPendingEmail(formData.email);
      setIsOtpDialogOpen(true);
      return;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    updateProfileMutation.mutate(payload);
  };

  const handleVerifyEmailOtp = async () => {
    if (!otpValue) {
      toast.error("Enter the OTP sent to your registered email", {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    try {
      if (!user) return;

      // Verify OTP against the existing email on the account
      await authService.verifyOtp({ email: user.email, otp: otpValue });

      const payload: UpdateProfilePayload = {};

      // Apply the new email after successful OTP verification
      if (pendingEmail && pendingEmail !== user.email) {
        payload.email = pendingEmail;
      }

      if (formData.phone_number !== user?.phone_number) {
        payload.phone_number = formData.phone_number;
      }
      if (formData.company_name !== (user?.company_name || "")) {
        payload.company_name = formData.company_name || undefined;
      }
      if (formData.business_address !== (user?.business_address || "")) {
        payload.business_address = formData.business_address || undefined;
      }
      if (formData.tax_number !== (user?.tax_number || "")) {
        payload.tax_number = formData.tax_number || undefined;
      }

      const currentRegion = {
        country: user.region?.country || "",
        state: user.region?.state || "",
        postalCode: user.region?.postalCode || "",
      };
      const newRegion = formData.region;

      const regionChanged =
        currentRegion.country !== newRegion.country ||
        currentRegion.state !== newRegion.state ||
        currentRegion.postalCode !== newRegion.postalCode;

      if (regionChanged) {
        if (newRegion.country || newRegion.state || newRegion.postalCode) {
          payload.region = {
            country: newRegion.country,
            state: newRegion.state,
            postalCode: newRegion.postalCode,
          };
        } else {
          payload.region = undefined;
        }
      }

      setIsOtpDialogOpen(false);
      setOtpValue("");
      setPendingEmail(null);

      updateProfileMutation.mutate(payload);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "OTP verification failed", {
        style: { background: "#ef4444", color: "#fff" },
      });
    }
  };

  const handleResendOtp = async () => {
    if (!user?.email) return;
    try {
      // Resend OTP to the existing email address
      await authService.resendOtp({ email: user.email });
      toast.success("OTP resent to your registered email", {
        style: { background: "#22c55e", color: "#fff" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP", {
        style: { background: "#ef4444", color: "#fff" },
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user?.email || "",
      phone_number: user?.phone_number?.toString() || "",
      company_name: user?.company_name || "",
      business_address: user?.business_address || "",
      tax_number: user?.tax_number || "",
      region: {
        country: user?.region?.country || "",
        state: user?.region?.state || "",
        postalCode: user?.region?.postalCode || "",
      },
    });
    setIsEditing(false);
  };

  const handleOpenChangePassword = () => {
    setIsChangePasswordOpen(true);
  };

  const handleSubmitChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      toast.error("Please enter both old and new passwords", {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match", {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    const payload: ChangePasswordPayload = {
      old_password: oldPassword,
      new_password: newPassword,
    };

    changePasswordMutation.mutate(payload);
  };

  const getStatusBadge = () => {
    if (!user?.status) return null;
    const config = statusConfig[user.status];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const RoleIcon = roleConfig[user?.role || "transporter"]?.icon || User;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-10 text-destructive text-sm">
        {(error instanceof Error && error.message) || "Failed to load profile"}
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your transporter account information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        )}
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Status
            </CardTitle>
            <CardDescription>Your account verification and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Role:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {roleConfig[user.role]?.label || "Transporter"}
                </Badge>
              </div>
              {user.status && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  {getStatusBadge()}
                </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email Verification</span>
                </div>
                {user.is_email_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Phone Verification</span>
                </div>
                {user.is_phone_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-sm">
              Your basic transporter account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                required
              />
              {!user.is_email_verified && (
                <p className="text-xs text-muted-foreground">
                  Your email is not verified. Please verify it to access all features.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter your phone number"
              />
              {!user.is_phone_verified && (
                <p className="text-xs text-muted-foreground">
                  Your phone number is not verified.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription className="text-sm">Your company and business details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Enter your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_number">Tax Number</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Enter your tax number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">Business Address</Label>
              <Input
                id="business_address"
                value={formData.business_address}
                onChange={(e) =>
                  setFormData({ ...formData, business_address: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Enter your business address"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region_country">Region</Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="region_country" className="text-xs text-muted-foreground">
                    Country
                  </Label>
                  <Select
                    value={formData.region.country}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        region: { ...formData.region, country: value },
                      })
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="region_country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="region_state" className="text-xs text-muted-foreground">
                    State / Province
                  </Label>
                  <Input
                    id="region_state"
                    value={formData.region.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        region: { ...formData.region, state: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Enter state or province"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="region_postalCode" className="text-xs text-muted-foreground">
                    Postal Code
                  </Label>
                  <Input
                    id="region_postalCode"
                    value={formData.region.postalCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        region: { ...formData.region, postalCode: e.target.value },
                      })
                    }
                    disabled={!isEditing}
                    placeholder="Enter postal code"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Security
            </CardTitle>
            <CardDescription className="text-sm">
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button type="button" variant="outline" onClick={handleOpenChangePassword}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </form>
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify new email</DialogTitle>
            <DialogDescription>
              Enter the one-time password (OTP) sent to your current email address to confirm this
              change.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="Enter OTP"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleResendOtp}>
              Resend OTP
            </Button>
            <Button type="button" variant="hero" onClick={handleVerifyEmailOtp}>
              Verify &amp; Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your transporter account password.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">Current Password</Label>
              <Input
                id="old_password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_new_password">Confirm New Password</Label>
              <Input
                id="confirm_new_password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransporterProfile;
