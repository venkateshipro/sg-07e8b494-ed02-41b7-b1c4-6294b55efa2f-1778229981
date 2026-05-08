import type { NextApiRequest, NextApiResponse } from "next";
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { provider, apiKey } = req.body;

  if (!provider || !apiKey) {
    return res.status(400).json({ error: "Provider and API key are required" });
  }

  try {
    if (provider === "openai") {
      // Test OpenAI connection
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "OpenAI API request failed");
      }

      return res.status(200).json({ success: true, provider: "openai" });
    } else if (provider === "anthropic") {
      // Test Anthropic connection using official SDK
      const anthropic = new Anthropic({
        apiKey: apiKey,
      });

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{ role: "user", content: "Say hello" }],
      });

      if (!response || !response.id) {
        throw new Error("Anthropic API request failed");
      }

      return res.status(200).json({ success: true, provider: "anthropic" });
    } else if (provider === "deepseek") {
      // Test DeepSeek connection (OpenAI-compatible)
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "DeepSeek API request failed");
      }

      return res.status(200).json({ success: true, provider: "deepseek" });
    } else {
      return res.status(400).json({ error: "Invalid provider" });
    }
  } catch (error: any) {
    console.error("Test connection error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Connection test failed" 
    });
  }
}