import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Youtube, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Platform {
  id: string;
  platform_name: string;
  status: string;
}

export default function AdminPlatforms() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatform();
  }, []);

  async function fetchPlatform() {
    setLoading(true);
    setError(null);

    // Set 5 second timeout
    const timeoutId = setTimeout(() => {
      setError("Request timed out. Please refresh the page to try again.");
      setLoading(false);
    }, 5000);

    try {
      const { data, error: fetchError } = await supabase
        .from("platforms_config")
        .select("*")
        .eq("platform_name", "YouTube")
        .maybeSingle();

      clearTimeout(timeoutId);

      if (fetchError) throw fetchError;

      setPlatform(data);
      setLoading(false);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Error fetching platform:", err);
      setError(err.message || "Failed to load platform data");
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute requireAdmin>
      <ErrorBoundary>
        <SEO 
          title="Platform Management - Admin - FaGrow"
          description="Manage supported social media platforms"
          url="/admin/platforms"
        />
        
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Platform Management</h1>
              <p className="text-muted-foreground mt-2">
                View active platform status
              </p>
            </div>

            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                </CardContent>
              </Card>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button variant="outline" size="sm" onClick={fetchPlatform}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {!loading && !error && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Platform</CardTitle>
                  <CardDescription>
                    Currently supported platform available to users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {platform ? (
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm max-w-md">
                      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                        <Youtube className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{platform.platform_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-transparent">
                            {platform.status === "live" ? "Live" : platform.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No platform data available</p>
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