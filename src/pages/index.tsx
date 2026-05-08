import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { MobileNav } from "@/components/MobileNav";
import { 
  Sparkles, Search, Target, CheckCircle2
} from "lucide-react";
import { SEO } from "@/components/SEO";

const features = [
  { title: "AI Keyword Explorer", description: "Discover high-volume, low-competition keywords before your competitors do.", icon: Search },
  { title: "SEO Optimization", description: "Generate optimized titles, descriptions, and tags tailored to your niche.", icon: Sparkles },
  { title: "Competitor Analysis", description: "Reverse-engineer successful channels to find what works in your industry.", icon: Target }
];

const plans = [
  { name: "Free", price: 0, features: ["5 keyword searches/day", "Basic YouTube analytics", "1 connected channel", "Community support"], cta: "Start Free", highlighted: false },
  { name: "Starter", price: 29, features: ["Unlimited keyword searches", "100 AI SEO optimizations/mo", "5 competitor analyses/mo", "3 connected channels", "Email support"], cta: "Start 14-Day Trial", highlighted: false },
  { name: "Pro", price: 79, features: ["Unlimited AI SEO optimizations", "Unlimited competitor analysis", "Trend forecasting alerts", "10 connected channels", "Priority support"], cta: "Start 14-Day Trial", highlighted: true },
  { name: "Enterprise", price: 199, features: ["Unlimited everything", "API access", "Custom AI models", "Unlimited channels", "Dedicated success manager", "Team collaboration"], cta: "Contact Sales", highlighted: false }
];

const faqs = [
  { question: "How does the AI SEO optimization work?", answer: "Our AI analyzes top-performing content in your niche and generates optimized titles, descriptions, and tags designed to rank higher in YouTube's algorithm." },
  { question: "Can I connect multiple YouTube channels?", answer: "Yes, depending on your plan. Starter allows 3 channels, Pro allows 10, and Enterprise offers unlimited channel connections." },
  { question: "Is my data secure?", answer: "Absolutely. We use industry-standard encryption and security practices to protect your YouTube channel data and ensure your privacy." },
  { question: "Do you offer a free trial?", answer: "Yes, all paid plans come with a 14-day free trial. No credit card is required to start." }
];

export default function Home() {
  return (
    <>
      <SEO 
        title="FaGrow - YouTube SEO & Growth Tool"
        description="Grow your YouTube channel with AI-powered keyword research, SEO optimization, and competitor analysis."
        image="/og-image.png"
        url="/"
      />
      
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  FaGrow
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors py-2 px-1">
                  Features
                </Link>
                <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors py-2 px-1">
                  Pricing
                </Link>
                <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors py-2 px-1">
                  FAQ
                </Link>
                <ThemeSwitch />
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="h-10 bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    Get Started Free
                  </Button>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeSwitch />
                <MobileNav />
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="mb-4">
                AI-Powered YouTube Growth
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Grow Your YouTube Channel with{" "}
                <span className="text-primary">AI-Powered SEO</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Optimize your content, outrank competitors, and reach millions with intelligent keyword research and
                AI-driven insights for YouTube creators.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">14-day free trial • No credit card required</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for YouTube Growth</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to optimize your YouTube content and grow your audience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the plan that fits your needs. Upgrade or downgrade at any time.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {plans.map((plan, idx) => (
                <Card key={idx} className={plan.highlighted ? "border-primary shadow-lg" : ""}>
                  {plan.highlighted && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-semibold rounded-t-lg">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
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

        {/* FAQ */}
        <section id="faq" className="py-20 bg-muted/30">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about FaGrow and our services.
              </p>
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

        {/* Footer */}
        <footer className="border-t border-border py-12 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Support</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">
                      Documentation
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
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