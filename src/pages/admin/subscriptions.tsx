import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, CreditCard, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  created_at: string;
  current_period_start: string | null;
  current_period_end: string | null;
  users: {
    name: string;
    email: string;
  };
  plans: {
    name: string;
    price: number;
  };
}

export default function AdminSubscriptionsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filters
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

      const filters: any = {};
      if (statusFilter !== "all") filters.status = statusFilter;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const subsData = await adminService.getSubscriptions(filters);
      setSubscriptions(subsData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading subscriptions:", err);
      setError(err instanceof Error ? err : new Error("Failed to load subscriptions"));
      toast({
        variant: "destructive",
        title: "Failed to Load Subscriptions",
        description: "Could not load subscription data. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleFilter = () => {
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "cancelled":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <ProtectedRoute>
      <SEO title="Subscription Management - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
              <p className="text-muted-foreground">Monitor and manage all user subscriptions</p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Subscriptions"
                description="We couldn't load the subscription data. Please try again."
                onRetry={loadData}
              />
            )}

            {!error && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    All Subscriptions
                  </CardTitle>
                  <CardDescription>Filter subscriptions by plan, status, or date range</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder="Filter by plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="starter">Starter</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      placeholder="From date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full lg:w-48"
                    />
                    <Input
                      type="date"
                      placeholder="To date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full lg:w-48"
                    />
                    <Button onClick={handleFilter} className="w-full lg:w-auto">
                      <Filter className="h-4 w-4 mr-2" />
                      Apply Filters
                    </Button>
                  </div>

                  {/* Subscriptions Table */}
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                          <Skeleton className="h-12 flex-1" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Current Period</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No subscriptions found matching your filters
                              </TableCell>
                            </TableRow>
                          ) : (
                            subscriptions.map((sub) => (
                              <TableRow key={sub.id}>
                                <TableCell className="font-medium">
                                  {sub.users?.name || "Unknown User"}
                                </TableCell>
                                <TableCell>{sub.users?.email || "N/A"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {sub.plans?.name || "Unknown Plan"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(sub.status)}
                                    <Badge variant={getStatusVariant(sub.status)} className="capitalize">
                                      {sub.status}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  ${sub.plans?.price || 0}/mo
                                </TableCell>
                                <TableCell>
                                  {new Date(sub.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {sub.current_period_start && sub.current_period_end ? (
                                    <div className="text-xs">
                                      <div>{new Date(sub.current_period_start).toLocaleDateString()}</div>
                                      <div className="text-muted-foreground">
                                        to {new Date(sub.current_period_end).toLocaleDateString()}
                                      </div>
                                    </div>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Summary Stats */}
                  {!loading && subscriptions.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total Subscriptions</div>
                        <div className="text-2xl font-bold">{subscriptions.length}</div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Active Subscriptions</div>
                        <div className="text-2xl font-bold text-green-600">
                          {subscriptions.filter((s) => s.status === "active").length}
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total Monthly Revenue</div>
                        <div className="text-2xl font-bold">
                          ${subscriptions
                            .filter((s) => s.status === "active")
                            .reduce((sum, s) => sum + (s.plans?.price || 0), 0)
                            .toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}