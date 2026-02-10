import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

export const UserCompanySection = () => {
  const { t } = useTranslation();

  const userFeatures = [
    t("landing.userCompany.userFeatures.f1"),
    t("landing.userCompany.userFeatures.f2"),
    t("landing.userCompany.userFeatures.f3"),
    t("landing.userCompany.userFeatures.f4"),
    t("landing.userCompany.userFeatures.f5"),
  ];

  const companyFeatures = [
    t("landing.userCompany.companyFeatures.f1"),
    t("landing.userCompany.companyFeatures.f2"),
    t("landing.userCompany.companyFeatures.f3"),
    t("landing.userCompany.companyFeatures.f4"),
    t("landing.userCompany.companyFeatures.f5"),
  ];

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
                {t("landing.userCompany.forCarOwners")}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                {t("landing.userCompany.shipWithConfidence")}
              </h3>
              <p className="text-muted-foreground mb-8">
                {t("landing.userCompany.shipWithConfidenceDesc")}
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
                {t("landing.userCompany.forTransportCompanies")}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
                {t("landing.userCompany.growBusiness")}
              </h3>
              <p className="text-muted-foreground mb-8">
                {t("landing.userCompany.growBusinessDesc")}
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
