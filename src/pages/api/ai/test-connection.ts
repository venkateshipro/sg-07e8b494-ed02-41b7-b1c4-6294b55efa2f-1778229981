import type { NextApiRequest, NextApiResponse } from "next";

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
      // Test Anthropic connection
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-20240307",
          messages: [{ role: "user", content: "Test" }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Anthropic API request failed");
      }

      return res.status(200).json({ success: true, provider: "anthropic" });
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