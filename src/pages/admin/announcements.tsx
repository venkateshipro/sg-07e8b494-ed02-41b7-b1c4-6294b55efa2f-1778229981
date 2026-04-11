import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Megaphone, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { announcementService } from "@/services/announcementService";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";
import type { Announcement } from "@/types/database";

export default function AdminAnnouncementsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formType, setFormType] = useState<"info" | "warning" | "success">("info");
  const [formActive, setFormActive] = useState(true);

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

      const data = await announcementService.getAllAnnouncements();
      setAnnouncements(data);
      setLoading(false);
    } catch (err) {
      console.error("Error loading announcements:", err);
      setError(err instanceof Error ? err : new Error("Failed to load announcements"));
      toast({
        variant: "destructive",
        title: "Failed to Load Announcements",
        description: "Could not load announcements.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const resetForm = () => {
    setFormTitle("");
    setFormMessage("");
    setFormType("info");
    setFormActive(true);
  };

  const handleCreate = async () => {
    if (!formTitle.trim() || !formMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and message are required.",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("announcements")
        .insert([{
          title: formTitle,
          message: formMessage,
          type: formType,
          active: formActive,
        }]);

      if (error) throw error;

      toast({
        title: "Announcement Created",
        description: "The announcement has been created successfully.",
      });

      setCreateDialogOpen(false);
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error creating announcement:", err);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create announcement.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedAnnouncement || !formTitle.trim() || !formMessage.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title and message are required.",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("announcements")
        .update({
          title: formTitle,
          message: formMessage,
          type: formType,
          active: formActive,
        })
        .eq("id", selectedAnnouncement.id);

      if (error) throw error;

      toast({
        title: "Announcement Updated",
        description: "The announcement has been updated successfully.",
      });

      setEditDialogOpen(false);
      setSelectedAnnouncement(null);
      resetForm();
      await loadData();
    } catch (err) {
      console.error("Error updating announcement:", err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update announcement.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", selectedAnnouncement.id);

      if (error) throw error;

      toast({
        title: "Announcement Deleted",
        description: "The announcement has been deleted successfully.",
      });

      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
      await loadData();
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete announcement.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ active: !announcement.active })
        .eq("id", announcement.id);

      if (error) throw error;

      toast({
        title: announcement.active ? "Announcement Deactivated" : "Announcement Activated",
        description: `The announcement is now ${!announcement.active ? "active" : "inactive"}.`,
      });

      await loadData();
    } catch (err) {
      console.error("Error toggling announcement:", err);
      toast({
        variant: "destructive",
        title: "Toggle Failed",
        description: "Could not toggle announcement status.",
      });
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormTitle(announcement.title);
    setFormMessage(announcement.message);
    setFormType(announcement.type);
    setFormActive(announcement.active);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "success": return "default";
      case "warning": return "destructive";
      case "info": return "secondary";
      default: return "outline";
    }
  };

  return (
    <ProtectedRoute>
      <SEO title="Announcements - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Announcements</h1>
                <p className="text-muted-foreground">
                  Manage announcements shown to users on their dashboard
                </p>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Announcement</DialogTitle>
                    <DialogDescription>
                      Active announcements will be displayed on user dashboards
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-title">Title</Label>
                      <Input
                        id="create-title"
                        placeholder="Announcement title"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-message">Message</Label>
                      <Textarea
                        id="create-message"
                        placeholder="Announcement message"
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-type">Type</Label>
                      <Select value={formType} onValueChange={(value: "info" | "warning" | "success") => setFormType(value)}>
                        <SelectTrigger id="create-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info</SelectItem>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="create-active">Active</Label>
                        <p className="text-sm text-muted-foreground">
                          Show this announcement to users
                        </p>
                      </div>
                      <Switch
                        id="create-active"
                        checked={formActive}
                        onCheckedChange={setFormActive}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Announcement"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Announcements"
                description="We couldn't load the announcements."
                onRetry={loadData}
              />
            )}

            {!error && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    All Announcements
                  </CardTitle>
                  <CardDescription>
                    Manage all announcements. Only active announcements will be shown to users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 6 }).map((_, j) => (
                                <TableCell key={j}>
                                  <div className="h-8 bg-muted rounded animate-pulse" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : announcements.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                              No announcements yet. Create your first announcement to get started.
                            </TableCell>
                          </TableRow>
                        ) : (
                          announcements.map((announcement) => (
                            <TableRow key={announcement.id}>
                              <TableCell className="font-medium">
                                {announcement.title}
                              </TableCell>
                              <TableCell className="max-w-md truncate">
                                {announcement.message}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getTypeBadgeVariant(announcement.type)} className="capitalize">
                                  {announcement.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={announcement.active}
                                    onCheckedChange={() => handleToggleActive(announcement)}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {announcement.active ? "Active" : "Inactive"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(announcement.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditDialog(announcement)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDeleteDialog(announcement)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
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
          </div>

          {/* Edit Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Announcement</DialogTitle>
                <DialogDescription>
                  Update announcement details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    placeholder="Announcement title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-message">Message</Label>
                  <Textarea
                    id="edit-message"
                    placeholder="Announcement message"
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select value={formType} onValueChange={(value: "info" | "warning" | "success") => setFormType(value)}>
                    <SelectTrigger id="edit-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="edit-active">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Show this announcement to users
                    </p>
                  </div>
                  <Switch
                    id="edit-active"
                    checked={formActive}
                    onCheckedChange={setFormActive}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this announcement? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}