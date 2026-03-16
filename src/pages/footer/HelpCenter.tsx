import { motion } from "framer-motion";
import { ArrowLeft, Search, HelpCircle, BookOpen, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";

const HelpCenter = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    {
      id: "getting-started",
      icon: HelpCircle,
      title: t("helpCenter.categories.gettingStarted.title"),
      description: t("helpCenter.categories.gettingStarted.description"),
      articles: [
        t("helpCenter.categories.gettingStarted.articles.howToRegister"),
        t("helpCenter.categories.gettingStarted.articles.howToPostRequest"),
        t("helpCenter.categories.gettingStarted.articles.howToBid"),
        t("helpCenter.categories.gettingStarted.articles.accountVerification")
      ],
      color: "bg-blue-500"
    },
    {
      id: "user-guide",
      icon: BookOpen,
      title: t("helpCenter.categories.userGuide.title"),
      description: t("helpCenter.categories.userGuide.description"),
      articles: [
        t("helpCenter.categories.userGuide.articles.postingRequests"),
        t("helpCenter.categories.userGuide.articles.managingBids"),
        t("helpCenter.categories.userGuide.articles.paymentProcess"),
        t("helpCenter.categories.userGuide.articles.trackingShipments")
      ],
      color: "bg-green-500"
    },
    {
      id: "transporter-guide",
      icon: BookOpen,
      title: t("helpCenter.categories.transporterGuide.title"),
      description: t("helpCenter.categories.transporterGuide.description"),
      articles: [
        t("helpCenter.categories.transporterGuide.articles.becomingTransporter"),
        t("helpCenter.categories.transporterGuide.articles.findingRequests"),
        t("helpCenter.categories.transporterGuide.articles.winningBids"),
        t("helpCenter.categories.transporterGuide.articles.withdrawals")
      ],
      color: "bg-purple-500"
    }
  ];

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
              {t("helpCenter.backToHome")}
            </Link>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              {t("helpCenter.title")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("helpCenter.subtitle")}
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder={t("helpCenter.searchPlaceholder")}
                className="pl-12 py-3 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {t("helpCenter.categories.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("helpCenter.categories.description")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToCategory(category.id)}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mb-4`}>
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li key={articleIndex} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                          {article}
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

      {/* Category Details Sections */}
      {categories.map((category, index) => (
        <section key={category.id} id={category.id} className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-16 h-16 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-3xl font-bold">{category.title}</h2>
                  <p className="text-muted-foreground text-lg">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {category.articles.map((article, articleIndex) => (
                  <motion.div
                    key={articleIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: articleIndex * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-lg mb-3">{article}</h3>
                      <p className="text-muted-foreground">
                        {article === t("helpCenter.categories.gettingStarted.articles.howToRegister") && (
                          <>
                            Creating an account is simple! Click the 'Sign Up' button on our homepage, fill in your personal information, verify your email address, and you're ready to start using BID4TOW. The whole process takes less than 5 minutes.
                          </>
                        )}
                        {article === t("helpCenter.categories.gettingStarted.articles.howToPostRequest") && (
                          <>
                            Log into your account, click 'Post Request', fill in details about your vehicle, pickup and delivery locations, preferred dates, and any special requirements. Then submit your request and wait for transporters to bid.
                          </>
                        )}
                        {article === t("helpCenter.categories.gettingStarted.articles.howToBid") && (
                          <>
                            As a transporter, browse available requests in your service area, review request details, and submit competitive bids with your pricing. The lowest bid typically wins when the auction ends.
                          </>
                        )}
                        {article === t("helpCenter.categories.gettingStarted.articles.accountVerification") && (
                          <>
                            Account verification ensures trust on our platform. Vehicle owners and transporters must verify their email and phone number. Transporters also need to submit business documents and insurance for full access.
                          </>
                        )}
                        {article === t("helpCenter.categories.userGuide.articles.postingRequests") && (
                          <>
                            When posting a transportation request, provide detailed information about your vehicle (make, model, year), pickup and delivery locations, preferred timeline, and any special requirements like enclosed transport or insurance needs.
                          </>
                        )}
                        {article === t("helpCenter.categories.userGuide.articles.managingBids") && (
                          <>
                            Review all bids from verified transporters, compare prices, and select the best offer for your needs.         
                          </>
                        )}
                        {article === t("helpCenter.categories.userGuide.articles.paymentProcess") && (
                          <>
                            Once you accept a bid, payment is held in escrow until the vehicle is successfully delivered. You can make payment through our secure platform using credit card.
                          </>
                        )}
                        {article === t("helpCenter.categories.userGuide.articles.trackingShipments") && (
                          <>
                            Track your shipment through the platform. Transporters update status as they progress through pickup, in-transit, and delivery phases.
                          </>
                        )}
                        {article === t("helpCenter.categories.transporterGuide.articles.becomingTransporter") && (
                          <>
                            Sign up for a transporter account, complete your profile with business information, submit required documents (business license, insurance, etc.), undergo background verification, and once approved, you can start bidding on transportation requests.
                          </>
                        )}
                        {article === t("helpCenter.categories.transporterGuide.articles.findingRequests") && (
                          <>
                            Browse available transportation requests in your service area. Use filters to find requests that match your vehicle capacity, distance and preferences.
                          </>
                        )}
                        {article === t("helpCenter.categories.transporterGuide.articles.winningBids") && (
                          <>
                            Submit competitive bids that reflect your costs while remaining profitable. Consider factors like fuel, tolls, insurance, and labor. Building a good rating through reliable service will help you win more bids over time.
                          </>
                        )}
                        {article === t("helpCenter.categories.transporterGuide.articles.withdrawals") && (
                          <>
                            Funds from completed shipments are held in escrow until delivery confirmation. Once released, you can request withdrawals through your dashboard. Choose from available payment methods.
                          </>
                        )}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* Contact Support Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {t("helpCenter.contactSupport.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {t("helpCenter.contactSupport.description")}
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("helpCenter.contactSupport.email.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("helpCenter.contactSupport.email.description")}
                  </p>
                  <a href="mailto:info@bid4tow.com" className="text-primary hover:underline">
                    info@bid4tow.com
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{t("helpCenter.contactSupport.phone.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("helpCenter.contactSupport.phone.description")}
                  </p>
                  <a href="tel:+1-514-616-9889" className="text-primary hover:underline">
                    +1-514-616-9889
                  </a>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {t("helpCenter.contactSupport.alreadyUser")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild variant="hero" size="lg">
                  <Link to="/login">
                    {t("helpCenter.contactSupport.signIn")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/register">
                    {t("helpCenter.contactSupport.getStarted")}
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

export default HelpCenter;
