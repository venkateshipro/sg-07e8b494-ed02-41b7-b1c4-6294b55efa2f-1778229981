import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Users as UsersIcon, Trash2, Ban, CheckCircle2, Youtube, Calendar } from "lucide-react";
import { SEO } from "@/components/SEO";
import { format } from "date-fns";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  created_at: string;
  last_login: string | null;
  status: string;
  avatar_url?: string;
}

interface UserDetail extends User {
  usage?: Array<{
    date: string;
    keyword_searches: number;
    seo_optimizations: number;
    competitor_analyses: number;
  }>;
  platforms?: Array<{
    platform: string;
    channel_name?: string;
    connected_at: string;
  }>;
  subscription?: {
    status: string;
    current_period_end: string | null;
  };
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // User detail panel
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Actions
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, planFilter, statusFilter, users]);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, plan, created_at, last_login, status, avatar_url")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
      setFilteredUsers(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    }
  }

  function applyFilters() {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Plan filter
    if (planFilter !== "all") {
      filtered = filtered.filter((user) => user.plan === planFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }

  async function openUserDetail(user: User) {
    setSelectedUser(user as UserDetail);
    setSheetOpen(true);
    setDetailLoading(true);

    try {
      // Fetch usage stats
      const { data: usage } = await supabase
        .from("usage_tracking")
        .select("date, keyword_searches, seo_optimizations, competitor_analyses")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);

      // Fetch connected platforms
      const { data: platforms } = await supabase
        .from("connected_platforms")
        .select("platform, channel_name, connected_at")
        .eq("user_id", user.id);

      // Fetch subscription
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      setSelectedUser({
        ...user,
        usage: usage || [],
        platforms: platforms || [],
        subscription: subscription || undefined,
      });
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive",
      });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleChangePlan(userId: string, newPlan: string) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ plan: newPlan })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Plan updated",
        description: "User plan has been changed successfully.",
      });

      fetchUsers();
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, plan: newPlan });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update plan",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleStatus(userId: string, currentStatus: string) {
    setActionLoading(true);
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ status: newStatus })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: newStatus === "active" ? "User reactivated" : "User suspended",
        description: `User has been ${newStatus === "active" ? "reactivated" : "suspended"} successfully.`,
      });

      fetchUsers();
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userToDelete.id);

      if (error) throw error;

      toast({
        title: "User deleted",
        description: "User account has been permanently deleted.",
      });

      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setSheetOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusBadgeVariant(status: string) {
    if (status === "active") return "default";
    if (status === "suspended") return "destructive";
    return "secondary";
  }

  function getPlanBadgeVariant(plan: string) {
    if (plan === "enterprise") return "default";
    if (plan === "pro") return "secondary";
    return "outline";
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const suspendedUsers = users.filter((u) => u.status === "suspended").length;

  return (
    <ProtectedRoute requireAdmin>
      <ErrorBoundary>
        <SEO 
          title="User Management - Admin - FaGrow"
          description="Manage all users, view usage stats, and control access"
          url="/admin/users"
        />
        
        <AdminLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage all users, view usage stats, and control access
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeUsers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                  <Ban className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{suspendedUsers}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search by name or email</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

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
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                <CardDescription>
                  Click on any user to view details and manage their account
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UsersIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No users found matching your filters</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow
                            key={user.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => openUserDetail(user)}
                          >
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={getPlanBadgeVariant(user.plan)} className="capitalize">
                                {user.plan}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(user.created_at), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              {user.last_login
                                ? format(new Date(user.last_login), "MMM d, yyyy")
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                                {user.status}
                              </Badge>
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

          {/* User Detail Sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              {selectedUser && (
                <>
                  <SheetHeader>
                    <SheetTitle>User Details</SheetTitle>
                    <SheetDescription>
                      Manage {selectedUser.name}'s account and view their usage statistics
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    {/* User Info */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Account Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{selectedUser.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span className="font-medium">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Current Plan:</span>
                          <Badge variant={getPlanBadgeVariant(selectedUser.plan)} className="capitalize">
                            {selectedUser.plan}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={getStatusBadgeVariant(selectedUser.status)} className="capitalize">
                            {selectedUser.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Joined:</span>
                          <span>{format(new Date(selectedUser.created_at), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Connected Platforms */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Connected Platforms</h3>
                      {detailLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : selectedUser.platforms && selectedUser.platforms.length > 0 ? (
                        <div className="space-y-2">
                          {selectedUser.platforms.map((platform, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                              <Youtube className="h-5 w-5 text-primary" />
                              <div className="flex-1">
                                <p className="text-sm font-medium capitalize">{platform.platform}</p>
                                {platform.channel_name && (
                                  <p className="text-xs text-muted-foreground">{platform.channel_name}</p>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(platform.connected_at), "MMM d")}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No platforms connected</p>
                      )}
                    </div>

                    <Separator />

                    {/* Usage Stats (Last 30 Days) */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Usage (Last 30 Days)</h3>
                      {detailLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                      ) : selectedUser.usage && selectedUser.usage.length > 0 ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Keyword Searches</p>
                              <p className="text-2xl font-bold">
                                {selectedUser.usage.reduce((sum, u) => sum + (u.keyword_searches || 0), 0)}
                              </p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">SEO Optimizations</p>
                              <p className="text-2xl font-bold">
                                {selectedUser.usage.reduce((sum, u) => sum + (u.seo_optimizations || 0), 0)}
                              </p>
                            </div>
                            <div className="p-3 border rounded-lg">
                              <p className="text-xs text-muted-foreground mb-1">Competitor Analyses</p>
                              <p className="text-2xl font-bold">
                                {selectedUser.usage.reduce((sum, u) => sum + (u.competitor_analyses || 0), 0)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No usage data available</p>
                      )}
                    </div>

                    <Separator />

                    {/* Change Plan */}
                    <div>
                      <h3 className="text-sm font-medium mb-3">Change Plan</h3>
                      <Select
                        value={selectedUser.plan}
                        onValueChange={(value) => handleChangePlan(selectedUser.id, value)}
                        disabled={actionLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium">Account Actions</h3>
                      
                      <Button
                        variant={selectedUser.status === "active" ? "outline" : "default"}
                        className="w-full"
                        onClick={() => handleToggleStatus(selectedUser.id, selectedUser.status)}
                        disabled={actionLoading}
                      >
                        {selectedUser.status === "active" ? (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Reactivate User
                          </>
                        )}
                      </Button>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => {
                          setUserToDelete(selectedUser);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={actionLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </SheetContent>
          </Sheet>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete{" "}
                  <strong>{userToDelete?.name}'s</strong> account and remove all their data
                  from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {actionLoading ? "Deleting..." : "Delete Account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}