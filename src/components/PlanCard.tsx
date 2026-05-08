import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { Plan } from "@/types/database";

interface PlanCardProps {
  plan: Plan;
  currentPlan?: string;
  onSelect?: () => void;
  loading?: boolean;
}

export function PlanCard({ plan, currentPlan, onSelect, loading }: PlanCardProps) {
  const isCurrent = currentPlan === plan.slug;
  const isPopular = plan.slug === "pro";

  const features = [
    `${plan.keyword_searches_limit === -1 ? "Unlimited" : plan.keyword_searches_limit} keyword searches/day`,
    plan.seo_optimizations_limit > 0 
      ? `${plan.seo_optimizations_limit === -1 ? "Unlimited" : plan.seo_optimizations_limit} SEO optimizations/day`
      : "No SEO optimizer",
    plan.competitor_analysis_limit > 0
      ? `${plan.competitor_analysis_limit === -1 ? "Unlimited" : plan.competitor_analysis_limit} competitor analyses/day`
      : "No competitor analysis",
    `${plan.team_members_limit} team member${plan.team_members_limit !== 1 ? "s" : ""}`,
    plan.priority_support ? "Priority support" : "Standard support",
  ];

  return (
    <Card className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">
            ${plan.price}
          </span>
          {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isCurrent ? (
          <Button className="w-full" variant="outline" disabled>
            Current Plan
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={onSelect}
            disabled={loading}
            variant={isPopular ? "default" : "outline"}
          >
            {loading ? "Processing..." : plan.price === 0 ? "Downgrade" : "Upgrade"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}