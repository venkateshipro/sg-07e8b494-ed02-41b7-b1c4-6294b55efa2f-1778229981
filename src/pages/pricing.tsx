import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { MobileNav } from "@/components/MobileNav";
import { 
  Sparkles, CheckCircle2, ArrowRight, Menu, X 
} from "lucide-react";
import { SEO } from "@/components/SEO";

const plans = [
  { 
    name: "Free", 
    price: 0, 
    period: "forever",
    features: [
      "5 keyword searches per day",
      "Basic YouTube analytics",
      "1 connected channel",
      "Community support"
    ], 
    cta: "Start Free", 
    highlighted: false,
    description: "Perfect for beginners exploring social media growth"
  },
  { 
    name: "Starter", 
    price: 29, 
    period: "month",
    features: [
      "Unlimited keyword searches",
      "100 AI SEO optimizations per month",
      "5 competitor analyses per month",
      "3 connected channels",
      "Email support"
    ], 
    cta: "Start 14-Day Trial", 
    highlighted: false,
    description: "For growing creators ready to scale"
  },
  { 
    name: "Pro", 
    price: 79, 
    period: "month",
    features: [
      "Unlimited AI SEO optimizations",
      "Unlimited competitor analysis",
      "Trend forecasting alerts",
      "10 connected channels",
      "Priority support",
      "Advanced analytics dashboard"
    ], 
    cta: "Start 14-Day Trial", 
    highlighted: true,
    description: "For professional creators and agencies"
  },
  { 
    name: "Enterprise", 
    price: 199, 
    period: "month",
    features: [
      "Unlimited everything",
      "API access for integrations",
      "Custom AI model training",
      "Unlimited channels",
      "Dedicated success manager",
      "Team collaboration tools",
      "White-label options"
    ], 
    cta: "Contact Sales", 
    highlighted: false,
    description: "For teams and enterprises at scale"
  }
];

const faqs = [
  { 
    question: "How does billing work?", 
    answer: "All paid plans are billed monthly via Razorpay. You can cancel anytime and you'll retain access until the end of your billing period." 
  },
  { 
    question: "Can I switch plans later?", 
    answer: "Yes! You can upgrade or downgrade your plan at any time from your billing dashboard. Changes take effect immediately." 
  },
  { 
    question: "Do you offer refunds?", 
    answer: "We offer a 14-day free trial for all paid plans so you can test the platform risk-free. After that, refunds are evaluated on a case-by-case basis." 
  },
  { 
    question: "What payment methods do you accept?", 
    answer: "We accept all major credit/debit cards, UPI, net banking, and wallets through our secure payment partner Razorpay." 
  },
  { 
    question: "Is there a setup fee?", 
    answer: "No setup fees, no hidden costs. You only pay the plan price listed." 
  }
];

export default function Pricing() {
  return (
    <>
      <SEO 
        title="Pricing - FaGrow | Affordable Plans for Social Media Growth"
        description="Choose the perfect plan for your social media growth journey. From free forever to enterprise-scale solutions. 14-day free trial on all paid plans."
        image="/og-image.png"
        url="/pricing"
      />
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">FaGrow</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <Badge variant="outline" className="mb-4">
                Pricing
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold">
                Choose the perfect plan for your growth
              </h1>
              <p className="text-xl text-muted-foreground">
                Start free, upgrade when you're ready. All plans include a 14-day free trial.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan, idx) => (
                <Card key={idx} className={plan.highlighted ? "border-primary shadow-lg relative" : "relative"}>
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/signup">
                      <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
              <p className="text-muted-foreground">Detailed feature comparison across all plans</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold">Free</th>
                    <th className="text-center py-4 px-4 font-semibold">Starter</th>
                    <th className="text-center py-4 px-4 font-semibold bg-primary/5">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4">Keyword searches/day</td>
                    <td className="text-center py-4 px-4">5</td>
                    <td className="text-center py-4 px-4">20</td>
                    <td className="text-center py-4 px-4 bg-primary/5">Unlimited</td>
                    <td className="text-center py-4 px-4">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4">SEO Optimizer</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 bg-primary/5">
                      <Check className="h-5 w-5 text-accent mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-accent mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4">Competitor Analysis</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4">—</td>
                    <td className="text-center py-4 px-4 bg-primary/5">
                      <Check className="h-5 w-5 text-accent mx-auto" />
                    </td>
                    <td className="text-center py-4 px-4">
                      <Check className="h-5 w-5 text-accent mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4">Platforms</td>
                    <td className="text-center py-4 px-4">YouTube</td>
                    <td className="text-center py-4 px-4">YouTube</td>
                    <td className="text-center py-4 px-4 bg-primary/5">YouTube</td>
                    <td className="text-center py-4 px-4">All platforms</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4">Team members</td>
                    <td className="text-center py-4 px-4">1</td>
                    <td className="text-center py-4 px-4">1</td>
                    <td className="text-center py-4 px-4 bg-primary/5">3</td>
                    <td className="text-center py-4 px-4">10</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4">Support</td>
                    <td className="text-center py-4 px-4">Standard</td>
                    <td className="text-center py-4 px-4">Standard</td>
                    <td className="text-center py-4 px-4 bg-primary/5">Priority</td>
                    <td className="text-center py-4 px-4">Priority + SLA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Everything you need to know about our pricing</p>
            </div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to grow your audience?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start with a free account and upgrade when you're ready. No credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg">Get Started Free</Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-semibold">FaGrow</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2026 FaGrow. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}