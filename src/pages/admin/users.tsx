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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, Filter, Eye, Trash2, UserCog } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  created_at: string;
  last_login: string | null;
}

interface UserDetails {
  user: any;
  subscription: any;
  platforms: any[];
  usage: any[];
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  
  // User details panel
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  
  // Delete confirmation
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      if (searchQuery) filters.search = searchQuery;
      if (planFilter !== "all") filters.plan = planFilter;
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;

      const usersData = await adminService.getUsers(filters);
      setUsers(usersData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err instanceof Error ? err : new Error("Failed to load users"));
      toast({
        variant: "destructive",
        title: "Failed to Load Users",
        description: "Could not load user data. Please try again.",
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

  const handleViewDetails = async (userId: string) => {
    setSelectedUserId(userId);
    setPanelOpen(true);
    setDetailsLoading(true);

    try {
      const details = await adminService.getUserDetails(userId);
      setUserDetails(details);
      setDetailsLoading(false);
    } catch (err) {
      console.error("Error loading user details:", err);
      toast({
        variant: "destructive",
        title: "Failed to Load User Details",
        description: "Could not load user information.",
      });
      setDetailsLoading(false);
    }
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      await adminService.updateUserPlan(userId, newPlan);
      toast({
        title: "Plan Updated",
        description: "User plan has been successfully updated.",
      });
      loadData();
      if (selectedUserId === userId) {
        const details = await adminService.getUserDetails(userId);
        setUserDetails(details);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Update Plan",
        description: "Could not update user plan. Please try again.",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setDeleting(true);
    try {
      await adminService.deleteUser(deleteUserId);
      toast({
        title: "User Deleted",
        description: "User has been permanently deleted.",
      });
      setDeleteDialogOpen(false);
      setDeleteUserId(null);
      setPanelOpen(false);
      loadData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to Delete User",
        description: "Could not delete user. Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <SEO title="User Management - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">User Management</h1>
              <p className="text-muted-foreground">Manage all users and their subscriptions</p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Users"
                description="We couldn't load the user data. Please try again."
                onRetry={loadData}
              />
            )}

            {!error && (
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Search and filter users by name, email, plan, or date</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filters */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleFilter()}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Select value={planFilter} onValueChange={setPlanFilter}>
                      <SelectTrigger className="w-full lg:w-48">
                        <SelectValue placeholder="Filter by plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Plans</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
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

                  {/* Users Table */}
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Last Login</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                No users found matching your filters
                              </TableCell>
                            </TableRow>
                          ) : (
                            users.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {user.plan}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {user.last_login
                                    ? new Date(user.last_login).toLocaleDateString()
                                    : "Never"}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDetails(user.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* User Details Panel */}
          <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
            <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
              <SheetHeader>
                <SheetTitle>User Details</SheetTitle>
                <SheetDescription>View and manage user information</SheetDescription>
              </SheetHeader>

              {detailsLoading ? (
                <div className="space-y-4 mt-6">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : userDetails ? (
                <div className="space-y-6 mt-6">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{userDetails.user.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{userDetails.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">User ID:</span>
                        <span className="font-mono text-xs">{userDetails.user.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Joined:</span>
                        <span>{new Date(userDetails.user.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Login:</span>
                        <span>
                          {userDetails.user.last_login
                            ? new Date(userDetails.user.last_login).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Management */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Plan Management</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Plan:</span>
                        <Badge variant="outline" className="capitalize">
                          {userDetails.user.plan}
                        </Badge>
                      </div>
                      <Select
                        value={userDetails.user.plan}
                        onValueChange={(value) => handleChangePlan(userDetails.user.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Change plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="starter">Starter</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Connected Platforms */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Connected Platforms</h3>
                    {userDetails.platforms.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No platforms connected</p>
                    ) : (
                      <div className="space-y-2">
                        {userDetails.platforms.map((platform: any) => (
                          <div
                            key={platform.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <span className="capitalize font-medium">{platform.platform}</span>
                            <Badge variant="secondary">Connected</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Usage */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recent Usage (Last 30 Days)</h3>
                    {userDetails.usage.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No usage data available</p>
                    ) : (
                      <div className="space-y-2">
                        {userDetails.usage.slice(0, 5).map((usage: any) => (
                          <div
                            key={usage.date}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-muted-foreground">
                              {new Date(usage.date).toLocaleDateString()}
                            </span>
                            <div className="flex gap-3 text-xs">
                              <span>KW: {usage.keyword_searches}</span>
                              <span>SEO: {usage.seo_optimizations}</span>
                              <span>CA: {usage.competitor_analysis}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Danger Zone */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-3 text-destructive">Danger Zone</h3>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setDeleteUserId(userDetails.user.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete User
                    </Button>
                  </div>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account
                  and all associated data including subscriptions, usage history, and connected platforms.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Delete User"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}