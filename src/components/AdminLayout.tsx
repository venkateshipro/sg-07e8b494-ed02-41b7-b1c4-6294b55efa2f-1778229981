import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileNav } from "./AdminMobileNav";
import { ThemeSwitch } from "./ThemeSwitch";
import { Badge } from "./ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <AdminMobileNav />
              <h2 className="text-lg font-semibold hidden sm:block">FaGrow Admin</h2>
              <Badge variant="secondary" className="font-mono text-xs hidden sm:inline-flex">
                Admin Panel
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitch />
            </div>
          </div>
        </header>
        
        <main className="flex-1 px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}