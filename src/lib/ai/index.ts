import { supabase } from "@/integrations/supabase/client";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";

export interface AIRequest {
  type: "keyword_analysis" | "seo_optimization" | "competitor_insights";
  input: string;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  provider?: "openai" | "anthropic";
  model?: string;
}

async function getAIConfig() {
  const { data, error } = await supabase
    .from("ai_config")
    .select("*")
    .single();

  if (error) {
    console.error("Error fetching AI config:", error);
    throw new Error("Failed to fetch AI configuration");
  }

  return data;
}

export async function callAI(request: AIRequest): Promise<AIResponse> {
  try {
    const config = await getAIConfig();
    const primaryProvider = config.active_provider;
    const primaryModel = config.active_model;

    let response: AIResponse;

    try {
      if (primaryProvider === "openai") {
        response = await openaiAdapter.call(request, primaryModel, config.openai_key_encrypted);
      } else {
        response = await anthropicAdapter.call(request, primaryModel, config.anthropic_key_encrypted);
      }

      if (response.success) {
        return response;
      }
    } catch (primaryError) {
      console.error(`Primary provider (${primaryProvider}) failed:`, primaryError);

      if (config.fallback_enabled && config.fallback_provider) {
        console.log(`Attempting fallback to ${config.fallback_provider}...`);
        
        try {
          if (config.fallback_provider === "openai") {
            response = await openaiAdapter.call(request, "gpt-4o-mini", config.openai_key_encrypted);
          } else {
            response = await anthropicAdapter.call(request, "claude-sonnet-4-20250514", config.anthropic_key_encrypted);
          }

          if (response.success) {
            return { ...response, provider: config.fallback_provider };
          }
        } catch (fallbackError) {
          console.error(`Fallback provider (${config.fallback_provider}) also failed:`, fallbackError);
        }
      }

      return {
        success: false,
        error: "All AI providers failed",
      };
    }

    return response;
  } catch (error) {
    console.error("AI call error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function testConnection(provider: "openai" | "anthropic", apiKey: string): Promise<boolean> {
  try {
    if (provider === "openai") {
      return await openaiAdapter.testConnection(apiKey);
    } else {
      return await anthropicAdapter.testConnection(apiKey);
    }
  } catch (error) {
    console.error(`Test connection failed for ${provider}:`, error);
    return false;
  }
}