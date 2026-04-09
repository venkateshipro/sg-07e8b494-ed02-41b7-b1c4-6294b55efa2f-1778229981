import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Youtube, Instagram, MessageSquare, Linkedin, Facebook, CheckCircle2 } from "lucide-react";
import { PlatformBadge } from "@/components/PlatformBadge";
import { PlanCard } from "@/components/PlanCard";
import { platformService } from "@/services/platformService";
import { planService } from "@/services/planService";
import type { PlatformConfig, Plan } from "@/types/database";
import { SEO } from "@/components/SEO";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/signup");
      return;
    }

    // Load platforms and plans
    platformService.getAllPlatforms().then(setPlatforms);
    planService.getAllPlans().then(setPlans);
  }, [user, router]);

  const handlePlatformSelect = () => {
    setStep(3);
  };

  const handleYouTubeConnect = () => {
    // YouTube OAuth will be implemented in YouTube integration task
    setStep(4);
  };

  const handlePlanSelect = async (planSlug: string) => {
    setLoading(true);
    // Plan selection will be implemented in billing task
    // For now, just mark free plan and proceed
    await refreshUser();
    router.push("/dashboard");
  };

  const platformIcons: Record<string, typeof Youtube> = {
    youtube: Youtube,
    instagram: Instagram,
    tiktok: MessageSquare,
    x: MessageSquare,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  return (
    <>
      <SEO 
        title="Welcome to FaGrow"
        description="Complete your onboarding to start growing your social media"
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Progress indicator */}
          <div className="flex items-center justify-center mb-8 space-x-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                    ? "w-2 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Welcome */}
          {step === 1 && (
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
                    <Sparkles className="h-9 w-9 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Welcome to FaGrow</CardTitle>
                <CardDescription className="text-lg">
                  Your AI-powered social media growth platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Let's get you set up in just a few steps. We'll help you connect your platforms,
                  optimize your content with AI, and start growing your audience.
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Button size="lg" onClick={() => setStep(2)}>
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 2: Platform Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Choose Your Platform</CardTitle>
                <CardDescription>
                  Select the platform you want to grow. More platforms coming soon!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {platforms.map((platform) => {
                    const Icon = platformIcons[platform.platform_name.toLowerCase()] || MessageSquare;
                    const isLive = platform.status === "live";
                    
                    return (
                      <button
                        key={platform.id}
                        onClick={() => isLive && handlePlatformSelect()}
                        disabled={!isLive}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          isLive
                            ? "border-border hover:border-primary hover:bg-card cursor-pointer"
                            : "border-border bg-muted/50 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-3">
                          <Icon className="h-10 w-10" />
                          <span className="font-medium capitalize">{platform.platform_name}</span>
                          <PlatformBadge status={platform.status as "live" | "coming_soon"} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Connect YouTube */}
          {step === 3 && (
            <Card className="text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <Youtube className="h-16 w-16 text-red-500" />
                </div>
                <CardTitle className="text-2xl">Connect Your YouTube Channel</CardTitle>
                <CardDescription>
                  We'll need access to your channel to provide insights and optimizations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card border rounded-lg p-4 space-y-2 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">View your channel statistics and analytics</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Access video metadata for SEO optimization</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Analyze competitors and keyword performance</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button size="lg" onClick={handleYouTubeConnect}>
                  Connect YouTube
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Step 4: Choose Plan */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
                <p className="text-muted-foreground">
                  Start with a free plan or upgrade for unlimited access
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans
                  .sort((a, b) => a.price - b.price)
                  .map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      onSelect={() => handlePlanSelect(plan.slug)}
                      loading={loading}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}