import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatsCard } from "@/components/StatsCard";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  mrr: number;
  churnRate: string;
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<Array<{ month: string; users: number }>>([]);
  const [revenueByPlan, setRevenueByPlan] = useState<Array<{ plan: string; revenue: number }>>([]);
  const [platformUsage, setPlatformUsage] = useState<Array<{ platform: string; count: number }>>([]);
  const [recentSignups, setRecentSignups] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        router.push("/login");
        return;
      }

      // Check admin status
      const isAdmin = await adminService.isAdmin(user.id);
      if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
        });
        router.push("/dashboard");
        return;
      }

      // Load all admin data
      const [statsData, growthData, revenueData, platformData, signupsData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getUserGrowthData(),
        adminService.getRevenueByPlan(),
        adminService.getPlatformUsage(),
        adminService.getRecentSignups(10),
      ]);

      setStats(statsData);
      setUserGrowth(growthData);
      setRevenueByPlan(revenueData);
      setPlatformUsage(platformData);
      setRecentSignups(signupsData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading admin data:", err);
      setError(err instanceof Error ? err : new Error("Failed to load admin data"));
      toast({
        variant: "destructive",
        title: "Failed to Load Admin Data",
        description: "Could not load admin dashboard. Please try again.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(262 50% 70%)", "hsl(142 50% 65%)"];

  if (loading) {
    return (
      <ProtectedRoute>
        <SEO title="Admin Overview - FaGrow" />
        <AdminLayout>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-24" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded animate-pulse w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SEO title="Admin Overview - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
              <p className="text-muted-foreground">Monitor your platform's performance and user activity</p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Admin Dashboard"
                description="We couldn't load the admin data. Please try again."
                onRetry={loadData}
              />
            )}

            {!error && stats && (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    trend={{ value: "12.5%", isPositive: true }}
                  />
                  <StatsCard
                    title="Active Subscriptions"
                    value={stats.activeSubscriptions.toLocaleString()}
                    icon={CreditCard}
                    trend={{ value: "8.3%", isPositive: true }}
                  />
                  <StatsCard
                    title="Monthly Recurring Revenue"
                    value={`$${stats.mrr.toLocaleString()}`}
                    icon={DollarSign}
                    trend={{ value: "15.2%", isPositive: true }}
                  />
                  <StatsCard
                    title="Churn Rate"
                    value={`${stats.churnRate}%`}
                    icon={TrendingDown}
                    trend={{ value: "2.1%", isPositive: false }}
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth (Last 12 Months)</CardTitle>
                      <CardDescription>New user registrations over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Revenue by Plan Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Plan</CardTitle>
                      <CardDescription>Monthly revenue breakdown by subscription tier</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueByPlan}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="plan" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="hsl(var(--accent))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Platform Usage Pie Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Usage Breakdown</CardTitle>
                    <CardDescription>Connected platforms across all users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={platformUsage}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ platform, count }) => `${platform}: ${count}`}
                          outerRadius={100}
                          fill="hsl(var(--primary))"
                          dataKey="count"
                        >
                          {platformUsage.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recent Signups Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Signups</CardTitle>
                    <CardDescription>Last 10 users who joined the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSignups.map((signup) => (
                          <TableRow key={signup.id}>
                            <TableCell className="font-medium">{signup.name}</TableCell>
                            <TableCell>{signup.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {signup.plan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(signup.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}