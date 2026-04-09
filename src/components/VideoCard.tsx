import { Card, CardContent } from "@/components/ui/card";
import { Eye, ThumbsUp, Calendar } from "lucide-react";
import Image from "next/image";

interface VideoCardProps {
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  publishedAt: string;
  videoId: string;
}

export function VideoCard({ title, thumbnail, views, likes, publishedAt }: VideoCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <Card className="overflow-hidden hover:border-primary transition-colors cursor-pointer">
      <div className="relative aspect-video bg-muted">
        <Image 
          src={thumbnail} 
          alt={title} 
          fill 
          className="object-cover"
          unoptimized
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-3">{title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {formatNumber(views)}
          </div>
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {formatNumber(likes)}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(publishedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}