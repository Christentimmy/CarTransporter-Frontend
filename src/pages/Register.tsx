import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Globe, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { authService, RegisterPayload } from "@/services/auth_services";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Register = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const nextLanguage = i18n.language?.startsWith("fr") ? "en" : "fr";
  const languageToggleLabel = i18n.language?.startsWith("fr") ? "EN" : "FR";
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterPayload>({
    defaultValues: {
      role: "user",
      full_name: "",
      region: {
        country: "",
        state: "",
        city: "",
        postalCode: "",
        address: "",
      },
      insurance: {
        name: "",
        policyNumber: "",
        expiryDate: "",
      },
    },
  });

  const role = watch("role");
  const isTransporter = role === "transporter";

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const onSubmit = async (data: RegisterPayload) => {
    if (!avatarFile) {
      toast.error("Profile picture is required", {
        style: {
          background: '#ef4444',
          color: '#ffffff',
        },
      });
      return;
    }

    try {
      setIsLoading(true);
      // Only send insurance details for transporters
      if (data.role !== "transporter") {
        data.insurance = undefined;
      }
      // Only send user_type for users
      if (data.role !== "user") {
        data.user_type = undefined;
      }
      
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("phone_number", data.phone_number);
      formData.append("password", data.password);
      formData.append("role", data.role);
      formData.append("avatar", avatarFile);
      
      if (data.user_type) {
        formData.append("user_type", data.user_type);
      }
      
      formData.append("region[country]", data.region.country);
      formData.append("region[state]", data.region.state);
      formData.append("region[city]", data.region.city);
      formData.append("region[postalCode]", data.region.postalCode);
      formData.append("region[address]", data.region.address);
      
      if (data.company_name) {
        formData.append("company_name", data.company_name);
      }
      if (data.business_address) {
        formData.append("business_address", data.business_address);
      }
      if (data.tax_number) {
        formData.append("tax_number", data.tax_number);
      }
      
      if (data.insurance) {
        formData.append("insurance[name]", data.insurance.name);
        formData.append("insurance[policyNumber]", data.insurance.policyNumber);
        formData.append("insurance[expiryDate]", data.insurance.expiryDate);
      }
      
      const response = await authService.register(formData);
      
      toast.success("Registration successful! Please check your email for the verification code.", {
        style: { background: '#10b981', color: '#ffffff' },
      });
      
      // Redirect to OTP verification page
      navigate('/verify-otp', {
        state: { 
          email: data.email,
          role: data.role 
        }
      });
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.", {
        style: {
          background: '#ef4444', // Red for error
          color: '#ffffff',
          border: '1px solid #fecaca',
        },
        icon: '❌',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <AnimatedBackground />
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => i18n.changeLanguage(nextLanguage)}
          className="bg-background/80 backdrop-blur-xl border border-border/50"
        >
          <Globe className="w-4 h-4 mr-2" />
          {languageToggleLabel}
        </Button>
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("auth.register.backToHome")}</span>
          </Link>

          {/* Register Card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <img
                src="/logo.png"
                alt="BID4TOW"
                className="w-12 h-12 object-contain"
                draggable={false}
              />
              <span className="font-display text-2xl font-bold">
                BID<span className="text-primary">4</span>TOW
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold text-center mb-2">
              {t("auth.register.createAccount")}
            </h1>
            <p className="text-center text-muted-foreground mb-6">
              {t("auth.register.subtitle")}
            </p>

            {/* Profile Picture Upload */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="avatar">Profile Picture *</Label>
              <div className="flex items-center gap-4">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeAvatar}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a profile picture (required)
                  </p>
                </div>
              </div>
            </div>

            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">{t("auth.register.fullName")}</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder={t("auth.register.fullNamePlaceholder")}
                  className="w-full"
                  {...register("full_name", { required: t("auth.register.errors.fullNameRequired") })}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-500">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.register.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.register.emailPlaceholder")}
                  className="w-full"
                  {...register("email", { required: t("auth.register.errors.emailRequired") })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">{t("auth.register.phoneNumber")}</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder={t("auth.register.phoneNumberPlaceholder")}
                  className="w-full"
                  {...register("phone_number", { required: t("auth.register.errors.phoneNumberRequired") })}
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-500">{errors.phone_number.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.register.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.register.passwordPlaceholder")}
                  className="w-full"
                  {...register("password", { 
                    required: t("auth.register.errors.passwordRequired"),
                    minLength: { value: 6, message: t("auth.register.errors.passwordMinLength") }
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">{t("auth.register.role")}</Label>
                <Select
                  value={role}
                  onValueChange={(value) => {
                    register("role").onChange({ target: { value, name: "role" } });
                  }}
                >
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder={t("auth.register.rolePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">{t("auth.register.user")}</SelectItem>
                    <SelectItem value="transporter">{t("auth.register.transporter")}</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-red-500">{errors.role.message}</p>
                )}
              </div>

              {/* Account Type for Users */}
              <AnimatePresence>
                {!isTransporter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="user_type">Account Type *</Label>
                    <Select
                      onValueChange={(value) => {
                        register("user_type").onChange({ target: { value, name: "user_type" } });
                      }}
                    >
                      <SelectTrigger id="user_type" className="w-full">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Specify if this is for personal or business use
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Region - Required for both users and transporters */}
              <div className="space-y-4">
                {/* <Label>Location Information *</Label> */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="region_country">Country *</Label>
                    <Select
                      value={watch("region.country") || ""}
                      onValueChange={(value) => {
                        register("region.country", {
                          required: "Country is required",
                        }).onChange({ target: { value, name: "region.country" } });
                      }}
                    >
                      <SelectTrigger id="region_country" className="w-full">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.region?.country && (
                      <p className="text-sm text-red-500">{errors.region.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region_state">State/Province *</Label>
                    <Input
                      id="region_state"
                      type="text"
                      placeholder="Enter state or province"
                      className="w-full"
                      {...register("region.state", {
                        required: "State/Province is required",
                      })}
                    />
                    {errors.region?.state && (
                      <p className="text-sm text-red-500">{errors.region.state.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region_city">City *</Label>
                    <Input
                      id="region_city"
                      type="text"
                      placeholder="Enter city"
                      className="w-full"
                      {...register("region.city", {
                        required: "City is required",
                      })}
                    />
                    {errors.region?.city && (
                      <p className="text-sm text-red-500">{errors.region.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region_postalCode">Postal Code *</Label>
                    <Input
                      id="region_postalCode"
                      type="text"
                      placeholder="Enter postal code"
                      className="w-full"
                      {...register("region.postalCode", {
                        required: "Postal code is required",
                      })}
                    />
                    {errors.region?.postalCode && (
                      <p className="text-sm text-red-500">{errors.region.postalCode.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region_address">Address</Label>
                    <Input
                      id="region_address"
                      type="text"
                      placeholder="e.g., 3434 Newman street"
                      className="w-full"
                      {...register("region.address")}
                    />
                    {errors.region?.address && (
                      <p className="text-sm text-red-500">{errors.region.address.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Conditional Fields for Transporter */}
              <AnimatePresence>
                {isTransporter && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 pt-2 border-t border-border"
                  >
                    {/* Company Name */}
                    <div className="space-y-2">
                      <Label htmlFor="company_name">{t("auth.register.companyName")}</Label>
                      <Input
                        id="company_name"
                        type="text"
                        placeholder={t("auth.register.companyNamePlaceholder")}
                        className="w-full"
                        {...register("company_name", {
                          required: isTransporter ? t("auth.register.errors.companyNameRequired") : false,
                        })}
                      />
                      {errors.company_name && (
                        <p className="text-sm text-red-500">{errors.company_name.message}</p>
                      )}
                    </div>

                    {/* Business Address */}
                    <div className="space-y-2">
                      <Label htmlFor="business_address">{t("auth.register.businessAddress")}</Label>
                      <Input
                        id="business_address"
                        type="text"
                        placeholder={t("auth.register.businessAddressPlaceholder")}
                        className="w-full"
                        {...register("business_address", {
                          required: isTransporter ? t("auth.register.errors.businessAddressRequired") : false,
                        })}
                      />
                      {errors.business_address && (
                        <p className="text-sm text-red-500">{errors.business_address.message}</p>
                      )}
                    </div>

                    {/* Tax Number */}
                    <div className="space-y-2">
                      <Label htmlFor="tax_number">{t("auth.register.taxNumber")}</Label>
                      <Input
                        id="tax_number"
                        type="text"
                        placeholder={t("auth.register.taxNumberPlaceholder")}
                        className="w-full"
                        {...register("tax_number", {
                          required: isTransporter ? t("auth.register.errors.taxNumberRequired") : false,
                        })}
                      />
                      {errors.tax_number && (
                        <p className="text-sm text-red-500">{errors.tax_number.message}</p>
                      )}
                    </div>

                    {/* Insurance */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="insurance_name">{t("auth.register.insuranceProvider")}</Label>
                        <Input
                          id="insurance_name"
                          type="text"
                          placeholder={t("auth.register.insuranceProviderPlaceholder")}
                          className="w-full"
                          {...register("insurance.name", {
                            required: isTransporter ? t("auth.register.errors.insuranceProviderRequired") : false,
                          })}
                        />
                        {errors.insurance?.name && (
                          <p className="text-sm text-red-500">{errors.insurance.name.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="insurance_policyNumber">{t("auth.register.policyNumber")}</Label>
                          <Input
                            id="insurance_policyNumber"
                            type="text"
                            placeholder={t("auth.register.policyNumberPlaceholder")}
                            className="w-full"
                            {...register("insurance.policyNumber", {
                              required: isTransporter ? t("auth.register.errors.policyNumberRequired") : false,
                            })}
                          />
                          {errors.insurance?.policyNumber && (
                            <p className="text-sm text-red-500">
                              {errors.insurance.policyNumber.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="insurance_expiryDate">{t("auth.register.policyExpiryDate")}</Label>
                          <Input
                            id="insurance_expiryDate"
                            type="date"
                            className="w-full"
                            {...register("insurance.expiryDate", {
                              required: isTransporter ? t("auth.register.errors.expiryDateRequired") : false,
                            })}
                          />
                          {errors.insurance?.expiryDate && (
                            <p className="text-sm text-red-500">
                              {errors.insurance.expiryDate.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="hero"
                className="w-full"
                size="lg"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.register.creatingAccount")}
                  </>
                ) : (
                  t("auth.register.signUp")
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.register.alreadyHaveAccount")}{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  {t("auth.register.signIn")}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
