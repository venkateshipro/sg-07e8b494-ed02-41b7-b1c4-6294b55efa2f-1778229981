import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatsCard } from "@/components/StatsCard";
import { UsageMeter } from "@/components/UsageMeter";
import { VideoCard } from "@/components/VideoCard";
import { PlatformSelector } from "@/components/PlatformSelector";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Users, Eye, Video, TrendingUp, Search, Sparkles, Target } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { platformService } from "@/services/platformService";
import { planService } from "@/services/planService";
import { usageService } from "@/services/usageService";
import { announcementService } from "@/services/announcementService";
import type { PlatformConfig, Announcement, Plan } from "@/types/database";
import { SEO } from "@/components/SEO";

export default function DashboardPage() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState({ keywordSearches: 0, seoOptimizations: 0, competitorAnalysis: 0 });
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const allPlatforms = await platformService.getAllPlatforms();
      setPlatforms(allPlatforms);

      const announcements = await announcementService.getActiveAnnouncements();
      if (announcements.length > 0) {
        setAnnouncement(announcements[0]);
      }

      if (user) {
        const plan = await planService.getPlanBySlug(user.plan);
        setCurrentPlan(plan);

        const todayUsage = await usageService.getTodayUsage(user.id);
        if (todayUsage) {
          setUsage({
            keywordSearches: todayUsage.keyword_searches,
            seoOptimizations: todayUsage.seo_optimizations,
            competitorAnalysis: todayUsage.competitor_analysis,
          });
        }
      }
    };

    loadData();
  }, [user]);

  const mockStats = {
    subscribers: 12453,
    totalViews: 892341,
    videosPublished: 47,
    estimatedMonthlyViews: 125000,
  };

  const mockVideos = Array.from({ length: 10 }, (_, i) => ({
    videoId: `vid-${i}`,
    title: `Sample YouTube Video Title ${i + 1} - How to Grow Your Channel`,
    thumbnail: `https://images.unsplash.com/photo-${1580000000000 + i}?w=480&h=270&fit=crop`,
    views: Math.floor(Math.random() * 100000),
    likes: Math.floor(Math.random() * 5000),
    publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  return (
    <ProtectedRoute>
      <SEO 
        title="Dashboard - FaGrow"
        description="Manage your social media growth and track your performance"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}! Here's your channel overview.
            </p>
          </div>

          {announcement && !dismissedAnnouncement && (
            <AnnouncementBanner 
              announcement={announcement}
              onDismiss={() => setDismissedAnnouncement(true)}
            />
          )}

          <PlatformSelector 
            platforms={platforms}
            selected={selectedPlatform}
            onSelect={setSelectedPlatform}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Subscribers"
              value={mockStats.subscribers.toLocaleString()}
              icon={Users}
              trend={{ value: "12.5%", isPositive: true }}
            />
            <StatsCard
              title="Total Views"
              value={mockStats.totalViews.toLocaleString()}
              icon={Eye}
              trend={{ value: "8.3%", isPositive: true }}
            />
            <StatsCard
              title="Videos Published"
              value={mockStats.videosPublished}
              icon={Video}
            />
            <StatsCard
              title="Est. Monthly Views"
              value={mockStats.estimatedMonthlyViews.toLocaleString()}
              icon={TrendingUp}
              trend={{ value: "15.2%", isPositive: true }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UsageMeter
              title="Keyword Searches"
              used={usage.keywordSearches}
              limit={currentPlan?.keyword_searches_limit || 5}
              icon={<Search className="h-4 w-4" />}
            />
            <UsageMeter
              title="SEO Optimizations"
              used={usage.seoOptimizations}
              limit={currentPlan?.seo_optimizations_limit || 0}
              icon={<Sparkles className="h-4 w-4" />}
            />
            <UsageMeter
              title="Competitor Analysis"
              used={usage.competitorAnalysis}
              limit={currentPlan?.competitor_analysis_limit || 0}
              icon={<Target className="h-4 w-4" />}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {mockVideos.map((video) => (
                <VideoCard key={video.videoId} {...video} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Top Performing Video This Month</h2>
            <div className="max-w-md">
              <VideoCard
                title="My Best Performing Video - 10 Tips for Channel Growth"
                thumbnail="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=480&h=270&fit=crop"
                views={245600}
                likes={12300}
                publishedAt={new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()}
                videoId="top-video"
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}