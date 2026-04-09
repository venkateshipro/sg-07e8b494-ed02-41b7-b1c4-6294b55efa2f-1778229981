import { supabase } from "@/integrations/supabase/client";
import type { UsageTracking, UsageTrackingInsert, UsageTrackingUpdate } from "@/types/database";

export const usageService = {
  async getTodayUsage(userId: string): Promise<UsageTracking | null> {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching usage:", error);
      return null;
    }

    return data || null;
  },

  async incrementUsage(
    userId: string,
    type: "keyword_searches" | "seo_optimizations" | "competitor_analysis"
  ): Promise<UsageTracking | null> {
    const today = new Date().toISOString().split("T")[0];
    const currentUsage = await this.getTodayUsage(userId);

    if (currentUsage) {
      const update: UsageTrackingUpdate = {
        [type]: (currentUsage[type] || 0) + 1,
      };

      const { data, error } = await supabase
        .from("usage_tracking")
        .update(update)
        .eq("id", currentUsage.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating usage:", error);
        return null;
      }

      return data;
    } else {
      const insert: UsageTrackingInsert = {
        user_id: userId,
        date: today,
        [type]: 1,
      };

      const { data, error } = await supabase
        .from("usage_tracking")
        .insert(insert)
        .select()
        .single();

      if (error) {
        console.error("Error creating usage:", error);
        return null;
      }

      return data;
    }
  },

  async canUseFeature(
    userId: string,
    type: "keyword_searches" | "seo_optimizations" | "competitor_analysis",
    limit: number
  ): Promise<boolean> {
    if (limit === -1) return true; // Unlimited

    const usage = await this.getTodayUsage(userId);
    const used = usage?.[type] || 0;

    return used < limit;
  },
};