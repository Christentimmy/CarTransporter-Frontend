import { motion } from "framer-motion";
import { Car, Zap, DollarSign, Shield, Clock, Users } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { useTranslation } from "react-i18next";

const features = [
  {
    icon: Car,
    titleKey: "landing.features.items.postInMinutes.title",
    descriptionKey: "landing.features.items.postInMinutes.description",
  },
  {
    icon: Zap,
    titleKey: "landing.features.items.competingBids.title",
    descriptionKey: "landing.features.items.competingBids.description",
  },
  {
    icon: DollarSign,
    titleKey: "landing.features.items.lowestBidWins.title",
    descriptionKey: "landing.features.items.lowestBidWins.description",
  },
  {
    icon: Shield,
    titleKey: "landing.features.items.anonymousBidding.title",
    descriptionKey: "landing.features.items.anonymousBidding.description",
  },
  {
    icon: Clock,
    titleKey: "landing.features.items.realTimeUpdates.title",
    descriptionKey: "landing.features.items.realTimeUpdates.description",
  },
  {
    icon: Users,
    titleKey: "landing.features.items.verifiedTransporters.title",
    descriptionKey: "landing.features.items.verifiedTransporters.description",
  },
];

export const FeaturesSection = () => {
  const { t } = useTranslation();

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
            {t("landing.features.eyebrow")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("landing.features.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("landing.features.subtitle")}
          </p>
        </motion.div>
      </div>

      {/* Features grid */}
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.titleKey}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descriptionKey)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};
