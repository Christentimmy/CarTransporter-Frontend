import { motion } from "framer-motion";
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const FAQ = () => {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleExpanded = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: t("faq.categories.gettingStarted.title"),
      description: t("faq.categories.gettingStarted.description"),
      questions: [
        {
          question: t("faq.categories.gettingStarted.questions.createAccount.question"),
          answer: t("faq.categories.gettingStarted.questions.createAccount.answer")
        },
        {
          question: t("faq.categories.gettingStarted.questions.freeToUse.question"),
          answer: t("faq.categories.gettingStarted.questions.freeToUse.answer")
        },
        {
          question: t("faq.categories.gettingStarted.questions.vehicleTypes.question"),
          answer: t("faq.categories.gettingStarted.questions.vehicleTypes.answer")
        },
        {
          question: t("faq.categories.gettingStarted.questions.biddingProcess.question"),
          answer: t("faq.categories.gettingStarted.questions.biddingProcess.answer")
        }
      ]
    },
    {
      title: t("faq.categories.vehicleOwners.title"),
      description: t("faq.categories.vehicleOwners.description"),
      questions: [
        {
          question: t("faq.categories.vehicleOwners.questions.postRequest.question"),
          answer: t("faq.categories.vehicleOwners.questions.postRequest.answer")
        },
        {
          question: t("faq.categories.vehicleOwners.questions.requiredInfo.question"),
          answer: t("faq.categories.vehicleOwners.questions.requiredInfo.answer")
        },
        {
          question: t("faq.categories.vehicleOwners.questions.chooseTransporter.question"),
          answer: t("faq.categories.vehicleOwners.questions.chooseTransporter.answer")
        },
        {
          question: t("faq.categories.vehicleOwners.questions.damageDuringTransport.question"),
          answer: t("faq.categories.vehicleOwners.questions.damageDuringTransport.answer")
        }
      ]
    },
    {
      title: t("faq.categories.transporters.title"),
      description: t("faq.categories.transporters.description"),
      questions: [
        {
          question: t("faq.categories.transporters.questions.becomeVerified.question"),
          answer: t("faq.categories.transporters.questions.becomeVerified.answer")
        },
        // {
        //   question: "What documents do I need to provide?",
        //   answer: "You'll need a valid driver's license, commercial insurance certificate, business registration or operating authority, vehicle registration, and potentially additional permits depending on your service area."
        // },
        {
          question: t("faq.categories.transporters.questions.findAndBid.question"),
          answer: t("faq.categories.transporters.questions.findAndBid.answer")
        },
        {
          question: t("faq.categories.transporters.questions.getPaid.question"),
          answer: t("faq.categories.transporters.questions.getPaid.answer")
        }
      ]
    },
    // {
    //   title: "Payments & Pricing",
    //   description: "Questions about costs, payments, and fees",
    //   questions: [
    //     {
    //       question: "How are transportation costs calculated?",
    //       answer: "Costs depend on distance, vehicle size, transport type (open vs enclosed), timeframe, fuel costs, and current market demand. Transporters provide detailed quotes explaining their pricing structure."
    //     },
    //     {
    //       question: "What payment methods are accepted?",
    //       answer: "We accept major credit cards, debit cards, bank transfers, and digital payment methods. All payments are processed securely through our platform with encryption protection."
    //     },
    //     {
    //       question: "Is my payment secure?",
    //       answer: "Absolutely! We use escrow services to hold payments until delivery is confirmed. This protects both vehicle owners and transporters. All transactions are encrypted and processed through secure payment gateways."
    //     },
    //     {
    //       question: "Can I get a refund?",
    //       answer: "Refund policies vary depending on the timing and circumstances. If you cancel before a transporter is assigned, you may receive a full refund. After assignment, refund policies depend on the transporter's terms and the reason for cancellation."
    //     }
    //   ]
    // },
    {
      title: t("faq.categories.safetyInsurance.title"),
      description: t("faq.categories.safetyInsurance.description"),
      questions: [
        {
          question: t("faq.categories.safetyInsurance.questions.insured.question"),
          answer: t("faq.categories.safetyInsurance.questions.insured.answer")
        },
        {
          question: t("faq.categories.safetyInsurance.questions.coverage.question"),
          answer: t("faq.categories.safetyInsurance.questions.coverage.answer")
        },
        {
          question: t("faq.categories.safetyInsurance.questions.fileClaim.question"),
          answer: t("faq.categories.safetyInsurance.questions.fileClaim.answer")
        },
        {
          question: t("faq.categories.safetyInsurance.questions.safetyMeasures.question"),
          answer: t("faq.categories.safetyInsurance.questions.safetyMeasures.answer")
        }
      ]
    },
    {
      title: t("faq.categories.technicalSupport.title"),
      description: t("faq.categories.technicalSupport.description"),
      questions: [
        {
          question: t("faq.categories.technicalSupport.questions.resetPassword.question"),
          answer: t("faq.categories.technicalSupport.questions.resetPassword.answer")
        },
        {
          question: t("faq.categories.technicalSupport.questions.updateProfile.question"),
          answer: t("faq.categories.technicalSupport.questions.updateProfile.answer")
        },
        {
          question: t("faq.categories.technicalSupport.questions.cantLogin.question"),
          answer: t("faq.categories.technicalSupport.questions.cantLogin.answer")
        },
        {
          question: t("faq.categories.technicalSupport.questions.contactSupport.question"),
          answer: t("faq.categories.technicalSupport.questions.contactSupport.answer")
        }
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
              {t("faq.backToHome")}
            </Link>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t("faq.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("faq.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold mb-2">{category.title}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>

                <div className="space-y-4">
                  {category.questions.map((faq, faqIndex) => {
                    const globalIndex = categoryIndex * 100 + faqIndex;
                    const isExpanded = expandedItems.includes(globalIndex);
                    
                    return (
                      <Card key={faqIndex} className="overflow-hidden">
                        <CardHeader 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => toggleExpanded(globalIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{faq.question}</CardTitle>
                            <div className="flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-primary" />
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        
                        {isExpanded && (
                          <CardContent className="pt-0">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
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
              {t("faq.contact.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("faq.contact.description")}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <HelpCircle className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("faq.contact.cards.helpCenter.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("faq.contact.cards.helpCenter.description")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/help-center">{t("faq.contact.cards.helpCenter.button")}</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{t("faq.contact.cards.support.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("faq.contact.cards.support.description")}
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/help-center">{t("faq.contact.cards.support.button")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("faq.contact.ready")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/login">{t("faq.contact.signIn")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">{t("faq.contact.getStarted")}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
