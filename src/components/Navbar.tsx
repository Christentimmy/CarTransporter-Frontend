import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const navLinks = [
  { nameKey: "landing.nav.home", href: "#home" },
  { nameKey: "landing.nav.howItWorks", href: "#how-it-works" },
  { nameKey: "landing.nav.forUsers", href: "#for-users" },
  { nameKey: "landing.nav.forCompanies", href: "#for-companies" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const nextLanguage = i18n.language?.startsWith("fr") ? "en" : "fr";
  const languageToggleLabel = i18n.language?.startsWith("fr") ? "EN" : "FR";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xl font-bold">
                BID<span className="text-primary">4</span>TOW
              </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.nameKey}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium relative group"
              >
                {t(link.nameKey)}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => i18n.changeLanguage(nextLanguage)}
            >
              {languageToggleLabel}
            </Button>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t("landing.nav.login")}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="sm">
                {t("landing.nav.register")}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.nameKey}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {t(link.nameKey)}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="justify-start w-full"
                  onClick={() => {
                    i18n.changeLanguage(nextLanguage);
                    setIsOpen(false);
                  }}
                >
                  {languageToggleLabel}
                </Button>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="justify-start w-full">
                    {t("landing.nav.login")}
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="justify-start w-full">
                    {t("landing.nav.register")}
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
