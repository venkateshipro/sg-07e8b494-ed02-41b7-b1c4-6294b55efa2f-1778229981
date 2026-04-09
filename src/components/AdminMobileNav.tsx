import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Shield,
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  Sparkles,
  Globe,
  Megaphone,
  Settings,
  LogOut
} from "lucide-react";

interface AdminMobileNavProps {
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export function AdminMobileNav({ user }: AdminMobileNavProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { name: "Plans & Pricing", href: "/admin/plans", icon: DollarSign },
    { name: "Platform Management", href: "/admin/platforms", icon: Globe },
    { name: "AI Configuration", href: "/admin/ai-config", icon: Sparkles },
    { name: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

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
          aria-label="Open admin navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">FaGrow</span>
              <Badge variant="secondary" className="text-xs">Admin</Badge>
            </div>
          </SheetTitle>
        </SheetHeader>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
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
            <Button variant="ghost" size="sm" className="w-full justify-start h-11" onClick={handleSignOut}>
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}