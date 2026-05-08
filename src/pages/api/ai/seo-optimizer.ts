import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check if AI features are enabled
    const { data: config } = await supabase
      .from("ai_config")
      .select("ai_enabled, active_provider, active_model, openai_key_encrypted, anthropic_key_encrypted, deepseek_key_encrypted, fallback_enabled, fallback_provider")
      .maybeSingle();

    if (!config || !config.ai_enabled) {
      return res.status(403).json({ 
        error: "AI features are temporarily unavailable. Please check back soon.",
        code: "AI_DISABLED"
      });
    }

    const { videoTitle, videoDescription, userId } = req.body;

    if (!videoTitle || !videoDescription || !userId) {
      return res.status(400).json({ error: "Video title, description, and userId are required" });
    }

    let optimizedData: { title: string; description: string; tags: string[] } | null = null;
    let provider = config.active_provider;
    let model = config.active_model;
    let fallbackTriggered = false;
    let success = false;

    // Try primary provider
    try {
      if (provider === "openai") {
        if (!config.openai_key_encrypted) throw new Error("OpenAI API key not configured");
        optimizedData = await optimizeSEOOpenAI(videoTitle, videoDescription, model, config.openai_key_encrypted);
      } else if (provider === "anthropic") {
        if (!config.anthropic_key_encrypted) throw new Error("Anthropic API key not configured");
        optimizedData = await optimizeSEOAnthropic(videoTitle, videoDescription, model, config.anthropic_key_encrypted);
      } else if (provider === "deepseek") {
        if (!config.deepseek_key_encrypted) throw new Error("DeepSeek API key not configured");
        optimizedData = await optimizeSEODeepSeek(videoTitle, videoDescription, model, config.deepseek_key_encrypted);
      }
      success = true;
    } catch (primaryError: any) {
      console.error(`Primary provider (${provider}) failed:`, primaryError);

      // Try fallback if enabled
      if (config.fallback_enabled && config.fallback_provider) {
        fallbackTriggered = true;
        provider = config.fallback_provider;
        console.log(`Falling back to ${provider}`);

        try {
          if (provider === "openai") {
            if (!config.openai_key_encrypted) throw new Error("OpenAI API key not configured");
            optimizedData = await optimizeSEOOpenAI(videoTitle, videoDescription, "gpt-4o-mini", config.openai_key_encrypted);
            model = "gpt-4o-mini";
          } else if (provider === "anthropic") {
            if (!config.anthropic_key_encrypted) throw new Error("Anthropic API key not configured");
            optimizedData = await optimizeSEOAnthropic(videoTitle, videoDescription, "claude-sonnet-4-20250514", config.anthropic_key_encrypted);
            model = "claude-sonnet-4-20250514";
          } else if (provider === "deepseek") {
            if (!config.deepseek_key_encrypted) throw new Error("DeepSeek API key not configured");
            optimizedData = await optimizeSEODeepSeek(videoTitle, videoDescription, "deepseek-chat", config.deepseek_key_encrypted);
            model = "deepseek-chat";
          }
          success = true;
        } catch (fallbackError: any) {
          console.error(`Fallback provider (${provider}) also failed:`, fallbackError);
          throw new Error("All AI providers failed");
        }
      } else {
        throw primaryError;
      }
    }

    // Log usage
    await supabase.from("ai_usage_logs").insert({
      user_id: userId,
      provider,
      model,
      feature: "seo",
      tokens_used: 0,
      success,
      fallback_triggered: fallbackTriggered,
    });

    return res.status(200).json({ 
      ...optimizedData,
      provider,
      fallbackTriggered 
    });
  } catch (error: any) {
    console.error("SEO optimizer error:", error);
    return res.status(500).json({ 
      error: error.message || "Failed to optimize SEO" 
    });
  }
}

async function optimizeSEOOpenAI(title: string, description: string, model: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { 
          role: "user", 
          content: `You are a YouTube SEO expert. Optimize this video:

Original Title: ${title}
Original Description: ${description}

Provide:
1. An optimized title (60 chars max)
2. An optimized description (150-200 chars)
3. 10 relevant tags

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."]
}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API request failed");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return { title, description, tags: [] };
  }
}

async function optimizeSEOAnthropic(title: string, description: string, model: string, apiKey: string) {
  const anthropic = new Anthropic({ apiKey });

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1000,
    messages: [
      { 
        role: "user", 
        content: `You are a YouTube SEO expert. Optimize this video:

Original Title: ${title}
Original Description: ${description}

Provide:
1. An optimized title (60 chars max)
2. An optimized description (150-200 chars)
3. 10 relevant tags

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."]
}`
      }
    ],
  });

  const content = response.content[0].text;
  
  try {
    return JSON.parse(content);
  } catch {
    return { title, description, tags: [] };
  }
}

async function optimizeSEODeepSeek(title: string, description: string, model: string, apiKey: string) {
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { 
          role: "user", 
          content: `You are a YouTube SEO expert. Optimize this video:

Original Title: ${title}
Original Description: ${description}

Provide:
1. An optimized title (60 chars max)
2. An optimized description (150-200 chars)
3. 10 relevant tags

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."]
}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "DeepSeek API request failed");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    return { title, description, tags: [] };
  }
}