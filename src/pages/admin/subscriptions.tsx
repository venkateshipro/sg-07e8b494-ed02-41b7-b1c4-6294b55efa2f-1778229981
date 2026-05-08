import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, XCircle, CreditCard } from "lucide-react";
import { SEO } from "@/components/SEO";
import { format } from "date-fns";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  razorpay_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
}

interface SubscriptionDetail extends Subscription {
  plan_details?: {
    name: string;
    price: number;
    limits: {
      keyword_searches: number;
      seo_optimizations: number;
      competitor_analysis: number;
      platforms: number;
      team_members: number;
    };
  };
}

export default function AdminSubscriptions() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Array<{ slug: string; name: string; price: number }>>([]);
  
  // Filters
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Subscription detail panel
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Stats
  const [totalActive, setTotalActive] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [cancelledThisMonth, setCancelledThisMonth] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [planFilter, statusFilter, subscriptions, plans]);

  async function fetchData() {
    try {
      // Fetch all subscriptions with user info
      const { data: subsData, error: subsError } = await supabase
        .from("subscriptions")
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order("created_at", { ascending: false });

      if (subsError) throw subsError;

      // Fetch all plans for pricing
      const { data: plansData, error: plansError } = await supabase
        .from("plans")
        .select("slug, name, price");

      if (plansError) throw plansError;

      setSubscriptions(subsData || []);
      setFilteredSubscriptions(subsData || []);
      setPlans(plansData || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    }
  }

  function applyFilters() {
    let filtered = [...subscriptions];

    // Plan filter
    if (planFilter !== "all") {
      filtered = filtered.filter((sub) => sub.plan === planFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubscriptions(filtered);
  }

  function calculateStats() {
    // Total active subscriptions
    const active = subscriptions.filter((s) => s.status === "active").length;
    setTotalActive(active);

    // MRR calculation
    const planPrices = Object.fromEntries(plans.map((p) => [p.slug, Number(p.price)]));
    const revenue = subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, sub) => sum + (planPrices[sub.plan] || 0), 0);
    setMrr(revenue);

    // Cancelled this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const cancelled = subscriptions.filter(
      (s) => s.cancelled_at && new Date(s.cancelled_at) >= startOfMonth
    ).length;
    setCancelledThisMonth(cancelled);
  }

  async function openSubscriptionDetail(subscription: Subscription) {
    setSelectedSubscription(subscription as SubscriptionDetail);
    setSheetOpen(true);
    setDetailLoading(true);

    try {
      // Fetch plan details
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("name, price, limits")
        .eq("slug", subscription.plan)
        .single();

      if (planError) throw planError;

      setSelectedSubscription({
        ...subscription,
        plan_details: planData as any,
      });
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription details",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  function getStatusBadgeVariant(status: string) {
    if (status === "active") return "default";
    if (status === "cancelled") return "secondary";
    if (status === "past_due") return "destructive";
    return "outline";
  }

  function getPlanBadgeVariant(plan: string) {
    if (plan === "enterprise") return "default";
    if (plan === "pro") return "secondary";
    return "outline";
  }

  function getPlanName(slug: string): string {
    const plan = plans.find((p) => p.slug === slug);
    return plan?.name || slug;
  }

  function getPlanPrice(slug: string): number {
    const plan = plans.find((p) => p.slug === slug);
    return plan?.price || 0;
  }

  return (
    <ProtectedRoute requireAdmin>
      <ErrorBoundary>
        <SEO 
          title="Subscription Management - Admin - FaGrow"
          description="Manage all subscriptions, view billing details, and track revenue"
          url="/admin/subscriptions"
        />
        
        <AdminLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">Subscription Management</h1>
              <p className="text-muted-foreground mt-2">
                View and manage all user subscriptions and billing
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Active Subscriptions</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalActive}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${mrr.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cancelled This Month</CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cancelledThisMonth}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-filter">Filter by plan</Label>
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger id="plan-filter">
                        <SelectValue placeholder="All plans" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All plans</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Filter by status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriptions Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Subscriptions ({filteredSubscriptions.length})</CardTitle>
                <CardDescription>
                  Click on any subscription to view detailed information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredSubscriptions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No subscriptions found matching your filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Next Renewal</TableHead>
                          <TableHead>Razorpay ID</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubscriptions.map((subscription) => (
                          <TableRow
                            key={subscription.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openSubscriptionDetail(subscription)}
                          >
                            <TableCell className="font-medium">
                              {subscription.users?.name || "Unknown"}
                            </TableCell>
                            <TableCell>{subscription.users?.email || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={getPlanBadgeVariant(subscription.plan)} className="capitalize">
                                {getPlanName(subscription.plan)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(subscription.status)} className="capitalize">
                                {subscription.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              ${getPlanPrice(subscription.plan)}/mo
                            </TableCell>
                            <TableCell>
                              {subscription.current_period_end
                                ? format(new Date(subscription.current_period_end), "MMM d, yyyy")
                                : "N/A"}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {subscription.razorpay_subscription_id || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscription Detail Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              {selectedSubscription && (
                <>
                  <SheetHeader>
                    <SheetTitle>Subscription Details</SheetTitle>
                    <SheetDescription>
                      Detailed information for {selectedSubscription.users?.name}'s subscription
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    {/* User Information */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">User Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{selectedSubscription.users?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selectedSubscription.users?.email}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Subscription Details */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Subscription Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan:</span>
                          <Badge variant={getPlanBadgeVariant(selectedSubscription.plan)} className="capitalize">
                            {getPlanName(selectedSubscription.plan)}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={getStatusBadgeVariant(selectedSubscription.status)} className="capitalize">
                            {selectedSubscription.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">
                            ${getPlanPrice(selectedSubscription.plan)}/month
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created:</span>
                          <span>
                            {format(new Date(selectedSubscription.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        {selectedSubscription.current_period_start && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Period Start:</span>
                            <span>
                              {format(new Date(selectedSubscription.current_period_start), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        {selectedSubscription.current_period_end && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Next Renewal:</span>
                            <span>
                              {format(new Date(selectedSubscription.current_period_end), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                        {selectedSubscription.cancelled_at && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Cancelled On:</span>
                            <span className="text-destructive">
                              {format(new Date(selectedSubscription.cancelled_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Razorpay Information */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Payment Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground">Razorpay Subscription ID:</span>
                          <span className="font-mono text-xs text-right break-all max-w-[200px]">
                            {selectedSubscription.razorpay_subscription_id || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Plan Features */}
                    {detailLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : selectedSubscription.plan_details ? (
                      <div>
                        <h3 className="text-sm font-medium mb-3">Plan Features</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Keyword Searches/day:</span>
                            <span className="font-medium">
                              {selectedSubscription.plan_details.limits.keyword_searches === -1
                                ? "Unlimited"
                                : selectedSubscription.plan_details.limits.keyword_searches}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SEO Optimizations/month:</span>
                            <span className="font-medium">
                              {selectedSubscription.plan_details.limits.seo_optimizations === -1
                                ? "Unlimited"
                                : selectedSubscription.plan_details.limits.seo_optimizations}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Competitor Analyses/month:</span>
                            <span className="font-medium">
                              {selectedSubscription.plan_details.limits.competitor_analysis === -1
                                ? "Unlimited"
                                : selectedSubscription.plan_details.limits.competitor_analysis}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Platforms:</span>
                            <span className="font-medium">
                              {selectedSubscription.plan_details.limits.platforms}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Team Members:</span>
                            <span className="font-medium">
                              {selectedSubscription.plan_details.limits.team_members}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}