import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Youtube, Instagram, MessageSquare, Twitter, Linkedin, Facebook, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

interface Platform {
  id: string;
  platform_name: string;
  status: "live" | "coming_soon";
  icon?: string;
  launch_date?: string;
}

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  tiktok: MessageSquare,
  x: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
};

export default function AdminPlatformsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

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
        .from("platforms_config")
        .select("*")
        .order("platform_name", { ascending: true });

      if (fetchError) throw fetchError;

      setPlatforms(data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading platforms:", err);
      setError(err instanceof Error ? err : new Error("Failed to load platforms"));
      toast({
        variant: "destructive",
        title: "Failed to Load Platforms",
        description: "Could not load platform configuration.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleToggleStatus = async (platformId: string, currentStatus: "live" | "coming_soon") => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    setUpdating(platformId);

    try {
      const newStatus: "live" | "coming_soon" = currentStatus === "live" ? "coming_soon" : "live";

      const { error } = await supabase
        .from("platforms_config")
        .update({ status: newStatus })
        .eq("id", platformId);

      if (error) throw error;

      setPlatforms(platforms.map(p => 
        p.id === platformId ? { ...p, status: newStatus } : p
      ));

      toast({
        title: "Platform Updated",
        description: `${platform.platform_name} is now ${newStatus === "live" ? "Live" : "Coming Soon"}.`,
      });
    } catch (err) {
      console.error("Error updating platform:", err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update platform status.",
      });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <ProtectedRoute>
      <SEO title="Platform Management - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Platform Management</h1>
              <p className="text-muted-foreground">
                Control which platforms are live or coming soon across the entire application
              </p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Platforms"
                description="We couldn't load the platform configuration."
                onRetry={loadData}
              />
            )}

            {!error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <div className="h-6 bg-muted rounded animate-pulse w-32" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-muted rounded animate-pulse" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  platforms.map((platform) => {
                    const Icon = platformIcons[platform.platform_name.toLowerCase()] || Globe;
                    const isLive = platform.status === "live";

                    return (
                      <Card key={platform.id} className={isLive ? "border-primary" : ""}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isLive ? "bg-primary/10" : "bg-muted"}`}>
                                <Icon className={`h-6 w-6 ${isLive ? "text-primary" : "text-muted-foreground"}`} />
                              </div>
                              <div>
                                <CardTitle className="text-lg capitalize">
                                  {platform.platform_name}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  {platform.launch_date || "Launch date TBD"}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor={`status-${platform.id}`} className="text-sm font-medium">
                                Platform Status
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {isLive ? "Users can connect" : "Shown as coming soon"}
                              </p>
                            </div>
                            <Switch
                              id={`status-${platform.id}`}
                              checked={isLive}
                              onCheckedChange={() => handleToggleStatus(platform.id, platform.status)}
                              disabled={updating === platform.id}
                            />
                          </div>

                          <div className="pt-4 border-t">
                            <Badge variant={isLive ? "default" : "secondary"} className="w-full justify-center">
                              {isLive ? "Live" : "Coming Soon"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            )}

            {!loading && !error && platforms.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Platforms Found</h3>
                  <p className="text-sm text-muted-foreground">
                    No platforms are configured in the database yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}