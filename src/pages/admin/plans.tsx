import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DollarSign, Edit, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  slug: string;
  name: string;
  price: number;
  keyword_searches_limit: number;
  seo_optimizations_limit: number;
  competitor_analysis_limit: number;
  platforms_limit: number;
  team_members_limit: number;
  priority_support: boolean;
}

interface EditingPlan extends Plan {
  editing: boolean;
}

export default function AdminPlansPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [plans, setPlans] = useState<EditingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const isAdmin = await adminService.isAdmin(currentUser.id);
      if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page.",
        });
        router.push("/dashboard");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      if (fetchError) throw fetchError;

      setPlans((data as unknown as Plan[]).map(p => ({ ...p, editing: false })) || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading plans:", err);
      setError(err instanceof Error ? err : new Error("Failed to load plans"));
      toast({
        variant: "destructive",
        title: "Failed to Load Plans",
        description: "Could not load pricing plans.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleEdit = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, editing: true } : { ...p, editing: false }
    ));
  };

  const handleCancel = (planId: string) => {
    // Reload original data
    loadData();
  };

  const handleFieldChange = (planId: string, field: keyof Plan, value: any) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, [field]: value } : p
    ));
  };

  const handleSave = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    setSaving(planId);

    try {
      const { error } = await supabase
        .from("plans")
        .update({
          name: plan.name,
          price: plan.price,
          keyword_searches_limit: plan.keyword_searches_limit,
          seo_optimizations_limit: plan.seo_optimizations_limit,
          competitor_analysis_limit: plan.competitor_analysis_limit,
          platforms_limit: plan.platforms_limit,
          team_members_limit: plan.team_members_limit,
          priority_support: plan.priority_support,
        })
        .eq("id", planId);

      if (error) throw error;

      setPlans(plans.map(p => 
        p.id === planId ? { ...p, editing: false } : p
      ));

      toast({
        title: "Plan Updated",
        description: `${plan.name} plan has been updated successfully.`,
      });
    } catch (err) {
      console.error("Error saving plan:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save plan changes.",
      });
    } finally {
      setSaving(null);
    }
  };

  return (
    <ProtectedRoute>
      <SEO title="Plans & Pricing - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Plans & Pricing Management</h1>
              <p className="text-muted-foreground">
                Edit plan features and pricing. Changes apply instantly across all users.
              </p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Plans"
                description="We couldn't load the pricing plans."
                onRetry={loadData}
              />
            )}

            {!error && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Plan Configuration
                  </CardTitle>
                  <CardDescription>
                    Click edit to modify plan details and limits. All changes take effect immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-center">Keywords/Day</TableHead>
                          <TableHead className="text-center">SEO Opts/Day</TableHead>
                          <TableHead className="text-center">Competitor/Day</TableHead>
                          <TableHead className="text-center">Platforms</TableHead>
                          <TableHead className="text-center">Team</TableHead>
                          <TableHead className="text-center">Priority Support</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 4 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 9 }).map((_, j) => (
                                <TableCell key={j}>
                                  <div className="h-8 bg-muted rounded animate-pulse" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          plans.map((plan) => (
                            <TableRow key={plan.id}>
                              <TableCell className="font-medium">
                                {plan.editing ? (
                                  <Input
                                    value={plan.name}
                                    onChange={(e) => handleFieldChange(plan.id, "name", e.target.value)}
                                    className="w-32"
                                  />
                                ) : (
                                  <Badge variant="outline" className="capitalize">
                                    {plan.name}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {plan.editing ? (
                                  <Input
                                    type="number"
                                    value={plan.price}
                                    onChange={(e) => handleFieldChange(plan.id, "price", Number(e.target.value))}
                                    className="w-24"
                                  />
                                ) : (
                                  <span className="font-semibold">
                                    ${plan.price}
                                    {plan.price > 0 && <span className="text-xs text-muted-foreground">/mo</span>}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {plan.editing ? (
                                  <Input
                                    type="number"
                                    value={plan.keyword_searches_limit}
                                    onChange={(e) => handleFieldChange(plan.id, "keyword_searches_limit", Number(e.target.value))}
                                    className="w-20"
                                  />
                                ) : (
                                  <span>{plan.keyword_searches_limit === -1 ? "∞" : plan.keyword_searches_limit}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {plan.editing ? (
                                  <Input
                                    type="number"
                                    value={plan.seo_optimizations_limit}
                                    onChange={(e) => handleFieldChange(plan.id, "seo_optimizations_limit", Number(e.target.value))}
                                    className="w-20"
                                  />
                                ) : (
                                  <span>{plan.seo_optimizations_limit === -1 ? "∞" : plan.seo_optimizations_limit}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {plan.editing ? (
                                  <Input
                                    type="number"
                                    value={plan.competitor_analysis_limit}
                                    onChange={(e) => handleFieldChange(plan.id, "competitor_analysis_limit", Number(e.target.value))}
                                    className="w-20"
                                  />
                                ) : (
                                  <span>{plan.competitor_analysis_limit === -1 ? "∞" : plan.competitor_analysis_limit}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {plan.editing ? (
                                  <Input
                                    type="number"
                                    value={plan.platforms_limit}
                                    onChange={(e) => handleFieldChange(plan.id, "platforms_limit", Number(e.target.value))}
                                    className="w-20"
                                  />
                                ) : (
                                  <span>{plan.platforms_limit === -1 ? "∞" : plan.platforms_limit}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {plan.editing ? (
                                  <Input
                                    type="number"
                                    value={plan.team_members_limit}
                                    onChange={(e) => handleFieldChange(plan.id, "team_members_limit", Number(e.target.value))}
                                    className="w-20"
                                  />
                                ) : (
                                  <span>{plan.team_members_limit === -1 ? "∞" : plan.team_members_limit}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {plan.editing ? (
                                  <input
                                    type="checkbox"
                                    checked={plan.priority_support}
                                    onChange={(e) => handleFieldChange(plan.id, "priority_support", e.target.checked)}
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  plan.priority_support ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-muted-foreground" />
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {plan.editing ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => handleSave(plan.id)}
                                      disabled={saving === plan.id}
                                    >
                                      {saving === plan.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleCancel(plan.id)}
                                      disabled={saving === plan.id}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(plan.id)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Limit Values Reference</CardTitle>
                <CardDescription>
                  Use these values when editing plan limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Numeric Limits:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <code className="px-1 py-0.5 bg-muted rounded">0</code> = Feature disabled</li>
                      <li>• <code className="px-1 py-0.5 bg-muted rounded">-1</code> = Unlimited</li>
                      <li>• Any positive number = Daily limit</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Boolean Values:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• <code className="px-1 py-0.5 bg-muted rounded">true</code> = Feature enabled</li>
                      <li>• <code className="px-1 py-0.5 bg-muted rounded">false</code> = Feature disabled</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}