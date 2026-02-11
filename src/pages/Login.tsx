import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Truck, ArrowLeft, Loader2, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { authService } from "@/services/auth_services";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotEmail, setShowForgotEmail] = useState(false);
  const [showForgotOtp, setShowForgotOtp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const nextLanguage = i18n.language?.startsWith("fr") ? "en" : "fr";
  const languageToggleLabel = i18n.language?.startsWith("fr") ? "EN" : "FR";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const data = await authService.login({ identifier: email, password });
      const role = data.role ?? "user";
      navigate(role === "transporter" ? "/transporter/dashboard" : "/user/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError("");
    setIsForgotLoading(true);
    try {
      await authService.forgotPassword({ email: forgotEmail, password: forgotPassword });
      setShowForgotPassword(false);
      setForgotEmail("");
      setForgotPassword("");
      // Optionally show success message
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleForgotEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError("");
    setIsForgotLoading(true);
    try {
      // First send OTP to the email
      await authService.resendOtp({ email: forgotEmail });
      setShowForgotEmail(false);
      setShowForgotOtp(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleForgotOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError("");
    setIsForgotLoading(true);
    try {
      // Verify the OTP
      await authService.verifyOtp({ email: forgotEmail, otp: forgotOtp });
      setShowForgotOtp(false);
      setShowForgotPassword(true);
    } catch (err) {
      setForgotError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const openForgotPassword = () => {
    setForgotEmail(email);
    setShowForgotEmail(true);
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
            <span>{t("auth.login.backToHome")}</span>
          </Link>

          {/* Login Card */}
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
              {t("auth.login.welcomeBack")}
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              {t("auth.login.subtitle")}
            </p>

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.login.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  className="w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.login.password")}</Label>
                  <button
                    type="button"
                    onClick={openForgotPassword}
                    className="text-sm text-primary hover:text-primary/90 transition-colors"
                  >
                    {t("auth.login.forgotPassword")}
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.login.passwordPlaceholder")}
                  className="w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              <Button variant="hero" className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.login.signingIn")}
                  </>
                ) : (
                  t("auth.login.signIn")
                )}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.login.noAccount")}{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  {t("auth.login.signUp")}
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Forgot Email Modal */}
      <Dialog open={showForgotEmail} onOpenChange={setShowForgotEmail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotEmail} className="space-y-4">
            {forgotError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {forgotError}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={isForgotLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isForgotLoading}>
              {isForgotLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Forgot OTP Modal */}
      <Dialog open={showForgotOtp} onOpenChange={setShowForgotOtp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify OTP</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotOtp} className="space-y-4">
            {forgotError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {forgotError}
              </p>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={forgotEmail}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-otp">OTP Code</Label>
              <Input
                id="forgot-otp"
                type="text"
                placeholder="Enter OTP code"
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                required
                disabled={isForgotLoading}
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isForgotLoading}>
              {isForgotLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {forgotError}
              </p>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={forgotEmail}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forgot-password">New Password</Label>
              <Input
                id="forgot-password"
                type="password"
                placeholder="Enter new password"
                value={forgotPassword}
                onChange={(e) => setForgotPassword(e.target.value)}
                required
                disabled={isForgotLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isForgotLoading}>
              {isForgotLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
