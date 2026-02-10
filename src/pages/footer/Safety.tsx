import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, AlertTriangle, CheckCircle, FileText, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const Safety = () => {
  const { t } = useTranslation();

  const safetyFeatures = [
    {
      icon: Shield,
      title: t("safety.features.verification.title"),
      description: t("safety.features.verification.description"),
      points: [
        t("safety.features.verification.points.identity"),
        t("safety.features.verification.points.documents"),
        t("safety.features.verification.points.insurance")
      ]
    },
    {
      icon: Lock,
      title: t("safety.features.securePayments.title"),
      description: t("safety.features.securePayments.description"),
      points: [
        t("safety.features.securePayments.points.encrypted"),
        t("safety.features.securePayments.points.escrow"),
        t("safety.features.securePayments.points.tracking")
      ]
    },
    {
      icon: CheckCircle,
      title: t("safety.features.disputeResolution.title"),
      description: t("safety.features.disputeResolution.description"),
      points: [
        t("safety.features.disputeResolution.points.mediation"),
        t("safety.features.disputeResolution.points.evidence"),
        t("safety.features.disputeResolution.points.resolution")
      ]
    },
    {
      icon: FileText,
      title: t("safety.features.documentation.title"),
      description: t("safety.features.documentation.description"),
      points: [
        t("safety.features.documentation.points.contracts"),
        t("safety.features.documentation.points.photos"),
        t("safety.features.documentation.points.communication")
      ]
    }
  ];

  const emergencyProcedures = [
    {
      title: t("safety.emergency.accidents.title"),
      description: t("safety.emergency.accidents.description"),
      steps: [
        t("safety.emergency.accidents.steps.ensureSafety"),
        t("safety.emergency.accidents.steps.contactAuthorities"),
        t("safety.emergency.accidents.steps.documentEverything"),
        t("safety.emergency.accidents.steps.notifySupport")
      ]
    },
    {
      title: t("safety.emergency.breakdown.title"),
      description: t("safety.emergency.breakdown.description"),
      steps: [
        t("safety.emergency.breakdown.steps.pullOver"),
        t("safety.emergency.breakdown.steps.hazardLights"),
        t("safety.emergency.breakdown.steps.callAssistance"),
        t("safety.emergency.breakdown.steps.stayWithVehicle")
      ]
    },
    {
      title: t("safety.emergency.lostVehicle.title"),
      description: t("safety.emergency.lostVehicle.description"),
      steps: [
        t("safety.emergency.lostVehicle.steps.contactPolice"),
        t("safety.emergency.lostVehicle.steps.notifyPlatform"),
        t("safety.emergency.lostVehicle.steps.contactOwner"),
        t("safety.emergency.lostVehicle.steps.documentation")
      ]
    }
  ];

  const safetyTips = [
    {
      title: t("safety.tips.beforeTransport.title"),
      tips: [
        "Research transporter credentials and reviews",
        "Verify transporter identity and licenses",
        "Meet transporter in person when possible",
        "Read reviews from other users"
      ]
    },
    {
      title: t("safety.tips.duringTransport.title"),
      tips: [
        "Maintain regular contact with transporter",
        "Track shipment progress in real-time",
        "Take photos before handover and after delivery",
        "Remove valuable personal items from vehicle"
      ]
    },
    {
      title: t("safety.tips.afterTransport.title"),
      tips: [
        "Thoroughly inspect vehicle upon delivery",
        "Document any issues immediately with photos",
        "Confirm delivery condition matches agreement",
        "Leave honest review to help community"
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
              {t("safety.backToHome")}
            </Link>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t("safety.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("safety.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t("safety.features.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("safety.features.description")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {safetyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{point}</span>
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

      {/* Emergency Procedures Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t("safety.emergency.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("safety.emergency.description")}
            </p>
          </motion.div>

          <div className="space-y-8">
            {emergencyProcedures.map((procedure, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{procedure.title}</CardTitle>
                    <CardDescription>{procedure.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {procedure.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                            {stepIndex + 1}
                          </div>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Tips Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t("safety.tips.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("safety.tips.description")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
            {safetyTips.map((tipCategory, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{tipCategory.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tipCategory.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
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
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t("safety.contact.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("safety.contact.description")}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("safety.contact.emergency.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("safety.contact.emergency.description")}
                  </p>
                  <a href="tel:911" className="text-primary hover:underline font-semibold">
                    911
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("safety.contact.support.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("safety.contact.support.description")}
                  </p>
                  <a href="mailto:safety@bid4tow.com" className="text-primary hover:underline">
                    safety@bid4tow.com
                  </a>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("safety.contact.alreadyUser")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/login">
                    {t("safety.contact.signIn")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">
                    {t("safety.contact.getStarted")}
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Safety;
