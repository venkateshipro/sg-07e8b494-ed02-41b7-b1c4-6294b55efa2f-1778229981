import Anthropic from "@anthropic-ai/sdk";
import type { AIRequest, AIResponse } from "./index";

const SYSTEM_PROMPTS = {
  keyword_analysis: `You are a YouTube SEO expert. Analyze the given keyword and return related keywords, competition level, and keyword score. Return JSON only in this format: {"relatedKeywords": ["keyword1", "keyword2"], "competition": "low|medium|high", "score": 0-100}`,
  seo_optimization: `You are a YouTube SEO optimizer. Given a video's current title, description, and tags, suggest optimized versions. Return JSON only in this format: {"title": "optimized title", "description": "optimized description", "tags": ["tag1", "tag2"]}`,
  competitor_insights: `You are a YouTube growth analyst. Analyze the competitor channel data and provide insights. Return JSON only in this format: {"insights": ["insight1", "insight2"], "recommendations": ["rec1", "rec2"]}`,
};

export const anthropicAdapter = {
  async call(request: AIRequest, model: string, apiKey: string): Promise<AIResponse> {
    try {
      const anthropic = new Anthropic({ apiKey });

      const message = await anthropic.messages.create({
        model: model || "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          { role: "user", content: request.input },
        ],
        system: SYSTEM_PROMPTS[request.type],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        return { success: false, error: "Unexpected response type from Anthropic" };
      }

      const data = JSON.parse(content.text);
      return {
        success: true,
        data,
        provider: "anthropic",
        model,
      };
    } catch (error) {
      console.error("Anthropic adapter error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Anthropic request failed",
      };
    }
  },

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const anthropic = new Anthropic({ apiKey });
      await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 10,
        messages: [{ role: "user", content: "Test" }],
      });
      return true;
    } catch (error) {
      console.error("Anthropic connection test failed:", error);
      return false;
    }
  },
};