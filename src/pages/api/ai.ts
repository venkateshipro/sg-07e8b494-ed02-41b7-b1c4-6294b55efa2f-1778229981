import type { NextApiRequest, NextApiResponse } from "next";
import { callAI, type AIRequest } from "@/lib/ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, input, userId } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // 0. Check Master AI Toggle
    const { data: config } = await supabaseAdmin
      .from("ai_config")
      .select("ai_enabled")
      .single();

    if (config && config.ai_enabled === false) {
      return res.status(403).json({ 
        error: "AI features are temporarily unavailable. Please check back soon.",
        code: "AI_DISABLED"
      });
    }

    // 1. Get user plan
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("plan")
      .eq("id", userId)
      .single();

    const planSlug = user?.plan || "free";

    // 2. Get plan limits
    const { data: plan } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("slug", planSlug)
      .single();

    if (!plan) {
      return res.status(400).json({ error: "Plan not found" });
    }

    // 3. Check limits based on type
    const today = new Date().toISOString().split("T")[0];
    const { data: usage } = await supabaseAdmin
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    let limit = 0;
    let used = 0;
    let column: "keyword_searches" | "seo_optimizations" | "competitor_analysis";

    if (type === "keyword_analysis") {
      limit = plan.keyword_searches_limit;
      used = usage?.keyword_searches || 0;
      column = "keyword_searches";
    } else if (type === "seo_optimization") {
      limit = plan.seo_optimizations_limit;
      used = usage?.seo_optimizations || 0;
      column = "seo_optimizations";
    } else if (type === "competitor_insights") {
      limit = plan.competitor_analysis_limit;
      used = usage?.competitor_analysis || 0;
      column = "competitor_analysis";
    } else {
      return res.status(400).json({ error: "Invalid request type" });
    }

    if (limit !== -1 && used >= limit) {
      return res.status(403).json({ error: `Daily limit reached for ${type}` });
    }

    // 4. Call AI
    const aiRequest: AIRequest = { type, input };
    const result = await callAI(aiRequest);

    // 5. Log usage to ai_usage_logs table
    const featureName = type === "keyword_analysis" ? "keyword" : type === "seo_optimization" ? "seo" : "competitor";
    await supabaseAdmin.from("ai_usage_logs").insert([{
      user_id: userId,
      provider: result.provider || "unknown",
      model: result.model || "unknown",
      feature: featureName,
      tokens_used: 0,
      success: result.success,
      fallback_triggered: result.fallback_triggered || false
    }]);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // 6. Increment plan usage limits
    if (usage) {
      const updateData = column === "keyword_searches" 
        ? { keyword_searches: used + 1 }
        : column === "seo_optimizations"
        ? { seo_optimizations: used + 1 }
        : { competitor_analysis: used + 1 };

      await supabaseAdmin
        .from("usage_tracking")
        .update(updateData)
        .eq("id", usage.id);
    } else {
      const newUsage = {
        user_id: userId,
        date: today,
        keyword_searches: column === "keyword_searches" ? 1 : 0,
        seo_optimizations: column === "seo_optimizations" ? 1 : 0,
        competitor_analysis: column === "competitor_analysis" ? 1 : 0,
      };
      await supabaseAdmin.from("usage_tracking").insert([newUsage]);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}