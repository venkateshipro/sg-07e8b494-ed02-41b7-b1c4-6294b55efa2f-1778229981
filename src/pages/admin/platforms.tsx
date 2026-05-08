import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Youtube, Instagram, Video, Twitter, Linkedin, Facebook, Info } from "lucide-react";

export default function AdminPlatforms() {
  const comingSoonPlatforms = [
    { name: "Instagram", icon: Instagram },
    { name: "TikTok", icon: Video },
    { name: "X (Twitter)", icon: Twitter },
    { name: "LinkedIn", icon: Linkedin },
    { name: "Facebook", icon: Facebook },
  ];

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
                View active and upcoming supported social media platforms
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Platforms</CardTitle>
                <CardDescription>
                  Currently supported platforms available to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                      <Youtube className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">YouTube</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-transparent">Live</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>
                  Platforms currently in development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comingSoonPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <div key={platform.name} className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30 opacity-70">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{platform.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <Badge variant="secondary">Coming Soon</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 text-primary rounded-lg border border-primary/20">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">
                    Note: Additional platforms will be activated in future releases. No action is required at this time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}