import { motion } from "framer-motion";
import { FileText, Users, Trophy, Truck } from "lucide-react";
import { useTranslation } from "react-i18next";

const steps = [
  {
    icon: FileText,
    step: "01",
    titleKey: "landing.howItWorks.steps.postShipment.title",
    descriptionKey: "landing.howItWorks.steps.postShipment.description",
  },
  {
    icon: Users,
    step: "02",
    titleKey: "landing.howItWorks.steps.receiveBids.title",
    descriptionKey: "landing.howItWorks.steps.receiveBids.description",
  },
  {
    icon: Trophy,
    step: "03",
    titleKey: "landing.howItWorks.steps.lowestWins.title",
    descriptionKey: "landing.howItWorks.steps.lowestWins.description",
  },
  {
    icon: Truck,
    step: "04",
    titleKey: "landing.howItWorks.steps.trackReceive.title",
    descriptionKey: "landing.howItWorks.steps.trackReceive.description",
  },
];

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-20 relative">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            {t("landing.howItWorks.eyebrow")}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("landing.howItWorks.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("landing.howItWorks.subtitle")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step number with icon */}
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center relative z-0 group-hover:border-primary/50 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center z-10">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold mb-2">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(step.descriptionKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
