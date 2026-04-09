import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { decryptAPIKey } from "../encryption";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export interface AIRequest {
  type: "keyword_analysis" | "seo_optimization" | "competitor_insights";
  input: string;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider?: "openai" | "anthropic";
  model?: string;
}

const getAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  );
};

async function getAIConfig() {
  const adminClient = getAdminClient();
  const { data, error } = await adminClient
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
    const primaryProvider = config.active_provider as "openai" | "anthropic";
    const primaryModel = config.active_model;

    let response: AIResponse;

    try {
      if (primaryProvider === "openai") {
        const apiKey = decryptAPIKey(config.openai_key_encrypted || "");
        response = await openaiAdapter.call(request, primaryModel, apiKey);
      } else {
        const apiKey = decryptAPIKey(config.anthropic_key_encrypted || "");
        response = await anthropicAdapter.call(request, primaryModel, apiKey);
      }

      if (response.success) {
        return response;
      }
    } catch (primaryError) {
      console.error(`Primary provider (${primaryProvider}) failed:`, primaryError);

      if (config.fallback_enabled && config.fallback_provider) {
        const fallbackProvider = config.fallback_provider as "openai" | "anthropic";
        console.log(`Attempting fallback to ${fallbackProvider}...`);
        
        try {
          if (fallbackProvider === "openai") {
            const apiKey = decryptAPIKey(config.openai_key_encrypted || "");
            response = await openaiAdapter.call(request, "gpt-4o-mini", apiKey);
          } else {
            const apiKey = decryptAPIKey(config.anthropic_key_encrypted || "");
            response = await anthropicAdapter.call(request, "claude-sonnet-4-20250514", apiKey);
          }

          if (response.success) {
            return { ...response, provider: fallbackProvider };
          }
        } catch (fallbackError) {
          console.error(`Fallback provider (${fallbackProvider}) also failed:`, fallbackError);
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