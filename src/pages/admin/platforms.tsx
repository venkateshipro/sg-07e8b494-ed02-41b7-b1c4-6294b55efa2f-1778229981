import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Youtube } from "lucide-react";

export default function AdminPlatforms() {
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

            <Card>
              <CardHeader>
                <CardTitle>Active Platform</CardTitle>
                <CardDescription>
                  Currently supported platform available to users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-card shadow-sm max-w-md">
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
              </CardContent>
            </Card>
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}