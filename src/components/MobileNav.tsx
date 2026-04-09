import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { Separator } from "@/components/ui/separator";
import { Menu, Sparkles, Search, Target, TrendingUp, DollarSign, HelpCircle } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "#features", label: "Features", icon: Search },
    { href: "#platforms", label: "Platforms", icon: Target },
    { href: "#pricing", label: "Pricing", icon: DollarSign },
    { href: "#faq", label: "FAQ", icon: HelpCircle },
  ];

  const handleNavClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[350px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-left">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FaGrow
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 mt-8">
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-accent/10 hover:text-primary active:bg-accent/20"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-muted-foreground">Theme</span>
            <ThemeSwitch />
          </div>

          <Separator className="my-4" />

          {/* Auth Buttons */}
          <div className="flex flex-col gap-3">
            <Link href="/login" onClick={handleNavClick}>
              <Button
                variant="outline"
                className="w-full h-12 text-base"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup" onClick={handleNavClick}>
              <Button
                className="w-full h-12 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-auto pt-6">
            <p className="text-xs text-center text-muted-foreground">
              © 2026 FaGrow. All rights reserved.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}