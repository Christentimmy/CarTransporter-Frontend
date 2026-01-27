import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Truck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Login = () => {
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
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
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
              Welcome Back
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Sign in to your account to continue
            </p>

            {/* Login Form */}
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/90 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full"
                />
              </div>

              <Button variant="hero" className="w-full" size="lg">
                Sign In
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
