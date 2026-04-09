import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PlatformSelector } from "@/components/PlatformSelector";
import { EmptyState } from "@/components/EmptyState";
import { CompetitorAnalysisSkeleton } from "@/components/LoadingSkeletons";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Target, AlertCircle, Lock, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { platformService } from "@/services/platformService";
import { planService } from "@/services/planService";
import { usageService } from "@/services/usageService";
import { SEO } from "@/components/SEO";
import type { PlatformConfig, Plan } from "@/types/database";

interface CompetitorData {
  channelName: string;
  channelHandle: string;
  subscribers: number;
  totalVideos: number;
  avgViews: number;
  recentVideos: Array<{
    title: string;
    views: number;
    publishedDate: string;
  }>;
  topTags: string[];
  uploadFrequency: string;
}

interface ComparisonData {
  metric: string;
  yourChannel: string | number;
  competitor: string | number;
  difference: string;
}

export default function CompetitorAnalysisPage() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState(0);
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoadError, setDataLoadError] = useState<Error | null>(null);

  const loadInitialData = async () => {
    try {
      setDataLoadError(null);
      const allPlatforms = await platformService.getAllPlatforms();
      setPlatforms(allPlatforms);

      if (user) {
        const plan = await planService.getPlanBySlug(user.plan);
        setCurrentPlan(plan);

        const todayUsage = await usageService.getTodayUsage(user.id);
        setUsage(todayUsage?.competitor_analysis || 0);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setDataLoadError(err instanceof Error ? err : new Error("Failed to load page data"));
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const canUseFeature = currentPlan && ["pro", "enterprise"].includes(currentPlan.slug);

  const handleAnalyze = async () => {
    if (!competitorUrl.trim() || !user || !canUseFeature) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "competitor_insights",
          input: `Analyze this YouTube competitor: ${competitorUrl}. Provide channel metrics, content strategy insights, and growth recommendations.`,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Daily competitor analysis limit reached. Try again tomorrow.");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.error || "Failed to analyze competitor");
        setLoading(false);
        return;
      }

      const aiData = data.data;

      const mockCompetitor: CompetitorData = {
        channelName: aiData?.channelName || "Tech Competitor",
        channelHandle: aiData?.channelHandle || "@techcompetitor",
        subscribers: aiData?.subscribers || 1250000,
        totalVideos: aiData?.totalVideos || 342,
        avgViews: aiData?.avgViews || 85000,
        recentVideos: aiData?.recentVideos || [
          { title: "Latest Tech Review", views: 125000, publishedDate: "2026-04-08" },
          { title: "Tutorial Series Part 5", views: 98000, publishedDate: "2026-04-06" },
          { title: "Product Unboxing", views: 156000, publishedDate: "2026-04-04" },
          { title: "How To Guide", views: 72000, publishedDate: "2026-04-01" },
          { title: "Industry News Update", views: 89000, publishedDate: "2026-03-29" },
        ],
        topTags: aiData?.topTags || [
          "tech",
          "tutorial",
          "review",
          "unboxing",
          "howto",
          "technology",
          "gadgets",
          "2026",
        ],
        uploadFrequency: aiData?.uploadFrequency || "3 videos per week",
      };

      const mockComparison: ComparisonData[] = [
        { metric: "Subscribers", yourChannel: "245K", competitor: "1.25M", difference: "+408%" },
        { metric: "Total Videos", yourChannel: 127, competitor: 342, difference: "+169%" },
        { metric: "Avg Views per Video", yourChannel: "32K", competitor: "85K", difference: "+166%" },
        { metric: "Upload Frequency", yourChannel: "2/week", competitor: "3/week", difference: "+50%" },
      ];

      setCompetitorData(mockCompetitor);
      setComparison(mockComparison);
      setUsage(usage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <SEO
        title="Competitor Analysis - FaGrow"
        description="Analyze competitor channels and discover growth strategies"
      />
      <ErrorBoundary onReset={loadInitialData}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Competitor Analysis</h1>
              <p className="text-muted-foreground">
                Analyze competitor channels and discover strategies to grow your audience
              </p>
            </div>

            {dataLoadError && (
              <ErrorFallback
                error={dataLoadError}
                title="Failed to Load Competitor Analysis"
                description="We couldn't load the necessary data for this page."
                onRetry={loadInitialData}
              />
            )}

            {!dataLoadError && (
              <>
                <PlatformSelector platforms={platforms} selected={selectedPlatform} onSelect={setSelectedPlatform} />

                {!canUseFeature ? (
                  <Card className="border-primary/50">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-primary" />
                        <CardTitle>Upgrade to Pro or Enterprise</CardTitle>
                      </div>
                      <CardDescription>
                        Competitor Analysis is available on Pro and Enterprise plans. Upgrade to unlock deep insights into
                        competitor strategies.
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
                          <span>Analyze Competitor</span>
                          <Badge variant="outline">
                            {usage} /{" "}
                            {currentPlan?.competitor_analysis_limit === -1
                              ? "Unlimited"
                              : currentPlan?.competitor_analysis_limit || 0}{" "}
                            analyses today
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          Enter a competitor YouTube channel URL or handle to analyze their strategy
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., @channelhandle or youtube.com/c/channelname"
                            value={competitorUrl}
                            onChange={(e) => setCompetitorUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                            disabled={loading}
                          />
                          <Button onClick={handleAnalyze} disabled={loading || !competitorUrl.trim()}>
                            {loading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Search className="h-4 w-4 mr-2" />
                                Analyze
                              </>
                            )}
                          </Button>
                        </div>

                        {error && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    {loading && (
                      <CompetitorAnalysisSkeleton />
                    )}

                    {!competitorData && !loading && !error && (
                      <EmptyState
                        icon={BarChart3}
                        title="Analyze Your Competitors"
                        description="Enter a competitor's YouTube channel URL or handle above to uncover their content strategy, growth patterns, and top-performing content. Learn what works in your niche."
                        actionLabel="Try Example Channel"
                        onAction={() => {
                          setCompetitorUrl("@mkbhd");
                          handleAnalyze();
                        }}
                      />
                    )}

                    {competitorData && !loading && (
                      <div className="grid grid-cols-1 gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {(competitorData.subscribers / 1000000).toFixed(2)}M
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                              <Target className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{competitorData.totalVideos}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                              <CardTitle className="text-sm font-medium">Avg Views</CardTitle>
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">
                                {(competitorData.avgViews / 1000).toFixed(1)}K
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card>
                            <CardHeader>
                              <CardTitle>Channel Comparison</CardTitle>
                              <CardDescription>Your channel vs {competitorData.channelName}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>Yours</TableHead>
                                    <TableHead>Theirs</TableHead>
                                    <TableHead>Gap</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {comparison.map((row, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell className="font-medium">{row.metric}</TableCell>
                                      <TableCell>{row.yourChannel}</TableCell>
                                      <TableCell>{row.competitor}</TableCell>
                                      <TableCell>
                                        <span className="text-primary font-semibold">{row.difference}</span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader>
                              <CardTitle>Recent Videos</CardTitle>
                              <CardDescription>Last 5 uploads from competitor</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {competitorData.recentVideos.map((video, idx) => (
                                  <div key={idx} className="pb-3 border-b border-border last:border-0">
                                    <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                      <span>{(video.views / 1000).toFixed(1)}K views</span>
                                      <span>•</span>
                                      <span>{new Date(video.publishedDate).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader>
                            <CardTitle>Content Strategy Insights</CardTitle>
                            <CardDescription>What you can learn from this competitor</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Upload Frequency</h4>
                              <p className="text-sm text-muted-foreground">
                                They post <span className="text-foreground font-medium">{competitorData.uploadFrequency}</span>
                                . Consistent uploads help maintain audience engagement.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Top Tags Used</h4>
                              <div className="flex flex-wrap gap-2">
                                {competitorData.topTags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Key Takeaways</h4>
                              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                <li>Focus on tutorial and how-to content for higher engagement</li>
                                <li>Increase upload frequency to match top performers in your niche</li>
                                <li>Use trending keywords and tags in video metadata</li>
                                <li>Create more unboxing and review content (high view counts)</li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </DashboardLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}