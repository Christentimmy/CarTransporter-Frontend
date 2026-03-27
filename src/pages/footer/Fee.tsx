import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Fee = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <Navbar /> */}
      
      <main className="relative z-10 pt-20 pb-16">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t("fee.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("fee.subtitle")}
            </p>
          </motion.div>

          {/* Fee Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-card/50 border border-border/50 rounded-xl p-8 md:p-12">
              <div className="prose prose-gray max-w-none">
                <h2 className="text-2xl font-semibold mb-4">{t("fee.platformFeeStructure")}</h2>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-8">
                  <p className="text-lg font-medium text-primary mb-2">
                    {t("fee.highlight")}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{t("fee.howItWorks.title")}</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {t("fee.howItWorks.points.0")}
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {t("fee.howItWorks.points.1")}
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {t("fee.howItWorks.points.2")}
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {t("fee.howItWorks.points.3")}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">{t("fee.example.title")}</h3>
                    <div className="bg-muted/50 rounded-lg p-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>{t("fee.example.winningBidAmount")}</span>
                          <span className="font-medium">$1,000.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("fee.example.serviceFee")}</span>
                          <span className="font-medium text-primary">$100.00</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>{t("fee.example.totalPaidByUser")}</span>
                            <span>$1,100.00</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>{t("fee.example.amountReceivedByTransporter")}</span>
                            <span>$900.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">{t("fee.majorAccounts.title")}</h3>
                    <p className="text-muted-foreground">
                      {t("fee.majorAccounts.description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      {/* <Footer /> */}
    </div>
  );
};

export default Fee;
