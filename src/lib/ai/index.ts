import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { deepseekAdapter } from "./deepseek";
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
  provider?: "openai" | "anthropic" | "deepseek";
  model?: string;
  fallback_triggered?: boolean;
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
    const primaryProvider = config.active_provider as "openai" | "anthropic" | "deepseek";
    const primaryModel = config.active_model;

    const executeProvider = async (provider: string, model: string, isFallback: boolean): Promise<AIResponse> => {
      let res: AIResponse;
      if (provider === "openai") {
        const apiKey = decryptAPIKey(config.openai_key_encrypted || "");
        res = await openaiAdapter.call(request, model, apiKey);
      } else if (provider === "anthropic") {
        const apiKey = decryptAPIKey(config.anthropic_key_encrypted || "");
        res = await anthropicAdapter.call(request, model, apiKey);
      } else {
        const apiKey = decryptAPIKey(config.deepseek_key_encrypted || "");
        res = await deepseekAdapter.call(request, model, apiKey);
      }
      
      return {
        ...res,
        provider: provider as "openai" | "anthropic" | "deepseek",
        model: model,
        fallback_triggered: isFallback
      };
    };

    let response: AIResponse;

    try {
      response = await executeProvider(primaryProvider, primaryModel, false);
      if (response.success) {
        return response;
      }
    } catch (primaryError) {
      console.error(`Primary provider (${primaryProvider}) failed:`, primaryError);
    }

    if (config.fallback_enabled && config.fallback_provider) {
      const fallbackProvider = config.fallback_provider as "openai" | "anthropic" | "deepseek";
      console.log(`Attempting fallback to ${fallbackProvider}...`);
      
      let fallbackModel = "deepseek-chat";
      if (fallbackProvider === "openai") fallbackModel = "gpt-4o-mini";
      if (fallbackProvider === "anthropic") fallbackModel = "claude-sonnet-4-20250514";

      try {
        response = await executeProvider(fallbackProvider, fallbackModel, true);
        if (response.success) {
          return response;
        }
      } catch (fallbackError) {
        console.error(`Fallback provider (${fallbackProvider}) also failed:`, fallbackError);
      }
    }

    return {
      success: false,
      error: "All AI providers failed",
      fallback_triggered: config.fallback_enabled
    };
  } catch (error) {
    console.error("AI call error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function testConnection(provider: "openai" | "anthropic" | "deepseek", apiKey: string): Promise<boolean> {
  try {
    if (provider === "openai") {
      return await openaiAdapter.testConnection(apiKey);
    } else if (provider === "anthropic") {
      return await anthropicAdapter.testConnection(apiKey);
    } else {
      return await deepseekAdapter.testConnection(apiKey);
    }
  } catch (error) {
    console.error(`Test connection failed for ${provider}:`, error);
    return false;
  }
}