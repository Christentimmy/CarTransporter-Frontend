import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Truck, ArrowLeft, Loader2, Globe } from "lucide-react";
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
        postalCode: "",
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

  const onSubmit = async (data: RegisterPayload) => {
    try {
      setIsLoading(true);
      // Only send insurance details for transporters
      if (data.role !== "transporter") {
        data.insurance = undefined;
      }
      const response = await authService.register(data);
      
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
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold">
                BID<span className="text-primary">4</span>TOW
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold text-center mb-2">
              {t("auth.register.createAccount")}
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              {t("auth.register.subtitle")}
            </p>

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

                    {/* Region */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="region_country">{t("auth.register.country")}</Label>
                        <Select
                          value={watch("region.country") || ""}
                          onValueChange={(value) => {
                            register("region.country", {
                              required: isTransporter ? t("auth.register.errors.countryRequired") : false,
                            }).onChange({ target: { value, name: "region.country" } });
                          }}
                        >
                          <SelectTrigger id="region_country" className="w-full">
                            <SelectValue placeholder={t("auth.register.countryPlaceholder")} />
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
                        <Label htmlFor="region_state">{t("auth.register.stateProvince")}</Label>
                        <Input
                          id="region_state"
                          type="text"
                          placeholder={t("auth.register.stateProvincePlaceholder")}
                          className="w-full"
                          {...register("region.state", {
                            required: isTransporter ? t("auth.register.errors.stateRequired") : false,
                          })}
                        />
                        {errors.region?.state && (
                          <p className="text-sm text-red-500">{errors.region.state.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="region_postalCode">{t("auth.register.postalCode")}</Label>
                        <Input
                          id="region_postalCode"
                          type="text"
                          placeholder={t("auth.register.postalCodePlaceholder")}
                          className="w-full"
                          {...register("region.postalCode", {
                            required: isTransporter ? t("auth.register.errors.postalCodeRequired") : false,
                          })}
                        />
                        {errors.region?.postalCode && (
                          <p className="text-sm text-red-500">{errors.region.postalCode.message}</p>
                        )}
                      </div>
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
