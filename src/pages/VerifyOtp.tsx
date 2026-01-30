import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { toast } from "sonner";
import { authService } from "@/services/auth_services";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const role = location.state?.role || "user";

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP", {
        style: { background: '#ef4444', color: '#ffffff' },
        icon: '❌',
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.verifyOtp({ email, otp });
      
      toast.success("Email verified successfully! 🎉", {
        style: { background: '#10b981', color: '#ffffff' },
      });
      
      navigate(`/${role === "transporter" ? "transporter" : "user"}/dashboard`);
    } catch (error: any) {
      toast.error(error.message || "Verification failed. Please try again.", {
        style: { background: '#ef4444', color: '#ffffff' },
        icon: '❌',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await authService.resendOtp({ email });
      toast.success("New OTP sent to your email", {
        style: { background: '#10b981', color: '#ffffff' },
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP. Please try again.", {
        style: { background: '#ef4444', color: '#ffffff' },
        icon: '❌',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </div>

          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <h1 className="font-display text-3xl font-bold text-center mb-2">
              Verify Your Email
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              We've sent a verification code to {email || "your email"}
            </p>

            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 4-digit code"
                  className="w-full text-center text-xl tracking-widest"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="\d{4}"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Verifying...</span>
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-primary hover:text-primary/90 font-medium disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtp;
