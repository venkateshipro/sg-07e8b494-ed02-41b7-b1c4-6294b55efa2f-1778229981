import Link from "next/link";
import { useRouter } from "next/router";
import { 
  LayoutDashboard, 
  Search, 
  Sparkles, 
  Target, 
  CreditCard, 
  Settings,
  HelpCircle,
  Youtube,
  Instagram,
  MessageSquare,
  Linkedin,
  Facebook,
  ChevronDown,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PlatformBadge } from "./PlatformBadge";
import { useState } from "react";

interface DashboardSidebarProps {
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
    plan: string;
  };
  platforms?: Array<{
    id: string;
    platform_name: string;
    status: "live" | "coming_soon";
  }>;
}

export function DashboardSidebar({ user, platforms = [] }: DashboardSidebarProps) {
  const router = useRouter();
  const [platformsOpen, setPlatformsOpen] = useState(true);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Keyword Explorer", href: "/keyword-explorer", icon: Search },
    { name: "SEO Optimizer", href: "/seo-optimizer", icon: Sparkles },
    { name: "Competitor Analysis", href: "/competitor-analysis", icon: Target },
    { name: "Billing & Plan", href: "/billing", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help & Support", href: "/support", icon: HelpCircle },
  ];

  const platformIcons: Record<string, typeof Youtube> = {
    youtube: Youtube,
    instagram: Instagram,
    tiktok: MessageSquare,
    x: MessageSquare,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  const handleSignOut = async () => {
    // Will implement in auth task
    router.push("/");
  };

  return (
    <div className="hidden lg:flex flex-col h-full w-64 bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">FaGrow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.slice(0, 1).map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}

        {/* Platforms Collapsible */}
        <Collapsible open={platformsOpen} onOpenChange={setPlatformsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
            <span>Platforms</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${platformsOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 space-y-1 pl-6">
            {platforms.map((platform) => {
              const Icon = platformIcons[platform.platform_name.toLowerCase()] || MessageSquare;
              return (
                <div
                  key={platform.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{platform.platform_name}</span>
                  </div>
                  <PlatformBadge status={platform.status} />
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {navigation.slice(1).map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src={user.avatar_url} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="capitalize">
              {user.plan}
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}