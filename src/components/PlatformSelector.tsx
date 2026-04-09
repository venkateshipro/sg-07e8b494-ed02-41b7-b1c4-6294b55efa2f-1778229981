import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Youtube, Instagram, MessageSquare, Linkedin, Facebook } from "lucide-react";
import { PlatformBadge } from "./PlatformBadge";
import type { PlatformConfig } from "@/types/database";

interface PlatformSelectorProps {
  platforms: PlatformConfig[];
  selected: string;
  onSelect: (platform: string) => void;
}

export function PlatformSelector({ platforms, selected, onSelect }: PlatformSelectorProps) {
  const platformIcons: Record<string, typeof Youtube> = {
    youtube: Youtube,
    instagram: Instagram,
    tiktok: MessageSquare,
    x: MessageSquare,
    linkedin: Linkedin,
    facebook: Facebook,
  };

  return (
    <Tabs value={selected} onValueChange={onSelect} className="w-full">
      <TabsList className="grid w-full grid-cols-6 h-auto">
        {platforms.map((platform) => {
          const Icon = platformIcons[platform.platform_name.toLowerCase()] || MessageSquare;
          const isLive = platform.status === "live";
          
          return (
            <TabsTrigger
              key={platform.id}
              value={platform.platform_name.toLowerCase()}
              disabled={!isLive}
              className="flex flex-col items-center gap-2 py-3"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs capitalize">{platform.platform_name}</span>
              {!isLive && <PlatformBadge status="coming_soon" />}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}