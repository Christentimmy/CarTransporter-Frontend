import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Truck, ArrowLeft } from "lucide-react";
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

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const isTransporter = role === "transporter";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Add actual registration logic here
    // For now, just redirect to dashboard
    navigate("/user/dashboard");
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
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
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
              Create Account
            </h1>
            <p className="text-center text-muted-foreground mb-8">
              Sign up to get started
            </p>

            {/* Register Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full"
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="w-full"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full"
                  required
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="transporter">Transporter</SelectItem>
                  </SelectContent>
                </Select>
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
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        type="text"
                        placeholder="Enter your company name"
                        className="w-full"
                        required={isTransporter}
                      />
                    </div>

                    {/* Business Address */}
                    <div className="space-y-2">
                      <Label htmlFor="business_address">Business Address</Label>
                      <Input
                        id="business_address"
                        type="text"
                        placeholder="Enter your business address"
                        className="w-full"
                        required={isTransporter}
                      />
                    </div>

                    {/* Tax Number */}
                    <div className="space-y-2">
                      <Label htmlFor="tax_number">Tax Number</Label>
                      <Input
                        id="tax_number"
                        type="text"
                        placeholder="Enter your tax number"
                        className="w-full"
                        required={isTransporter}
                      />
                    </div>

                    {/* Region */}
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select value={region} onValueChange={setRegion} required={isTransporter}>
                        <SelectTrigger id="region" className="w-full">
                          <SelectValue placeholder="Select your region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="north">North</SelectItem>
                          <SelectItem value="south">South</SelectItem>
                          <SelectItem value="east">East</SelectItem>
                          <SelectItem value="west">West</SelectItem>
                          <SelectItem value="central">Central</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button variant="hero" className="w-full" size="lg" type="submit">
                Sign Up
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  Sign in
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
