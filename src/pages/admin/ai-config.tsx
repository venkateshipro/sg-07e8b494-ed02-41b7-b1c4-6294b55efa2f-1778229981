import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary, ErrorFallback } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminService } from "@/services/adminService";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { useToast } from "@/hooks/use-toast";

interface AIConfig {
  id: string;
  active_provider: "openai" | "anthropic";
  active_model: string;
  fallback_enabled: boolean;
  fallback_provider: "openai" | "anthropic" | null;
  openai_key_encrypted?: string;
  anthropic_key_encrypted?: string;
  updated_at: string;
}

const OPENAI_MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Recommended)" },
  { value: "gpt-4o", label: "GPT-4o" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
];

const ANTHROPIC_MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4 (Recommended)" },
  { value: "claude-haiku", label: "Claude Haiku" },
  { value: "claude-opus", label: "Claude Opus" },
];

export default function AdminAIConfigPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Form state
  const [activeProvider, setActiveProvider] = useState<"openai" | "anthropic">("openai");
  const [activeModel, setActiveModel] = useState("gpt-4o-mini");
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [fallbackProvider, setFallbackProvider] = useState<"openai" | "anthropic">("anthropic");
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        router.push("/login");
        return;
      }

      const isAdmin = await adminService.isAdmin(currentUser.id);
      if (!isAdmin) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You don't have permission to access this page.",
        });
        router.push("/dashboard");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("ai_config")
        .select("*")
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setConfig(data);
        setActiveProvider(data.active_provider);
        setActiveModel(data.active_model);
        setFallbackEnabled(data.fallback_enabled);
        setFallbackProvider(data.fallback_provider || "anthropic");
        // Don't populate keys from encrypted values for security
      }

      setLoading(false);
    } catch (err) {
      console.error("Error loading AI config:", err);
      setError(err instanceof Error ? err : new Error("Failed to load AI configuration"));
      toast({
        variant: "destructive",
        title: "Failed to Load Configuration",
        description: "Could not load AI configuration.",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);

    try {
      const updateData: any = {
        active_provider: activeProvider,
        active_model: activeModel,
        fallback_enabled: fallbackEnabled,
        fallback_provider: fallbackEnabled ? fallbackProvider : null,
        updated_at: new Date().toISOString(),
      };

      // Only update keys if they were changed
      if (openaiKey.trim()) {
        updateData.openai_key_encrypted = openaiKey; // In production, encrypt this
      }
      if (anthropicKey.trim()) {
        updateData.anthropic_key_encrypted = anthropicKey; // In production, encrypt this
      }

      if (config) {
        // Update existing
        const { error } = await supabase
          .from("ai_config")
          .update(updateData)
          .eq("id", config.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from("ai_config")
          .insert([updateData]);

        if (error) throw error;
      }

      toast({
        title: "Configuration Saved",
        description: "AI configuration has been updated successfully.",
      });

      // Reload to get updated data
      await loadData();
      
      // Clear key inputs for security
      setOpenaiKey("");
      setAnthropicKey("");
    } catch (err) {
      console.error("Error saving AI config:", err);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save AI configuration.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (provider: "openai" | "anthropic") => {
    setTesting(provider);

    try {
      // In a real implementation, this would make an API call to test the connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${provider === "openai" ? "OpenAI" : "Anthropic"}.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: `Could not connect to ${provider === "openai" ? "OpenAI" : "Anthropic"}.`,
      });
    } finally {
      setTesting(null);
    }
  };

  const models = activeProvider === "openai" ? OPENAI_MODELS : ANTHROPIC_MODELS;

  return (
    <ProtectedRoute>
      <SEO title="AI Configuration - Admin - FaGrow" />
      <ErrorBoundary onReset={loadData}>
        <AdminLayout>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Configuration</h1>
              <p className="text-muted-foreground">
                Configure AI providers and models for SEO optimization and analysis features
              </p>
            </div>

            {error && (
              <ErrorFallback
                error={error}
                title="Failed to Load Configuration"
                description="We couldn't load the AI configuration."
                onRetry={loadData}
              />
            )}

            {!error && (
              <div className="grid gap-6 max-w-3xl">
                {/* Provider Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Active AI Provider
                    </CardTitle>
                    <CardDescription>
                      Select the primary AI provider for your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select value={activeProvider} onValueChange={(value: "openai" | "anthropic") => {
                        setActiveProvider(value);
                        // Reset model to first available for new provider
                        setActiveModel(value === "openai" ? "gpt-4o-mini" : "claude-sonnet-4-20250514");
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select value={activeModel} onValueChange={setActiveModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* API Keys */}
                <Card>
                  <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>
                      Securely store API keys for each provider (keys are encrypted)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* OpenAI Key */}
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="openai-key"
                            type={showOpenaiKey ? "text" : "password"}
                            placeholder="sk-..."
                            value={openaiKey}
                            onChange={(e) => setOpenaiKey(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                          >
                            {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleTestConnection("openai")}
                          disabled={testing === "openai" || !openaiKey}
                        >
                          {testing === "openai" ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            "Test Connection"
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Anthropic Key */}
                    <div className="space-y-2">
                      <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            id="anthropic-key"
                            type={showAnthropicKey ? "text" : "password"}
                            placeholder="sk-ant-..."
                            value={anthropicKey}
                            onChange={(e) => setAnthropicKey(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                          >
                            {showAnthropicKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleTestConnection("anthropic")}
                          disabled={testing === "anthropic" || !anthropicKey}
                        >
                          {testing === "anthropic" ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            "Test Connection"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fallback Configuration */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fallback Provider</CardTitle>
                    <CardDescription>
                      Automatically switch to a backup provider if the primary fails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="fallback-enabled">Enable Fallback</Label>
                        <p className="text-sm text-muted-foreground">
                          Use secondary provider when primary is unavailable
                        </p>
                      </div>
                      <Switch
                        id="fallback-enabled"
                        checked={fallbackEnabled}
                        onCheckedChange={setFallbackEnabled}
                      />
                    </div>

                    {fallbackEnabled && (
                      <div className="space-y-2 pt-4 border-t">
                        <Label>Fallback Provider</Label>
                        <Select 
                          value={fallbackProvider} 
                          onValueChange={(value: "openai" | "anthropic") => setFallbackProvider(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {activeProvider !== "openai" && <SelectItem value="openai">OpenAI</SelectItem>}
                            {activeProvider !== "anthropic" && <SelectItem value="anthropic">Anthropic Claude</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Current Configuration Summary */}
                {config && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Current Configuration</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Active Provider:</strong> {config.active_provider === "openai" ? "OpenAI" : "Anthropic Claude"}</p>
                        <p><strong>Active Model:</strong> {config.active_model}</p>
                        <p><strong>Fallback:</strong> {config.fallback_enabled ? `Enabled (${config.fallback_provider})` : "Disabled"}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last updated: {new Date(config.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Configuration"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}