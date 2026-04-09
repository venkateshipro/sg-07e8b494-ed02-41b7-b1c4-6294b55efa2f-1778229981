import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { ThemeSwitch } from "./ThemeSwitch";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-8">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">FaGrow Dashboard</h2>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitch />
            </div>
          </div>
        </header>
        
        <main className="flex-1 container px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}