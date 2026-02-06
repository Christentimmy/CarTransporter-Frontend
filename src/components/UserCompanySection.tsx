import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const userFeatures = [
  "Post a car shipment in minutes",
  "View bids from verified transporters",
  "Track shipment status in real-time",
  "Secure payment protection",
  "24/7 customer support",
];

const companyFeatures = [
  "Access to thousands of shipment requests",
  "Anonymous competitive bidding",
  "Build your reputation with reviews",
  "Flexible job management dashboard",
  "Instant payment processing",
];

export const UserCompanySection = () => {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Users */}
          <motion.div
            id="for-users"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 md:p-10 rounded-3xl card-gradient border border-border/50 overflow-hidden group hover:border-primary/30 transition-all duration-300"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
                For Car Owners
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Ship Your Vehicle with Confidence
              </h3>
              <p className="text-muted-foreground mb-8">
                Post your transport request and let verified companies compete
                for the best price. Simple, transparent, and secure.
              </p>

              <ul className="space-y-3 mb-8">
                {userFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* For Companies */}
          <motion.div
            id="for-companies"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative p-8 md:p-10 rounded-3xl bg-primary/5 border border-primary/20 overflow-hidden group hover:border-primary/40 transition-all duration-300"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold mb-4">
                For Transport Companies
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Grow Your Transport Business
              </h3>
              <p className="text-muted-foreground mb-8">
                Join our marketplace and access a steady stream of transport
                jobs. Bid competitively and build your reputation.
              </p>

              <ul className="space-y-3 mb-8">
                {companyFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
