import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Check, Sparkles } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      features: [
        "5 keyword searches per day",
        "YouTube platform only",
        "1 team member",
        "Standard support",
        "Basic analytics",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Starter",
      price: 9,
      description: "For growing creators",
      features: [
        "20 keyword searches per day",
        "YouTube platform only",
        "1 team member",
        "Standard support",
        "Advanced analytics",
        "Export data",
      ],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: 29,
      description: "For professional creators",
      features: [
        "Unlimited keyword searches",
        "SEO Optimizer (unlimited)",
        "Competitor Analysis (unlimited)",
        "YouTube platform only",
        "3 team members",
        "Priority email support",
        "Advanced analytics",
        "Export data",
        "Custom reports",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For agencies and teams",
      features: [
        "Everything in Pro",
        "All platforms (when available)",
        "10 team members",
        "Priority support with SLA",
        "Dedicated account manager",
        "Custom integrations",
        "API access",
        "Advanced security",
        "Custom training",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards and debit cards through our secure payment processor Razorpay. All transactions are encrypted and secure.",
    },
    {
      question: "Can I change my plan later?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and you'll be charged the prorated difference. Downgrades take effect at the end of your current billing period.",
    },
    {
      question: "What happens when I reach my daily limit?",
      answer:
        "When you reach your daily keyword search limit, you'll need to wait until the next day (resets at midnight UTC) or upgrade to a plan with higher limits. Pro and Enterprise plans offer unlimited searches.",
    },
    {
      question: "Do you offer annual billing?",
      answer:
        "Yes! Contact our sales team for annual billing options. Annual subscriptions come with a discount compared to monthly billing.",
    },
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes, you can cancel your subscription at any time from your billing settings. Your access will continue until the end of your current billing period, and you won't be charged again.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! All paid plans include a 14-day free trial. No credit card required to start. You can explore all features and cancel anytime during the trial without being charged.",
    },
    {
      question: "What's included in priority support?",
      answer:
        "Priority support includes faster response times (typically within 4 hours), direct access to our support team via email, and priority queue for feature requests. Enterprise plans also include phone support and a dedicated account manager.",
    },
    {
      question: "How do team members work?",
      answer:
        "Team members can be invited to collaborate on your account. Each plan has a limit on team members. Team members share the account's usage limits and can access all features based on their assigned permissions.",
    },
  ];

  return (
    <>
      <SEO
        title="Pricing - FaGrow"
        description="Choose the perfect plan for your social media growth needs. Start free, upgrade anytime."
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