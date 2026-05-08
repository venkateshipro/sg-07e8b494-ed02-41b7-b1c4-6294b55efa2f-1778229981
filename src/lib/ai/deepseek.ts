// DeepSeek AI Adapter (OpenAI-compatible)

interface DeepSeekMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface DeepSeekResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callDeepSeek(
  prompt: string,
  model: string = "deepseek-chat",
  apiKey: string
): Promise<string> {
  try {
    const messages: DeepSeekMessage[] = [
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "DeepSeek API request failed");
    }

    const data: DeepSeekResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from DeepSeek");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek API error:", error);
    throw error;
  }
}

export async function generateKeywordSuggestions(
  keyword: string,
  apiKey: string,
  model: string = "deepseek-chat"
): Promise<string[]> {
  const prompt = `Generate 10 related YouTube keyword suggestions for: "${keyword}". 
Return only the keywords, one per line, without numbering or extra text.`;

  const response = await callDeepSeek(prompt, model, apiKey);
  return response.split("\n").filter((k) => k.trim().length > 0);
}

export async function optimizeSEO(
  videoTitle: string,
  videoDescription: string,
  apiKey: string,
  model: string = "deepseek-chat"
): Promise<{
  title: string;
  description: string;
  tags: string[];
}> {
  const prompt = `You are a YouTube SEO expert. Optimize this video:

Original Title: ${videoTitle}
Original Description: ${videoDescription}

Provide:
1. An optimized title (60 chars max)
2. An optimized description (150-200 chars)
3. 10 relevant tags

Format your response as JSON:
{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."]
}`;

  const response = await callDeepSeek(prompt, model, apiKey);
  
  try {
    const parsed = JSON.parse(response);
    return {
      title: parsed.title || videoTitle,
      description: parsed.description || videoDescription,
      tags: parsed.tags || [],
    };
  } catch {
    return {
      title: videoTitle,
      description: videoDescription,
      tags: [],
    };
  }
}

export async function analyzeCompetitor(
  channelName: string,
  apiKey: string,
  model: string = "deepseek-chat"
): Promise<string> {
  const prompt = `Analyze this YouTube channel as a competitor: "${channelName}". 
Provide insights on:
1. Content strategy
2. Common video topics
3. Engagement tactics
4. Growth opportunities

Keep the analysis concise (200-300 words).`;

  return callDeepSeek(prompt, model, apiKey);
}