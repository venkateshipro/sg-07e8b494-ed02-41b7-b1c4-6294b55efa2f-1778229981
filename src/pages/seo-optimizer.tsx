import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PlatformSelector } from "@/components/PlatformSelector";
import { EmptyState } from "@/components/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sparkles, Copy, Check, AlertCircle, Lock, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { platformService } from "@/services/platformService";
import { planService } from "@/services/planService";
import { usageService } from "@/services/usageService";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import type { PlatformConfig, Plan } from "@/types/database";

interface VideoData {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

interface OptimizationResult {
  title: string;
  description: string;
  tags: string[];
}

export default function SEOOptimizerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [optimizedResult, setOptimizedResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const mockVideos: VideoData[] = [
    {
      id: "1",
      title: "My Video About Cooking",
      description: "This is a video where I cook something. It was fun.",
      tags: ["cooking", "food", "video"],
    },
    {
      id: "2",
      title: "Gaming Video",
      description: "Playing games.",
      tags: ["gaming", "games"],
    },
    {
      id: "3",
      title: "Travel Vlog",
      description: "I went somewhere cool.",
      tags: ["travel", "vlog"],
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      const allPlatforms = await platformService.getAllPlatforms();
      setPlatforms(allPlatforms);

      if (user) {
        const plan = await planService.getPlanBySlug(user.plan);
        setCurrentPlan(plan);

        const todayUsage = await usageService.getTodayUsage(user.id);
        setUsage(todayUsage?.seo_optimizations || 0);
      }
    };

    loadData();
  }, [user]);

  const canUseFeature = currentPlan && ["pro", "enterprise"].includes(currentPlan.slug);

  const handleVideoSelect = (videoId: string) => {
    setSelectedVideo(videoId);
    const video = mockVideos.find((v) => v.id === videoId);
    setVideoData(video || null);
    setOptimizedResult(null);
    setError(null);
  };

  const handleOptimize = async () => {
    if (!videoData || !user || !canUseFeature) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "seo_optimization",
          input: `Optimize this YouTube video for SEO:\nTitle: ${videoData.title}\nDescription: ${videoData.description}\nTags: ${videoData.tags.join(", ")}\n\nReturn improved versions with better keywords and engagement potential.`,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Daily SEO optimization limit reached. Try again tomorrow.");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.error || "Failed to optimize video");
        setLoading(false);
        return;
      }

      const aiData = data.data;

      const result: OptimizationResult = {
        title: aiData?.title || `${videoData.title} | Complete Guide 2026`,
        description:
          aiData?.description ||
          `${videoData.description}\n\n📌 Timestamps:\n0:00 - Introduction\n2:30 - Main Content\n8:45 - Conclusion\n\n🔔 Subscribe for more content!`,
        tags:
          aiData?.tags ||
          [...videoData.tags, "tutorial", "guide", "2026", "how to", "tips", "beginners", "step by step"],
      };

      setOptimizedResult(result);
      setUsage(usage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFields({ ...copiedFields, [field]: true });
    toast({
      title: "Copied!",
      description: `${field} copied to clipboard`,
    });
    setTimeout(() => {
      setCopiedFields({ ...copiedFields, [field]: false });
    }, 2000);
  };

  return (
    <ProtectedRoute>
      <SEO title="SEO Optimizer - FaGrow" description="Optimize your YouTube videos for better discoverability" />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">SEO Optimizer</h1>
            <p className="text-muted-foreground">
              AI-powered optimization for your video titles, descriptions, and tags
            </p>
          </div>

          <PlatformSelector platforms={platforms} selected={selectedPlatform} onSelect={setSelectedPlatform} />

          {!canUseFeature ? (
            <Card className="border-primary/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <CardTitle>Upgrade to Pro or Enterprise</CardTitle>
                </div>
                <CardDescription>
                  The SEO Optimizer is available on Pro and Enterprise plans. Upgrade to unlock AI-powered video
                  optimization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => (window.location.href = "/billing")}>
                  View Plans & Upgrade
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Select Video</span>
                    <Badge variant="outline">
                      {usage} /{" "}
                      {currentPlan?.seo_optimizations_limit === -1
                        ? "Unlimited"
                        : currentPlan?.seo_optimizations_limit || 0}{" "}
                      optimizations today
                    </Badge>
                  </CardTitle>
                  <CardDescription>Choose a video from your channel to optimize</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedVideo} onValueChange={handleVideoSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a video" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVideos.map((video) => (
                        <SelectItem key={video.id} value={video.id}>
                          {video.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {videoData && (
                    <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Current Title</label>
                        <p className="text-sm mt-1">{videoData.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Current Description</label>
                        <p className="text-sm mt-1 whitespace-pre-line">{videoData.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Current Tags</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {videoData.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button onClick={handleOptimize} disabled={!videoData || loading} className="w-full">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Optimizing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Optimize with AI
                      </>
                    )}
                  </Button>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {loading && (
                <Card>
                  <CardHeader>
                    <Skeleton className="h-6 w-48" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              )}

              {!optimizedResult && !loading && videoData && (
                <EmptyState
                  icon={Zap}
                  title="AI-Powered SEO Optimization"
                  description="Click the 'Optimize with AI' button above to transform your video's title, description, and tags for maximum discoverability and engagement."
                />
              )}

              {optimizedResult && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Original</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                        <p className="text-sm mt-1">{videoData?.title}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <p className="text-sm mt-1 whitespace-pre-line">{videoData?.description}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tags ({videoData?.tags.length})</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {videoData?.tags.map((tag, idx) => (
                            <Badge key={idx} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Optimized
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium">Title</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("Title", optimizedResult.title)}
                          >
                            {copiedFields["Title"] ? (
                              <Check className="h-4 w-4 text-accent" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Input value={optimizedResult.title} readOnly />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium">Description</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("Description", optimizedResult.description)}
                          >
                            {copiedFields["Description"] ? (
                              <Check className="h-4 w-4 text-accent" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <Textarea value={optimizedResult.description} readOnly rows={6} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium">Tags ({optimizedResult.tags.length})</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy("Tags", optimizedResult.tags.join(", "))}
                          >
                            {copiedFields["Tags"] ? (
                              <Check className="h-4 w-4 text-accent" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {optimizedResult.tags.map((tag, idx) => (
                            <Badge key={idx} variant="default">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}