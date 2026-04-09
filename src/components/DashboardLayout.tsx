import { ReactNode, useEffect, useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { userService } from "@/services/userService";
import { platformService } from "@/services/platformService";
import type { User } from "@/types/database";
import type { PlatformConfig } from "@/types/database";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);

      const allPlatforms = await platformService.getAllPlatforms();
      setPlatforms(allPlatforms);
    };

    loadUserData();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-64 flex-shrink-0">
        <DashboardSidebar 
          user={user ? {
            name: user.name,
            email: user.email,
            avatar_url: user.avatar_url || undefined,
            plan: user.plan,
          } : undefined}
          platforms={platforms}
        />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}