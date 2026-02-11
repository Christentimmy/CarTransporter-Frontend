import { motion } from "framer-motion";
import { ArrowLeft, Shield, Users, FileText, Lock, Eye, Database } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("privacy.sections.dataCollection.title"),
      description: t("privacy.sections.dataCollection.description"),
      content: [
        t("privacy.sections.dataCollection.points.0"),
        t("privacy.sections.dataCollection.points.1"),
        t("privacy.sections.dataCollection.points.2"),
        t("privacy.sections.dataCollection.points.3")
      ]
    },
    {
      title: t("privacy.sections.dataUsage.title"),
      description: t("privacy.sections.dataUsage.description"),
      content: [
        t("privacy.sections.dataUsage.points.0"),
        t("privacy.sections.dataUsage.points.1"),
        t("privacy.sections.dataUsage.points.2"),
        t("privacy.sections.dataUsage.points.3")
      ]
    },
    {
      title: t("privacy.sections.dataProtection.title"),
      description: t("privacy.sections.dataProtection.description"),
      content: [
        t("privacy.sections.dataProtection.points.0"),
        t("privacy.sections.dataProtection.points.1"),
        t("privacy.sections.dataProtection.points.2"),
        t("privacy.sections.dataProtection.points.3")
      ]
    },
    {
      title: t("privacy.sections.userRights.title"),
      description: t("privacy.sections.userRights.description"),
      content: [
        t("privacy.sections.userRights.points.0"),
        t("privacy.sections.userRights.points.1"),
        t("privacy.sections.userRights.points.2"),
        t("privacy.sections.userRights.points.3")
      ]
    },
    {
      title: t("privacy.sections.dataSharing.title"),
      description: t("privacy.sections.dataSharing.description"),
      content: [
        t("privacy.sections.dataSharing.points.0"),
        t("privacy.sections.dataSharing.points.1"),
        t("privacy.sections.dataSharing.points.2"),
        t("privacy.sections.dataSharing.points.3")
      ]
    },
    {
      title: t("privacy.sections.international.title"),
      description: t("privacy.sections.international.description"),
      content: [
        t("privacy.sections.international.points.0"),
        t("privacy.sections.international.points.1"),
        t("privacy.sections.international.points.2")
      ]
    },
    {
      title: t("privacy.sections.retention.title"),
      description: t("privacy.sections.retention.description"),
      content: [
        t("privacy.sections.retention.points.0"),
        t("privacy.sections.retention.points.1"),
        t("privacy.sections.retention.points.2")
      ]
    },
    {
      title: t("privacy.sections.children.title"),
      description: t("privacy.sections.children.description"),
      content: [
        t("privacy.sections.children.points.0"),
        t("privacy.sections.children.points.1"),
        t("privacy.sections.children.points.2")
      ]
    },
    {
      title: t("privacy.sections.changes.title"),
      description: t("privacy.sections.changes.description"),
      content: [
        t("privacy.sections.changes.points.0"),
        t("privacy.sections.changes.points.1"),
        t("privacy.sections.changes.points.2")
      ]
    },
    {
      title: t("privacy.sections.contact.title"),
      description: t("privacy.sections.contact.description"),
      content: [
        t("privacy.sections.contact.points.0"),
        t("privacy.sections.contact.points.1"),
        t("privacy.sections.contact.points.2"),
        t("privacy.sections.contact.points.3")
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
              {t("privacy.backToHome")}
            </Link>
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <Shield className="w-12 h-12 text-primary" />
              <h1 className="font-display text-4xl md:text-5xl font-bold">
                {t("privacy.title")}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              {t("privacy.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Content */}
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
                        {index === 0 && <Database className="w-6 h-6 text-primary" />}
                        {index === 1 && <FileText className="w-6 h-6 text-primary" />}
                        {index === 2 && <Lock className="w-6 h-6 text-primary" />}
                        {index === 3 && <Users className="w-6 h-6 text-primary" />}
                        {index === 4 && <Eye className="w-6 h-6 text-primary" />}
                        {index === 5 && <Shield className="w-6 h-6 text-primary" />}
                        {index === 6 && <FileText className="w-6 h-6 text-primary" />}
                        {index === 7 && <Users className="w-6 h-6 text-primary" />}
                        {index === 8 && <FileText className="w-6 h-6 text-primary" />}
                        {index === 9 && <Shield className="w-6 h-6 text-primary" />}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
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
              {t("privacy.contact.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("privacy.contact.description")}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("privacy.contact.cards.privacy.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("privacy.contact.cards.privacy.description")}
                  </p>
                  <Button variant="outline" size="sm">
                    {t("privacy.contact.cards.privacy.button")}
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("privacy.contact.cards.support.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("privacy.contact.cards.support.description")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/help-center">{t("privacy.contact.cards.support.button")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("privacy.lastUpdated")}: {new Date().toLocaleDateString()}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/login">{t("privacy.actions.signIn")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">{t("privacy.actions.getStarted")}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
