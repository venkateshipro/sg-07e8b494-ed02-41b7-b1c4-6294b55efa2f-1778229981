import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { format } from "date-fns";
import { Megaphone, Trash2, Info, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  active: boolean;
  created_at: string;
}

export default function AdminAnnouncements() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success">("info");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements((data as Announcement[]) || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("announcements")
        .insert([
          {
            title,
            message,
            type,
            active: isActive,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Announcement created",
        description: "The announcement has been published successfully.",
      });

      // Reset form
      setTitle("");
      setMessage("");
      setType("info");
      setIsActive(true);

      // Refresh list
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("announcements")
        .update({ active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Announcement is now ${!currentStatus ? "active" : "inactive"}.`,
      });

      setAnnouncements(announcements.map(a => 
        a.id === id ? { ...a, active: !currentStatus } : a
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!announcementToDelete) return;

    try {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementToDelete.id);

      if (error) throw error;

      toast({
        title: "Announcement deleted",
        description: "The announcement has been permanently removed.",
      });

      setAnnouncements(announcements.filter(a => a.id !== announcementToDelete.id));
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete announcement",
        variant: "destructive",
      });
    }
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "info": return <Info className="w-4 h-4 text-blue-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4" />;
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <ErrorBoundary>
        <SEO 
          title="Announcements - Admin - FaGrow"
          description="Manage global announcements for users"
          url="/admin/announcements"
        />
        
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Announcements</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage global alerts that appear on user dashboards
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Create Form */}
              <Card className="xl:col-span-1 h-fit">
                <CardHeader>
                  <CardTitle>Create Announcement</CardTitle>
                  <CardDescription>
                    Publish a new banner to all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Scheduled Maintenance"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Detail the announcement here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select value={type} onValueChange={(val: any) => setType(val)}>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">Info (Blue)</SelectItem>
                          <SelectItem value="warning">Warning (Yellow)</SelectItem>
                          <SelectItem value="success">Success (Green)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="active-toggle">Active Status</Label>
                        <p className="text-xs text-muted-foreground">
                          Show this to users immediately
                        </p>
                      </div>
                      <Switch
                        id="active-toggle"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                    </div>

                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                      {isSubmitting ? "Publishing..." : "Publish Announcement"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Announcements List */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>All Announcements</CardTitle>
                  <CardDescription>
                    Manage active and past announcements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : announcements.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <Megaphone className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <p className="text-muted-foreground">No announcements created yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead className="w-[40%]">Details</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {announcements.map((announcement) => (
                            <TableRow key={announcement.id}>
                              <TableCell>
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                                  {getTypeIcon(announcement.type)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="font-medium line-clamp-1">{announcement.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">{announcement.message}</p>
                              </TableCell>
                              <TableCell className="text-sm">
                                {format(new Date(announcement.created_at), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                <Switch 
                                  checked={announcement.active}
                                  onCheckedChange={() => handleToggleStatus(announcement.id, announcement.active)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => {
                                    setAnnouncementToDelete(announcement);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
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
            </div>
          </div>

          {/* Delete Confirmation */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{announcementToDelete?.title}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}