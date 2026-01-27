import { motion } from "framer-motion";
import { Car, Zap, DollarSign, Shield, Clock, Users } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Car,
    title: "Post in Minutes",
    description:
      "List your vehicle for transport with just a few details—pickup, drop-off, and car specs. It's that simple.",
  },
  {
    icon: Zap,
    title: "Competing Bids",
    description:
      "Watch verified transport companies compete for your job, driving prices down in real-time.",
  },
  {
    icon: DollarSign,
    title: "Lowest Bid Wins",
    description:
      "Our reverse-auction system ensures you always get the best possible price for your transport.",
  },
  {
    icon: Shield,
    title: "Anonymous Bidding",
    description:
      "All bids are anonymous, ensuring fair competition without bias or favoritism.",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description:
      "Get instant notifications as new bids come in and track your shipment every step of the way.",
  },
  {
    icon: Users,
    title: "Verified Transporters",
    description:
      "Every transport company on our platform is thoroughly verified for safety and reliability.",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Section header */}
      <div className="container mx-auto px-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Why BID4TOW
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            The Smarter Way to Ship
          </h2>
          <p className="text-muted-foreground">
            Our platform revolutionizes car transport by putting you in control.
            Let companies compete for your business.
          </p>
        </motion.div>
      </div>

      {/* Features grid */}
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};
