import { X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { Announcement } from "@/types/database";

interface AnnouncementBannerProps {
  announcement: Announcement;
  onDismiss: () => void;
}

export function AnnouncementBanner({ announcement, onDismiss }: AnnouncementBannerProps) {
  const variantMap = {
    info: "default" as const,
    warning: "destructive" as const,
    success: "default" as const,
  };

  const colorMap = {
    info: "border-primary",
    warning: "border-destructive",
    success: "border-accent",
  };

  return (
    <Alert variant={variantMap[announcement.type]} className={`${colorMap[announcement.type]} relative`}>
      <AlertTitle className="flex items-center justify-between">
        {announcement.title}
        <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>{announcement.message}</AlertDescription>
    </Alert>
  );
}