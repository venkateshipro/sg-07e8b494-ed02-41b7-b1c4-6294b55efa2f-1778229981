import OpenAI from "openai";
import type { AIRequest, AIResponse } from "./index";

const SYSTEM_PROMPTS = {
  keyword_analysis: `You are a YouTube SEO expert. Analyze the given keyword and return related keywords, competition level, and keyword score. Return JSON only.`,
  seo_optimization: `You are a YouTube SEO optimizer. Given a video's current title, description, and tags, suggest optimized versions that will improve discoverability and ranking. Return JSON only.`,
  competitor_insights: `You are a YouTube growth analyst. Analyze the competitor channel data and provide actionable insights for channel growth. Return JSON only.`,
};

export const openaiAdapter = {
  async call(request: AIRequest, model: string, apiKey: string): Promise<AIResponse> {
    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      const completion = await openai.chat.completions.create({
        model: model || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[request.type] },
          { role: "user", content: request.input },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        return { success: false, error: "No response from OpenAI" };
      }

      const data = JSON.parse(content);
      return {
        success: true,
        data,
        provider: "openai",
        model,
      };
    } catch (error) {
      console.error("OpenAI adapter error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "OpenAI request failed",
      };
    }
  },

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      console.error("OpenAI connection test failed:", error);
      return false;
    }
  },
};