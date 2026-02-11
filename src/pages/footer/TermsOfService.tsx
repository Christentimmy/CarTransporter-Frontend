import { motion } from "framer-motion";
import { ArrowLeft, FileText, Shield, Users, DollarSign, AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const TermsOfService = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("terms.sections.acceptance.title"),
      description: t("terms.sections.acceptance.description"),
      content: [
        t("terms.sections.acceptance.points.0"),
        t("terms.sections.acceptance.points.1"),
        t("terms.sections.acceptance.points.2"),
        t("terms.sections.acceptance.points.3")
      ]
    },
    {
      title: t("terms.sections.services.title"),
      description: t("terms.sections.services.description"),
      content: [
        t("terms.sections.services.points.0"),
        t("terms.sections.services.points.1"),
        t("terms.sections.services.points.2"),
        t("terms.sections.services.points.3")
      ]
    },
    {
      title: t("terms.sections.userResponsibilities.title"),
      description: t("terms.sections.userResponsibilities.description"),
      content: [
        t("terms.sections.userResponsibilities.points.0"),
        t("terms.sections.userResponsibilities.points.1"),
        t("terms.sections.userResponsibilities.points.2"),
        t("terms.sections.userResponsibilities.points.3")
      ]
    },
    {
      title: t("terms.sections.paymentTerms.title"),
      description: t("terms.sections.paymentTerms.description"),
      content: [
        t("terms.sections.paymentTerms.points.0"),
        t("terms.sections.paymentTerms.points.1"),
        t("terms.sections.paymentTerms.points.2"),
        t("terms.sections.paymentTerms.points.3")
      ]
    },
    {
      title: t("terms.sections.prohibitedActivities.title"),
      description: t("terms.sections.prohibitedActivities.description"),
      content: [
        t("terms.sections.prohibitedActivities.points.0"),
        t("terms.sections.prohibitedActivities.points.1"),
        t("terms.sections.prohibitedActivities.points.2"),
        t("terms.sections.prohibitedActivities.points.3")
      ]
    },
    {
      title: t("terms.sections.intellectualProperty.title"),
      description: t("terms.sections.intellectualProperty.description"),
      content: [
        t("terms.sections.intellectualProperty.points.0"),
        t("terms.sections.intellectualProperty.points.1"),
        t("terms.sections.intellectualProperty.points.2"),
        t("terms.sections.intellectualProperty.points.3")
      ]
    },
    {
      title: t("terms.sections.privacyData.title"),
      description: t("terms.sections.privacyData.description"),
      content: [
        t("terms.sections.privacyData.points.0"),
        t("terms.sections.privacyData.points.1"),
        t("terms.sections.privacyData.points.2"),
        t("terms.sections.privacyData.points.3"),
        t("terms.sections.privacyData.points.4")
      ]
    },
    {
      title: t("terms.sections.limitationLiability.title"),
      description: t("terms.sections.limitationLiability.description"),
      content: [
        t("terms.sections.limitationLiability.points.0"),
        t("terms.sections.limitationLiability.points.1"),
        t("terms.sections.limitationLiability.points.2"),
        t("terms.sections.limitationLiability.points.3"),
        t("terms.sections.limitationLiability.points.4")
      ]
    },
    {
      title: t("terms.sections.termination.title"),
      description: t("terms.sections.termination.description"),
      content: [
        t("terms.sections.termination.points.0"),
        t("terms.sections.termination.points.1"),
        t("terms.sections.termination.points.2"),
        t("terms.sections.termination.points.3"),
        t("terms.sections.termination.points.4")
      ]
    },
    {
      title: t("terms.sections.generalProvisions.title"),
      description: t("terms.sections.generalProvisions.description"),
      content: [
        t("terms.sections.generalProvisions.points.0"),
        t("terms.sections.generalProvisions.points.1"),
        t("terms.sections.generalProvisions.points.2"),
        t("terms.sections.generalProvisions.points.3"),
        t("terms.sections.generalProvisions.points.4")
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t("terms.backToHome")}
            </Link>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <FileText className="w-12 h-12 text-primary" />
              <h1 className="font-display text-4xl md:text-5xl font-bold">
                {t("terms.title")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              {t("terms.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {index === 0 && <Users className="w-6 h-6 text-primary" />}
                        {index === 1 && <FileText className="w-6 h-6 text-primary" />}
                        {index === 2 && <Shield className="w-6 h-6 text-primary" />}
                        {index === 3 && <DollarSign className="w-6 h-6 text-primary" />}
                        {index === 4 && <AlertTriangle className="w-6 h-6 text-primary" />}
                        {index === 5 && <FileText className="w-6 h-6 text-primary" />}
                        {index === 6 && <Shield className="w-6 h-6 text-primary" />}
                        {index === 7 && <Clock className="w-6 h-6 text-primary" />}
                        {index === 8 && <Users className="w-6 h-6 text-primary" />}
                        {index === 9 && <FileText className="w-6 h-6 text-primary" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <CardDescription className="text-sm mt-1">{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl font-bold mb-6">
              {t("terms.contact.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("terms.contact.description")}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("terms.contact.cards.legal.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("terms.contact.cards.legal.description")}
                  </p>
                  <Button variant="outline" size="sm">
                    {t("terms.contact.cards.legal.button")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("terms.contact.cards.support.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("terms.contact.cards.support.description")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/help-center">{t("terms.contact.cards.support.button")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("terms.lastUpdated")}: {new Date().toLocaleDateString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/login">{t("terms.actions.signIn")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">{t("terms.actions.getStarted")}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
