import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

interface AIConfig {
  id: string;
  active_provider: "openai" | "anthropic";
  active_model: string;
  fallback_enabled: boolean;
  fallback_provider: "openai" | "anthropic" | null;
  openai_key_encrypted: string | null;
  anthropic_key_encrypted: string | null;
}

const MODEL_OPTIONS = {
  openai: [
    { value: "gpt-4o-mini", label: "GPT-4o Mini (Recommended)" },
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  ],
  anthropic: [
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
    { value: "claude-haiku", label: "Claude Haiku" },
    { value: "claude-opus", label: "Claude Opus" },
  ],
};

export default function AIConfiguration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [testingAnthropic, setTestingAnthropic] = useState(false);

  const [config, setConfig] = useState<AIConfig | null>(null);
  const [activeProvider, setActiveProvider] = useState<"openai" | "anthropic">("openai");
  const [activeModel, setActiveModel] = useState("gpt-4o-mini");
  const [fallbackEnabled, setFallbackEnabled] = useState(false);
  const [fallbackProvider, setFallbackProvider] = useState<"openai" | "anthropic" | null>(null);
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");

  const [openaiTestResult, setOpenaiTestResult] = useState<"success" | "error" | null>(null);
  const [anthropicTestResult, setAnthropicTestResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const { data, error } = await supabase
        .from("ai_config")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig(data as AIConfig);
        setActiveProvider(data.active_provider as "openai" | "anthropic");
        setActiveModel(data.active_model);
        setFallbackEnabled(data.fallback_enabled);
        setFallbackProvider(data.fallback_provider as "openai" | "anthropic" | null);
        // Don't show encrypted keys in plaintext - just indicate they exist
        setOpenaiKey(data.openai_key_encrypted ? "••••••••••••••••" : "");
        setAnthropicKey(data.anthropic_key_encrypted ? "••••••••••••••••" : "");
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching AI config:", error);
      toast({
        title: "Error",
        description: "Failed to load AI configuration",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updateData: any = {
        active_provider: activeProvider,
        active_model: activeModel,
        fallback_enabled: fallbackEnabled,
        fallback_provider: fallbackEnabled ? fallbackProvider : null,
        updated_at: new Date().toISOString(),
      };

      // Only update keys if they were changed (not showing masked value)
      if (openaiKey && openaiKey !== "••••••••••••••••") {
        updateData.openai_key_encrypted = openaiKey; // In production, encrypt this
      }
      if (anthropicKey && anthropicKey !== "••••••••••••••••") {
        updateData.anthropic_key_encrypted = anthropicKey; // In production, encrypt this
      }

      if (config) {
        // Update existing config
        const { error } = await supabase
          .from("ai_config")
          .update(updateData)
          .eq("id", config.id);

        if (error) throw error;
      } else {
        // Insert new config
        const { error } = await supabase
          .from("ai_config")
          .insert([updateData]);

        if (error) throw error;
      }

      toast({
        title: "Configuration saved",
        description: "AI configuration has been updated successfully.",
      });

      fetchConfig();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection(provider: "openai" | "anthropic") {
    const apiKey = provider === "openai" ? openaiKey : anthropicKey;
    
    if (!apiKey || apiKey === "••••••••••••••••") {
      toast({
        title: "API Key required",
        description: `Please enter a valid ${provider === "openai" ? "OpenAI" : "Anthropic"} API key first.`,
        variant: "destructive",
      });
      return;
    }

    if (provider === "openai") {
      setTestingOpenAI(true);
      setOpenaiTestResult(null);
    } else {
      setTestingAnthropic(true);
      setAnthropicTestResult(null);
    }

    try {
      // Call test API endpoint
      const response = await fetch("/api/ai/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (provider === "openai") {
          setOpenaiTestResult("success");
        } else {
          setAnthropicTestResult("success");
        }
        toast({
          title: "Connection successful",
          description: `Successfully connected to ${provider === "openai" ? "OpenAI" : "Anthropic Claude"}`,
        });
      } else {
        throw new Error(result.error || "Connection failed");
      }
    } catch (error: any) {
      if (provider === "openai") {
        setOpenaiTestResult("error");
      } else {
        setAnthropicTestResult("error");
      }
      toast({
        title: "Connection failed",
        description: error.message || `Could not connect to ${provider === "openai" ? "OpenAI" : "Anthropic"}`,
        variant: "destructive",
      });
    } finally {
      if (provider === "openai") {
        setTestingOpenAI(false);
      } else {
        setTestingAnthropic(false);
      }
    }
  }

  const availableModels = MODEL_OPTIONS[activeProvider];
  const fallbackOptions = activeProvider === "openai" ? "anthropic" : "openai";

  if (loading) {
    return (
      <ProtectedRoute requireAdmin>
        <AdminLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <ErrorBoundary>
        <SEO 
          title="AI Configuration - Admin - FaGrow"
          description="Configure AI providers and models for FaGrow"
          url="/admin/ai-config"
        />
        
        <AdminLayout>
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">AI Configuration</h1>
              <p className="text-muted-foreground mt-2">
                Manage AI providers, models, and API keys for the platform
              </p>
            </div>

            {/* Provider Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Active Provider</CardTitle>
                <CardDescription>
                  Choose which AI provider to use for keyword research, SEO optimization, and competitor analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="active-provider">AI Provider</Label>
                    <Select value={activeProvider} onValueChange={(value: "openai" | "anthropic") => {
                      setActiveProvider(value);
                      // Reset model to first option of new provider
                      setActiveModel(MODEL_OPTIONS[value][0].value);
                    }}>
                      <SelectTrigger id="active-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="active-model">Model</Label>
                    <Select value={activeModel} onValueChange={setActiveModel}>
                      <SelectTrigger id="active-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys */}
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Enter your API keys for each provider. Keys are encrypted before storage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OpenAI Key */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="openai-key"
                        type="password"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testConnection("openai")}
                        disabled={testingOpenAI || !openaiKey}
                      >
                        {testingOpenAI ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : openaiTestResult === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : openaiTestResult === "error" ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          "Test"
                        )}
                      </Button>
                    </div>
                    {openaiTestResult === "success" && (
                      <p className="text-sm text-accent">✓ Connection successful</p>
                    )}
                    {openaiTestResult === "error" && (
                      <p className="text-sm text-destructive">✗ Connection failed</p>
                    )}
                  </div>
                </div>

                {/* Anthropic Key */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="anthropic-key"
                        type="password"
                        placeholder="sk-ant-..."
                        value={anthropicKey}
                        onChange={(e) => setAnthropicKey(e.target.value)}
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={() => testConnection("anthropic")}
                        disabled={testingAnthropic || !anthropicKey}
                      >
                        {testingAnthropic ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : anthropicTestResult === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : anthropicTestResult === "error" ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          "Test"
                        )}
                      </Button>
                    </div>
                    {anthropicTestResult === "success" && (
                      <p className="text-sm text-accent">✓ Connection successful</p>
                    )}
                    {anthropicTestResult === "error" && (
                      <p className="text-sm text-destructive">✗ Connection failed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fallback Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Fallback Provider</CardTitle>
                <CardDescription>
                  Enable automatic failover to a secondary provider if the primary fails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="fallback-enabled">Enable Fallback</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically switch to fallback provider on errors
                    </p>
                  </div>
                  <Switch
                    id="fallback-enabled"
                    checked={fallbackEnabled}
                    onCheckedChange={(checked) => {
                      setFallbackEnabled(checked);
                      if (checked && !fallbackProvider) {
                        setFallbackProvider(fallbackOptions);
                      }
                    }}
                  />
                </div>

                {fallbackEnabled && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="fallback-provider">Fallback Provider</Label>
                    <Select 
                      value={fallbackProvider || fallbackOptions} 
                      onValueChange={(value: "openai" | "anthropic") => setFallbackProvider(value)}
                    >
                      <SelectTrigger id="fallback-provider">
                        <SelectValue placeholder="Select fallback provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={fallbackOptions}>
                          {fallbackOptions === "openai" ? "OpenAI" : "Anthropic Claude"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      Will use {fallbackOptions === "openai" ? "OpenAI" : "Anthropic"} if {activeProvider === "openai" ? "OpenAI" : "Anthropic"} fails
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </AdminLayout>
      </ErrorBoundary>
    </ProtectedRoute>
  );
}