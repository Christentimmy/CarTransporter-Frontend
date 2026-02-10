import { motion } from "framer-motion";
import { ArrowLeft, Users, Target, Award, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const AboutUs = () => {
  const { t } = useTranslation();

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
              {t("aboutUs.backToHome")}
            </Link>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t("aboutUs.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("aboutUs.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t("aboutUs.mission.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("aboutUs.mission.description")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: t("aboutUs.values.community.title"),
                description: t("aboutUs.values.community.description")
              },
              {
                icon: Target,
                title: t("aboutUs.values.efficiency.title"),
                description: t("aboutUs.values.efficiency.description")
              },
              {
                icon: Award,
                title: t("aboutUs.values.quality.title"),
                description: t("aboutUs.values.quality.description")
              },
              {
                icon: Shield,
                title: t("aboutUs.values.trust.title"),
                description: t("aboutUs.values.trust.description")
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8 text-center">
              {t("aboutUs.story.title")}
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-6">
                {t("aboutUs.story.paragraph1")}
              </p>
              <p className="text-muted-foreground mb-6">
                {t("aboutUs.story.paragraph2")}
              </p>
              <p className="text-muted-foreground">
                {t("aboutUs.story.paragraph3")}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t("aboutUs.cta.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("aboutUs.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="hero" size="lg">
                <Link to="/register">
                  {t("aboutUs.cta.getStarted")}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">
                  {t("aboutUs.cta.signIn")}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
