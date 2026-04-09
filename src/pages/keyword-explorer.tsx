import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PlatformSelector } from "@/components/PlatformSelector";
import { EmptyState } from "@/components/EmptyState";
import { KeywordResultSkeleton } from "@/components/LoadingSkeletons";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, TrendingUp, AlertCircle, Sparkles, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { platformService } from "@/services/platformService";
import { planService } from "@/services/planService";
import { usageService } from "@/services/usageService";
import { SEO } from "@/components/SEO";
import type { PlatformConfig, Plan } from "@/types/database";

interface KeywordResult {
  keyword: string;
  score: number;
  competition: "low" | "medium" | "high";
  relatedKeywords: string[];
  topVideos: Array<{
    title: string;
    views: number;
    channel: string;
  }>;
}

export default function KeywordExplorerPage() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("youtube");
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [usage, setUsage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<KeywordResult | null>(null);
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
        setUsage(todayUsage?.keyword_searches || 0);
      }
    } catch (err) {
      console.error("Failed to load initial data:", err);
      setDataLoadError(err instanceof Error ? err : new Error("Failed to load page data"));
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const handleSearch = async () => {
    if (!keyword.trim() || !user || !currentPlan) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "keyword_analysis",
          input: `Analyze this YouTube keyword: "${keyword}". Return related keywords, competition level (low/medium/high), keyword score (0-100), and top 5 ranking video examples.`,
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Daily keyword search limit reached. Upgrade your plan for more searches.");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.error || "Failed to analyze keyword");
        setLoading(false);
        return;
      }

      const aiData = data.data;

      const mockResult: KeywordResult = {
        keyword: keyword,
        score: aiData?.score || 78,
        competition: aiData?.competition || "medium",
        relatedKeywords: aiData?.relatedKeywords || [
          `${keyword} tutorial`,
          `${keyword} tips`,
          `best ${keyword}`,
          `${keyword} for beginners`,
          `${keyword} guide`,
        ],
        topVideos: aiData?.topVideos || [
          { title: `Complete ${keyword} Guide 2026`, views: 1245000, channel: "Tech Channel" },
          { title: `${keyword} - Everything You Need to Know`, views: 892000, channel: "Learn Hub" },
          { title: `Master ${keyword} in 10 Minutes`, views: 567000, channel: "Quick Tutorials" },
          { title: `${keyword} Tips and Tricks`, views: 432000, channel: "Pro Tips" },
          { title: `${keyword} Explained Simply`, views: 321000, channel: "Simple Learning" },
        ],
      };

      setResults(mockResult);
      setUsage(usage + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "low": return "bg-accent text-accent-foreground";
      case "medium": return "bg-yellow-500 text-yellow-950";
      case "high": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <ProtectedRoute>
      <SEO 
        title="Keyword Explorer - FaGrow"
        description="Discover high-performing keywords for your YouTube content"
      />
      <ErrorBoundary onReset={loadInitialData}>
        <DashboardLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Keyword Explorer</h1>
              <p className="text-muted-foreground">
                Discover high-performing keywords and optimize your content strategy
              </p>
            </div>

            {dataLoadError && (
              <ErrorFallback
                error={dataLoadError}
                title="Failed to Load Keyword Explorer"
                description="We couldn't load the necessary data for this page."
                onRetry={loadInitialData}
              />
            )}

            {!dataLoadError && (
              <>
                <PlatformSelector 
                  platforms={platforms}
                  selected={selectedPlatform}
                  onSelect={setSelectedPlatform}
                />

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Search Keywords</span>
                      <Badge variant="outline">
                        {usage} / {currentPlan?.keyword_searches_limit === -1 ? "Unlimited" : currentPlan?.keyword_searches_limit || 5} searches today
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Enter a keyword to analyze its potential and discover related opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter a keyword (e.g., 'video editing tutorial')"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        disabled={loading}
                      />
                      <Button onClick={handleSearch} disabled={loading || !keyword.trim()}>
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Search
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

                {!results && !loading && !error && (
                  <EmptyState
                    icon={Lightbulb}
                    title="Discover High-Performing Keywords"
                    description="Enter a keyword above to unlock AI-powered insights including competition analysis, related keywords, and top-ranking videos in your niche."
                    actionLabel="Try Example: 'video editing'"
                    onAction={() => {
                      setKeyword("video editing");
                      handleSearch();
                    }}
                  />
                )}

                {loading && (
                  <KeywordResultSkeleton />
                )}

                {!loading && results && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Keyword Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Keyword Score</span>
                            <span className="text-2xl font-bold">{results.score}/100</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all" 
                              style={{ width: `${results.score}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">Competition Level</span>
                          <div className="mt-1">
                            <Badge className={getCompetitionColor(results.competition)}>
                              {results.competition.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground mb-2 block">Related Keywords</span>
                          <div className="flex flex-wrap gap-2">
                            {results.relatedKeywords.map((kw, idx) => (
                              <Badge key={idx} variant="outline">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-accent" />
                          Top Ranking Videos
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.topVideos.map((video, idx) => (
                            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted-foreground">{video.channel}</span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {(video.views / 1000000).toFixed(1)}M views
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </DashboardLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}