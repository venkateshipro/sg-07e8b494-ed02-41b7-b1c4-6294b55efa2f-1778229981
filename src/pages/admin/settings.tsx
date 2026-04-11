import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Webhook, User, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

interface WebhookLog {
  id: string;
  event_type: string;
  payload: any;
  status: string;
  created_at: string;
}

export default function AdminSettingsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Webhook logs state
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

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

      // Load current admin user profile
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      if (userError) throw userError;

      if (userData) {
        setName(userData.name || "");
        setEmail(userData.email || "");
        setAvatarUrl(userData.avatar_url || "");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError(err instanceof Error ? err : new Error("Failed to load settings"));
      toast({
        variant: "destructive",
        title: "Failed to Load Settings",
        description: "Could not load admin settings.",
      });
      setLoading(false);
    }
  };

  const loadWebhookLogs = async () => {
    try {
      setLogsLoading(true);
      
      // Mock webhook logs for now - in production this would query a webhook_logs table
      const mockLogs: WebhookLog[] = [
        {
          id: "1",
          event_type: "subscription.created",
          payload: { user_id: "user_123", plan: "pro" },
          status: "success",
          created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: "2",
          event_type: "subscription.updated",
          payload: { user_id: "user_456", plan: "enterprise" },
          status: "success",
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: "3",
          event_type: "payment.failed",
          payload: { user_id: "user_789", amount: 29 },
          status: "failed",
          created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
      ];

      setWebhookLogs(mockLogs);
      setLogsLoading(false);
    } catch (err) {
      console.error("Error loading webhook logs:", err);
      toast({
        variant: "destructive",
        title: "Failed to Load Logs",
        description: "Could not load webhook logs.",
      });
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: name,
          avatar_url: avatarUrl,
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your admin profile has been updated successfully.",
      });
    } catch (err) {
      console.error("Error saving profile:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="default">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ProtectedRoute>
      <SEO title="Settings - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Admin Settings</h1>
              <p className="text-muted-foreground">
                Manage your admin profile and view system logs
              </p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Settings"
                description="We couldn't load the admin settings."
                onRetry={loadData}
              />
            )}

            {!error && (
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="webhooks" className="flex items-center gap-2">
                    <Webhook className="h-4 w-4" />
                    Webhook Logs
                  </TabsTrigger>
                  <TabsTrigger value="admins" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Manage Admins
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Admin Profile
                      </CardTitle>
                      <CardDescription>
                        Update your admin account information
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={avatarUrl} />
                              <AvatarFallback className="text-2xl">
                                {name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Profile Picture URL
                              </p>
                              <Input
                                type="url"
                                placeholder="https://..."
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                className="w-80"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your name"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              disabled
                              className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                              Email cannot be changed from this panel
                            </p>
                          </div>

                          <div className="flex items-center gap-3 pt-4">
                            <Button onClick={handleSaveProfile} disabled={saving}>
                              {saving ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                            <Button variant="outline" onClick={loadData}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="webhooks">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        Webhook Logs
                      </CardTitle>
                      <CardDescription>
                        View recent webhook events from Razorpay and other integrations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadWebhookLogs}
                            disabled={logsLoading}
                          >
                            {logsLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              "Refresh Logs"
                            )}
                          </Button>
                        </div>

                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Payload</TableHead>
                                <TableHead>Timestamp</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {webhookLogs.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                    {logsLoading ? (
                                      <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Loading webhook logs...
                                      </div>
                                    ) : (
                                      "No webhook logs yet. Click 'Refresh Logs' to load recent events."
                                    )}
                                  </TableCell>
                                </TableRow>
                              ) : (
                                webhookLogs.map((log) => (
                                  <TableRow key={log.id}>
                                    <TableCell className="font-mono text-sm">
                                      {log.event_type}
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(log.status)}
                                    </TableCell>
                                    <TableCell>
                                      <code className="text-xs bg-muted px-2 py-1 rounded">
                                        {JSON.stringify(log.payload).substring(0, 50)}...
                                      </code>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                      {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="admins">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Manage Admin Users
                      </CardTitle>
                      <CardDescription>
                        Add or remove admin access for users
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">
                          Admin management coming soon. Currently, admins can only be set via SQL:
                        </p>
                        <code className="text-xs bg-muted px-3 py-1.5 rounded mt-3 inline-block">
                          UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
                        </code>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}