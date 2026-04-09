import { Badge } from "@/components/ui/badge";
import type { PlatformStatus } from "@/types/database";

interface PlatformBadgeProps {
  status: PlatformStatus;
}

export function PlatformBadge({ status }: PlatformBadgeProps) {
  if (status === "live") {
    return (
      <Badge variant="default" className="bg-accent text-accent-foreground">
        Live
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-muted text-muted-foreground">
      Coming Soon
    </Badge>
  );
}