import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { 
  Sparkles, Search, Target, TrendingUp, Users, Eye, Video,
  Youtube, Instagram, Facebook, Linkedin, Twitter, CheckCircle2,
  ArrowRight, Zap, Shield, Globe, Menu, X, MessageSquare
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PlatformBadge } from "@/components/PlatformBadge";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: Search,
      title: "Keyword Explorer",
      description: "Discover high-performing keywords with AI-powered competition analysis and ranking insights.",
    },
    {
      icon: Sparkles,
      title: "SEO Optimizer",
      description: "Transform your video titles, descriptions, and tags with intelligent AI suggestions for maximum reach.",
    },
    {
      icon: Target,
      title: "Competitor Analysis",
      description: "Analyze competitor strategies and uncover growth opportunities in your niche.",
    },
  ];

  const platforms = [
    { name: "YouTube", icon: Youtube, status: "live" as const, date: "Live Now" },
    { name: "Instagram", icon: Instagram, status: "coming_soon" as const, date: "Q2 2026" },
    { name: "TikTok", icon: MessageSquare, status: "coming_soon" as const, date: "Q3 2026" },
    { name: "X (Twitter)", icon: MessageSquare, status: "coming_soon" as const, date: "Q3 2026" },
    { name: "LinkedIn", icon: Linkedin, status: "coming_soon" as const, date: "Q4 2026" },
    { name: "Facebook", icon: Facebook, status: "coming_soon" as const, date: "Q4 2026" },
  ];

  const plans = [
    {
      name: "Free",
      price: 0,
      features: ["5 keyword searches/day", "YouTube only", "1 team member", "Standard support"],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Starter",
      price: 9,
      features: ["20 keyword searches/day", "YouTube only", "1 team member", "Standard support"],
      cta: "Start Free Trial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: 29,
      features: [
        "Unlimited keyword searches",
        "SEO Optimizer",
        "Competitor Analysis",
        "YouTube only",
        "3 team members",
        "Standard support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: 99,
      features: [
        "Everything in Pro",
        "All platforms",
        "10 team members",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "How does the AI-powered optimization work?",
      answer:
        "Our AI analyzes millions of successful videos across platforms to suggest optimized titles, descriptions, and tags that improve discoverability and engagement.",
    },
    {
      question: "Can I switch plans at any time?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and billing is prorated.",
    },
    {
      question: "What platforms do you support?",
      answer:
        "We currently support YouTube with full features. Instagram, TikTok, X, LinkedIn, and Facebook are coming soon throughout 2026.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: "How are daily limits calculated?",
      answer:
        "Daily limits reset every 24 hours at midnight UTC. Unused searches don't roll over to the next day.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! All paid plans include a 14-day free trial. No credit card required to start exploring FaGrow.",
    },
  ];

  return (
    <>
      <SEO
        title="FaGrow - AI-Powered Social Media Growth & SEO"
        description="Grow your YouTube channel with AI-powered keyword research, SEO optimization, and competitor analysis. Multi-platform support coming soon."
      />

      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  FaGrow
                </span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                  Features
                </Link>
                <Link href="#platforms" className="text-sm font-medium hover:text-primary transition-colors">
                  Platforms
                </Link>
                <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  Pricing
                </Link>
                <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
                  FAQ
                </Link>
                <ThemeSwitch />
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Get Started Free
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-2">
                <ThemeSwitch />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-card">
              <div className="container px-4 py-4 space-y-3">
                <Link href="#features" className="block py-2 text-sm font-medium hover:text-primary">
                  Features
                </Link>
                <Link href="#platforms" className="block py-2 text-sm font-medium hover:text-primary">
                  Platforms
                </Link>
                <Link href="#pricing" className="block py-2 text-sm font-medium hover:text-primary">
                  Pricing
                </Link>
                <Link href="#faq" className="block py-2 text-sm font-medium hover:text-primary">
                  FAQ
                </Link>
                <div className="pt-3 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button size="sm" className="w-full">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero */}
        <section className="py-20 md:py-32">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge variant="outline" className="mb-4">
                AI-Powered Social Media Growth
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Grow Your Audience with{" "}
                <span className="text-primary">AI-Powered SEO</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Optimize your content, outrank competitors, and reach millions with intelligent keyword research and
                AI-driven insights.
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features for Growth</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to optimize your content and grow your audience across social platforms.
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

        {/* Platform Roadmap */}
        <section id="platforms" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Multi-Platform Support</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're starting with YouTube and expanding to all major social platforms throughout 2026.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {platforms.map((platform, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        platform.status === "live" ? "bg-accent/10" : "bg-muted"
                      }`}
                    >
                      <platform.icon
                        className={`h-6 w-6 ${platform.status === "live" ? "text-accent" : "text-muted-foreground"}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{platform.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{platform.date}</p>
                    </div>
                    <PlatformBadge status={platform.status} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-muted/30">
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
        <section id="faq" className="py-20">
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
                  <li>
                    <Link href="#platforms" className="text-sm text-muted-foreground hover:text-foreground">
                      Platform Roadmap
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