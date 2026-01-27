import { motion } from "framer-motion";
import { FileText, Users, Trophy, Truck } from "lucide-react";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Post Your Shipment",
    description:
      "Enter your vehicle details, pickup and drop-off locations, and preferred timeline.",
  },
  {
    icon: Users,
    step: "02",
    title: "Receive Competing Bids",
    description:
      "Verified transport companies anonymously submit their best competitive bids.",
  },
  {
    icon: Trophy,
    step: "03",
    title: "Lowest Bid Wins",
    description:
      "Accept the lowest bid or let our system auto-select the best offer for you.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Track & Receive",
    description:
      "Monitor your shipment in real-time and receive your vehicle at the destination.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 bg-card/50">
      <div className="container mx-auto px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Simple Process
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground">
            Four simple steps to get your vehicle transported at the best
            possible price.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-1/2" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Step number with icon */}
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center relative z-10 group-hover:border-primary/50 transition-colors">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
