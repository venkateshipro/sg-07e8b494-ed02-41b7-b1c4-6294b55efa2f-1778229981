import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlatformBadge } from "./PlatformBadge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Menu,
  Sparkles,
  LayoutDashboard,
  Search,
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

interface DashboardMobileNavProps {
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

export function DashboardMobileNav({ user, platforms = [] }: DashboardMobileNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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

  const handleNavClick = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const handleSignOut = async () => {
    setOpen(false);
    router.push("/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FaGrow</span>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.slice(0, 1).map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}

          {/* Platforms Collapsible */}
          <Collapsible open={platformsOpen} onOpenChange={setPlatformsOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors">
              <span>Platforms</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${platformsOpen ? "rotate-180" : ""}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1 pl-6">
              {platforms.map((platform) => {
                const Icon = platformIcons[platform.platform_name.toLowerCase()] || MessageSquare;
                return (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-base"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-muted-foreground" />
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
              <button
                key={item.name}
                onClick={() => handleNavClick(item.href)}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="capitalize">
                {user.plan}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}