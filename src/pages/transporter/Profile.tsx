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
  FileText,
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

const TransporterProfile = () => {
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
    insurance: {
      name: "",
      policyNumber: "",
      expiryDate: "",
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
        insurance: {
          name: user.insurance?.name || "",
          policyNumber: user.insurance?.policyNumber || "",
          expiryDate: user.insurance?.expiryDate 
            ? new Date(user.insurance.expiryDate).toISOString().split('T')[0] 
            : "",
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
      toast.success(t("transporterProfile.toast.profileUpdated"), {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsEditing(false);
      await queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("transporterProfile.toast.updateFailed"), {
        style: { background: "#ef4444", color: "#fff" },
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) => changePassword(payload),
    onSuccess: () => {
      toast.success(t("transporterProfile.toast.passwordChanged"), {
        style: { background: "#22c55e", color: "#fff" },
      });
      setIsChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : t("transporterProfile.toast.passwordChangeFailed"), {
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

    // Check if insurance data changed
    const currentInsurance = {
      name: user.insurance?.name || "",
      policyNumber: user.insurance?.policyNumber || "",
      expiryDate: user.insurance?.expiryDate 
        ? new Date(user.insurance.expiryDate).toISOString().split('T')[0] 
        : "",
    };
    const newInsurance = formData.insurance;

    const insuranceChanged =
      currentInsurance.name !== newInsurance.name ||
      currentInsurance.policyNumber !== newInsurance.policyNumber ||
      currentInsurance.expiryDate !== newInsurance.expiryDate;

    if (insuranceChanged) {
      payload.insurance = {
        name: newInsurance.name,
        policyNumber: newInsurance.policyNumber,
        expiryDate: new Date(newInsurance.expiryDate),
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
      toast.error(t("transporterProfile.toast.enterOtp"), {
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
      toast.error(err instanceof Error ? err.message : t("transporterProfile.toast.otpVerificationFailed"), {
        style: { background: "#ef4444", color: "#fff" },
      });
    }
  };

  const handleResendOtp = async () => {
    if (!user?.email) return;
    try {
      // Resend OTP to the existing email address
      await authService.resendOtp({ email: user.email });
      toast.success(t("transporterProfile.toast.otpResent"), {
        style: { background: "#22c55e", color: "#fff" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("transporterProfile.toast.otpResendFailed"), {
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
      toast.error(t("transporterProfile.toast.enterBothPasswords"), {
        style: { background: "#ef4444", color: "#fff" },
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error(t("transporterProfile.toast.passwordsDoNotMatch"), {
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
        <div className="text-sm text-muted-foreground">{t("transporterProfile.loading")}</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-10 text-destructive text-sm">
        {(error instanceof Error && error.message) || t("transporterProfile.error")}
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("transporterProfile.title")}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("transporterProfile.subtitle")}
          </p>
        </div>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            {t("transporterProfile.editProfile")}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              {t("transporterProfile.cancel")}
            </Button>
            <Button variant="hero" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {t("transporterProfile.saveChanges")}
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
              {t("transporterProfile.accountStatus.title")}
            </CardTitle>
            <CardDescription>{t("transporterProfile.accountStatus.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t("transporterProfile.accountStatus.role")}</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <RoleIcon className="h-3 w-3" />
                  {roleConfig[user.role]?.label || t("transporterProfile.role.transporter")}
                </Badge>
              </div>
              {user.status && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{t("transporterProfile.accountStatus.status")}</span>
                  {getStatusBadge()}
                </div>
              )}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("transporterProfile.accountStatus.emailVerification")}</span>
                </div>
                {user.is_email_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("transporterProfile.accountStatus.verified")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {t("transporterProfile.accountStatus.unverified")}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{t("transporterProfile.accountStatus.phoneVerification")}</span>
                </div>
                {user.is_phone_verified ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {t("transporterProfile.accountStatus.verified")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    {t("transporterProfile.accountStatus.unverified")}
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
              {t("transporterProfile.personalInfo.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("transporterProfile.personalInfo.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="email">{t("transporterProfile.personalInfo.email")}</Label>
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
                  {t("transporterProfile.personalInfo.emailNotVerified")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">{t("transporterProfile.personalInfo.phone")}</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                disabled={!isEditing}
                placeholder={t("transporterProfile.personalInfo.phonePlaceholder")}
              />
              {!user.is_phone_verified && (
                <p className="text-xs text-muted-foreground">
                  {t("transporterProfile.personalInfo.phoneNotVerified")}
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
              {t("transporterProfile.businessInfo.title")}
            </CardTitle>
            <CardDescription className="text-sm">{t("transporterProfile.businessInfo.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t("transporterProfile.businessInfo.companyName")}</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder={t("transporterProfile.businessInfo.companyNamePlaceholder")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_number">{t("transporterProfile.businessInfo.taxNumber")}</Label>
                <Input
                  id="tax_number"
                  value={formData.tax_number}
                  onChange={(e) =>
                    setFormData({ ...formData, tax_number: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder={t("transporterProfile.businessInfo.taxNumberPlaceholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address">{t("transporterProfile.businessInfo.businessAddress")}</Label>
              <Input
                id="business_address"
                value={formData.business_address}
                onChange={(e) =>
                  setFormData({ ...formData, business_address: e.target.value })
                }
                disabled={!isEditing}
                placeholder={t("transporterProfile.businessInfo.businessAddressPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region_country">{t("transporterProfile.businessInfo.region")}</Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="region_country" className="text-xs text-muted-foreground">
                    {t("transporterProfile.businessInfo.country")}
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
                      <SelectValue placeholder={t("transporterProfile.businessInfo.countryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="region_state" className="text-xs text-muted-foreground">
                    {t("transporterProfile.businessInfo.state")}
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
                    placeholder={t("transporterProfile.businessInfo.statePlaceholder")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="region_postalCode" className="text-xs text-muted-foreground">
                    {t("transporterProfile.businessInfo.postalCode")}
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
                    placeholder={t("transporterProfile.businessInfo.postalCodePlaceholder")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              <CardTitle className="text-lg sm:text-xl">Insurance Information</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Manage your insurance policy details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="insurance_name">Insurance Company Name</Label>
              <Input
                id="insurance_name"
                value={formData.insurance.name}
                onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, name: e.target.value } })}
                disabled={!isEditing}
                placeholder="Enter insurance company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_policy">Policy Number</Label>
              <Input
                id="insurance_policy"
                value={formData.insurance.policyNumber}
                onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, policyNumber: e.target.value } })}
                disabled={!isEditing}
                placeholder="Enter policy number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="insurance_expiry">Expiry Date</Label>
              <Input
                id="insurance_expiry"
                type="date"
                value={formData.insurance.expiryDate}
                onChange={(e) => setFormData({ ...formData, insurance: { ...formData.insurance, expiryDate: e.target.value } })}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("transporterProfile.security.title")}
            </CardTitle>
            <CardDescription className="text-sm">
              {t("transporterProfile.security.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button type="button" variant="outline" onClick={handleOpenChangePassword}>
              {t("transporterProfile.security.changePassword")}
            </Button>
          </CardContent>
        </Card>
      </form>
      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transporterProfile.emailVerificationDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("transporterProfile.emailVerificationDialog.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="otp">{t("transporterProfile.emailVerificationDialog.otp")}</Label>
            <Input
              id="otp"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder={t("transporterProfile.emailVerificationDialog.otpPlaceholder")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleResendOtp}>
              {t("transporterProfile.emailVerificationDialog.resendOtp")}
            </Button>
            <Button type="button" variant="hero" onClick={handleVerifyEmailOtp}>
              {t("transporterProfile.emailVerificationDialog.verifySave")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("transporterProfile.changePasswordDialog.title")}</DialogTitle>
            <DialogDescription>{t("transporterProfile.changePasswordDialog.description")}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password">{t("transporterProfile.changePasswordDialog.currentPassword")}</Label>
              <Input
                id="old_password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder={t("transporterProfile.changePasswordDialog.currentPasswordPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">{t("transporterProfile.changePasswordDialog.newPassword")}</Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("transporterProfile.changePasswordDialog.newPasswordPlaceholder")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_new_password">{t("transporterProfile.changePasswordDialog.confirmNewPassword")}</Label>
              <Input
                id="confirm_new_password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder={t("transporterProfile.changePasswordDialog.confirmNewPasswordPlaceholder")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
              >
                {t("transporterProfile.changePasswordDialog.cancel")}
              </Button>
              <Button type="submit" variant="hero" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? t("transporterProfile.changePasswordDialog.changing") : t("transporterProfile.changePasswordDialog.changePassword")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransporterProfile;
