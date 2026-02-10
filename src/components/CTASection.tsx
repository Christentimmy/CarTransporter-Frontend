import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, hsl(156 100% 50% / 0.08), transparent)",
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("landing.cta.title")}{" "}
            <span className="text-gradient">{t("landing.cta.titleHighlight")}</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t("landing.cta.subtitle")}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
