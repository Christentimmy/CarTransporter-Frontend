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
import { useTranslation } from "react-i18next";

const Profile = () => {
  const { t } = useTranslation();
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

  const isTransporter = user?.role === "transporter";

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: async () => {
      toast.success(t("profile.toast.profileUpdated"), {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("profile.toast.updateFailed"), {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => {
      toast.success(t("profile.toast.passwordChanged"), {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("profile.toast.passwordChangeFailed"), {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
    approved: { label: t("profile.status.approved"), variant: "default", icon: CheckCircle2 },
    rejected: { label: t("profile.status.rejected"), variant: "destructive", icon: XCircle },
    pending: { label: t("profile.status.pending"), variant: "secondary", icon: Clock },
    banned: { label: t("profile.status.banned"), variant: "destructive", icon: AlertCircle },
  };

  const roleConfig: Record<string, { label: string; icon: any }> = {
    user: { label: t("profile.roles.user"), icon: User },
    transporter: { label: t("profile.roles.transporter"), icon: Truck },
    admin: { label: t("profile.roles.admin"), icon: Shield },
    super_admin: { label: t("profile.roles.superAdmin"), icon: Shield },
  };

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
      toast.error(t("profile.toast.enterOtp"), {
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
      toast.error(err instanceof Error ? err.message : t("profile.toast.otpVerificationFailed"), {
        style: { background: "#ef4444", color: "#fff" },
      });
    }
  };

  const handleResendOtp = async () => {
    if (!user?.email) return;
    try {
      // Resend OTP to the existing email address
      await authService.resendOtp({ email: user.email });
      toast.success(t("profile.toast.otpResent"), {
        style: { background: "#22c55e", color: "#fff" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.toast.otpResendFailed"), {
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
      toast.error(t("profile.toast.enterBothPasswords"), {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error(t("profile.toast.passwordsDoNotMatch"), {
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

  const RoleIcon = roleConfig[user?.role || "user"]?.icon || User;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-muted-foreground">
        {t("profile.loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-10 text-destructive text-sm">
        {(error instanceof Error && error.message) || t("profile.error")}
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("profile.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("profile.subtitle")}
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("profile.editProfile")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {t("profile.saveChanges")}
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
              {t("profile.accountStatus.title")}
            </CardTitle>
            <CardDescription>{t("profile.accountStatus.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("profile.accountStatus.role")}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {roleConfig[user.role]?.label || "User"}
                </Badge>
              </div>
              {user.status && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t("profile.accountStatus.status")}</span>
                  {getStatusBadge()}
                </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("profile.accountStatus.emailVerification")}</span>
                </div>
                {user.is_email_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("profile.accountStatus.verified")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {t("profile.accountStatus.unverified")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("profile.accountStatus.phoneVerification")}</span>
                </div>
                {user.is_phone_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("profile.accountStatus.verified")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {t("profile.accountStatus.unverified")}
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
              {t("profile.personalInfo.title")}
            </CardTitle>
            <CardDescription className="text-sm">{t("profile.personalInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.personalInfo.email")}</Label>
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
                  {t("profile.personalInfo.emailNotVerified")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">{t("profile.personalInfo.phone")}</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                disabled={!isEditing}
                placeholder={t("profile.personalInfo.phonePlaceholder")}
              />
              {!user.is_phone_verified && (
                <p className="text-xs text-muted-foreground">
                  {t("profile.personalInfo.phoneNotVerified")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transporter Information */}
        {isTransporter && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t("profile.businessInfo.title")}
              </CardTitle>
              <CardDescription>{t("profile.businessInfo.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t("profile.businessInfo.companyName")}</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder={t("profile.businessInfo.companyPlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_address">{t("profile.businessInfo.businessAddress")}</Label>
                <Input
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                  disabled={!isEditing}
                  placeholder={t("profile.businessInfo.businessPlaceholder")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_number">{t("profile.businessInfo.taxNumber")}</Label>
                  <Input
                    id="tax_number"
                    value={formData.tax_number}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    disabled={!isEditing}
                    placeholder={t("profile.businessInfo.taxPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region_country">{t("profile.businessInfo.region")}</Label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="region_country" className="text-xs text-muted-foreground">
                        {t("profile.businessInfo.country")}
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
                          <SelectValue placeholder={t("profile.businessInfo.countryPlaceholder")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="region_state" className="text-xs text-muted-foreground">
                        {t("profile.businessInfo.state")}
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
                        placeholder={t("profile.businessInfo.statePlaceholder")}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="region_postalCode" className="text-xs text-muted-foreground">
                        {t("profile.businessInfo.postalCode")}
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
                        placeholder={t("profile.businessInfo.postalPlaceholder")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("profile.security.title")}
            </CardTitle>
            <CardDescription className="text-sm">{t("profile.security.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button type="button" variant="outline" onClick={handleOpenChangePassword}>
              {t("profile.security.changePassword")}
            </Button>
          </CardContent>
        </Card>
      </form>

      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.otpDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("profile.otpDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="otp">{t("profile.otpDialog.otp")}</Label>
            <Input
              id="otp"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder={t("profile.otpDialog.otpPlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleResendOtp}>
              {t("profile.otpDialog.resendOtp")}
            </Button>
            <Button type="button" variant="hero" onClick={handleVerifyEmailOtp}>
              {t("profile.otpDialog.verifySave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("profile.changePasswordDialog.title")}</DialogTitle>
            <DialogDescription>{t("profile.changePasswordDialog.description")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">{t("profile.changePasswordDialog.currentPassword")}</Label>
              <Input
                id="old_password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t("profile.changePasswordDialog.currentPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">{t("profile.changePasswordDialog.newPassword")}</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("profile.changePasswordDialog.newPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_new_password">{t("profile.changePasswordDialog.confirmPassword")}</Label>
              <Input
                id="confirm_new_password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t("profile.changePasswordDialog.confirmPlaceholder")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                {t("profile.cancel")}
              </Button>
              <Button type="submit" variant="hero" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? t("profile.changePasswordDialog.changing") : t("profile.changePasswordDialog.title")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
