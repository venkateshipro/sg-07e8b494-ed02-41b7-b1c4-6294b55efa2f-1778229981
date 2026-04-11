import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { PlanCard } from "@/components/PlanCard";
import { CreditCard, Download, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { planService } from "@/services/planService";
import { usageService } from "@/services/usageService";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import type { Plan } from "@/types/database";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
  cancelled_at: string | null;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  invoice_date: string;
  invoice_url?: string;
}

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState({ keywordSearches: 0, seoOptimizations: 0, competitorAnalysis: 0 });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) return;

      // Load all plans
      const allPlans = await planService.getAllPlans();
      setPlans(allPlans);

      // Load current plan
      const plan = await planService.getPlanBySlug(user.plan);
      setCurrentPlan(plan);

      // Load subscription
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (subError && subError.code !== "PGRST116") throw subError;
      setSubscription(subData as Subscription | null);

      // Load usage
      const todayUsage = await usageService.getTodayUsage(user.id);
      if (todayUsage) {
        setUsage({
          keywordSearches: todayUsage.keyword_searches,
          seoOptimizations: todayUsage.seo_optimizations,
          competitorAnalysis: todayUsage.competitor_analysis,
        });
      }

      // Mock invoices for now - in production would fetch from Razorpay
      setInvoices([
        { id: "inv_001", amount: 2900, status: "paid", invoice_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), invoice_url: "#" },
        { id: "inv_002", amount: 2900, status: "paid", invoice_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), invoice_url: "#" },
      ]);

      setLoading(false);
    } catch (err) {
      console.error("Error loading billing data:", err);
      setError(err instanceof Error ? err : new Error("Failed to load billing data"));
      toast({
        variant: "destructive",
        title: "Failed to Load Billing",
        description: "Could not load billing information.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpgrade = async (planSlug: string) => {
    if (!user) return;

    setUpgrading(true);

    try {
      const response = await fetch("/api/razorpay/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, planSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Initialize Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "FaGrow",
        description: `Subscribe to ${planSlug} plan`,
        handler: async (response: any) => {
          // Verify payment
          const verifyResponse = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            toast({
              title: "Subscription Activated",
              description: "Your plan has been upgraded successfully!",
            });
            await loadData();
          } else {
            toast({
              variant: "destructive",
              title: "Payment Verification Failed",
              description: "Please contact support.",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setUpgrading(false);
          },
        },
      };

      // @ts-ignore - Razorpay is loaded via script
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Error upgrading plan:", err);
      toast({
        variant: "destructive",
        title: "Upgrade Failed",
        description: err instanceof Error ? err.message : "Could not upgrade plan.",
      });
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription?.razorpay_subscription_id) return;

    setCancelling(true);

    try {
      const response = await fetch("/api/razorpay/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: subscription.razorpay_subscription_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription will remain active until the end of the current billing period.",
      });

      setCancelDialogOpen(false);
      await loadData();
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      toast({
        variant: "destructive",
        title: "Cancellation Failed",
        description: "Could not cancel subscription.",
      });
    } finally {
      setCancelling(false);
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <ProtectedRoute>
      <SEO title="Billing & Plan - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Billing & Plan</h1>
              <p className="text-muted-foreground">
                Manage your subscription and view billing history
              </p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Billing"
                description="We couldn't load your billing information."
                onRetry={loadData}
              />
            )}

            {!error && (
              <>
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Current Plan
                    </CardTitle>
                    <CardDescription>Your active subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold capitalize">{currentPlan?.name || user?.plan}</p>
                            <p className="text-muted-foreground">
                              {currentPlan?.price === 0 ? "Free forever" : `$${currentPlan?.price}/month`}
                            </p>
                          </div>
                          <Badge variant={subscription?.status === "active" ? "default" : "secondary"} className="capitalize">
                            {subscription?.status || "Free"}
                          </Badge>
                        </div>

                        {subscription?.current_period_end && (
                          <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Next billing date</p>
                            <p className="font-medium">
                              {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        {/* Usage Summary */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Usage This Month</h3>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Keyword Searches</span>
                                <span className="text-sm text-muted-foreground">
                                  {usage.keywordSearches} / {currentPlan?.keyword_searches_limit === -1 ? "∞" : currentPlan?.keyword_searches_limit}
                                </span>
                              </div>
                              <Progress 
                                value={getUsagePercentage(usage.keywordSearches, currentPlan?.keyword_searches_limit || 0)} 
                                className="h-2"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">SEO Optimizations</span>
                                <span className="text-sm text-muted-foreground">
                                  {usage.seoOptimizations} / {currentPlan?.seo_optimizations_limit === -1 ? "∞" : currentPlan?.seo_optimizations_limit}
                                </span>
                              </div>
                              <Progress 
                                value={getUsagePercentage(usage.seoOptimizations, currentPlan?.seo_optimizations_limit || 0)} 
                                className="h-2"
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Competitor Analyses</span>
                                <span className="text-sm text-muted-foreground">
                                  {usage.competitorAnalysis} / {currentPlan?.competitor_analysis_limit === -1 ? "∞" : currentPlan?.competitor_analysis_limit}
                                </span>
                              </div>
                              <Progress 
                                value={getUsagePercentage(usage.competitorAnalysis, currentPlan?.competitor_analysis_limit || 0)} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>

                        {subscription && subscription.status === "active" && (
                          <Button
                            variant="outline"
                            onClick={() => setCancelDialogOpen(true)}
                            className="w-full"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Available Plans */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                      const isCurrent = plan.slug === user?.plan;
                      return (
                        <PlanCard
                          key={plan.id}
                          name={plan.name}
                          price={plan.price}
                          features={[
                            plan.keyword_searches_limit === -1 ? "Unlimited keyword searches" : `${plan.keyword_searches_limit} keyword searches/day`,
                            plan.seo_optimizations_limit === -1 ? "Unlimited SEO optimizations" : `${plan.seo_optimizations_limit} SEO optimizations/day`,
                            plan.competitor_analysis_limit === -1 ? "Unlimited competitor analysis" : `${plan.competitor_analysis_limit} competitor analyses/day`,
                            `${plan.platforms_limit === -1 ? "Unlimited" : plan.platforms_limit} platforms`,
                            `${plan.team_members_limit === -1 ? "Unlimited" : plan.team_members_limit} team members`,
                            plan.priority_support ? "Priority support" : "Standard support",
                          ]}
                          cta={isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                          highlighted={plan.slug === "pro"}
                          onCtaClick={() => {
                            if (!isCurrent) {
                              handleUpgrade(plan.slug);
                            }
                          }}
                          disabled={isCurrent || upgrading}
                          loading={upgrading}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Invoice History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                    <CardDescription>View and download your past invoices</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {invoices.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No invoices yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Invoice ID</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoices.map((invoice) => (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                                <TableCell>
                                  {new Date(invoice.invoice_date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </TableCell>
                                <TableCell>${(invoice.amount / 100).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant={invoice.status === "paid" ? "default" : "secondary"} className="capitalize">
                                    {invoice.status === "paid" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                    {invoice.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={invoice.invoice_url} download>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download
                                    </a>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Cancel Confirmation Dialog */}
          <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelSubscription} disabled={cancelling}>
                  {cancelling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Subscription"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DashboardLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}