import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Target,
  CreditCard,
  Settings,
  HelpCircle,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Keyword Explorer", href: "/keyword-explorer", icon: Search },
  { name: "SEO Optimizer", href: "/seo-optimizer", icon: Sparkles },
  { name: "Competitor Analysis", href: "/competitor-analysis", icon: Target },
  { name: "Billing & Plan", href: "/billing", icon: CreditCard },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help & Support", href: "#", icon: HelpCircle },
];

export function DashboardSidebar() {
  const router = useRouter();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-card">
      <div className="flex flex-col flex-1 min-h-0">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FaGrow</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Profile Dropdown */}
        <div className="border-t p-3">
          <UserProfileDropdown />
        </div>
      </div>
    </div>
  );
}