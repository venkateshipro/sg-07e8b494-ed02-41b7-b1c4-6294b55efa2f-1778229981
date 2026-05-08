import type { AIRequest, AIResponse } from "./index";

const SYSTEM_PROMPTS = {
  keyword_analysis: `You are a YouTube SEO expert. Analyze the given keyword and return related keywords, competition level (low/medium/high), and keyword score (0-100). Return JSON only.`,
  seo_optimization: `You are a YouTube SEO optimizer. Given a video's current title, description, and tags, suggest optimized versions that will improve discoverability and ranking. Return JSON only.`,
  competitor_insights: `You are a YouTube growth analyst. Analyze the competitor channel data and provide actionable insights for channel growth. Return JSON only.`,
};

export const deepseekAdapter = {
  async call(request: AIRequest, model: string, apiKey: string): Promise<AIResponse> {
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "deepseek-chat",
          messages: [
            { role: "system", content: SYSTEM_PROMPTS[request.type] },
            { role: "user", content: request.input },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "DeepSeek API request failed");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        return { success: false, error: "No response from DeepSeek" };
      }

      let parsedData;
      try {
        parsedData = JSON.parse(content);
      } catch (e) {
        // Deepseek sometimes wraps JSON in markdown blocks
        const match = content.match(/```json\n([\s\S]*)\n```/);
        if (match) {
          parsedData = JSON.parse(match[1]);
        } else {
          throw e;
        }
      }

      return {
        success: true,
        data: parsedData,
        provider: "deepseek",
        model,
      };
    } catch (error) {
      console.error("DeepSeek adapter error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "DeepSeek request failed",
      };
    }
  },

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 5,
        }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};