import { supabase } from "@/integrations/supabase/client";
import type { Plan } from "@/types/database";

export const planService = {
  async getAllPlans(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return [];
    }

    return data || [];
  },

  async getPlanBySlug(slug: string): Promise<Plan | null> {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error("Error fetching plan:", error);
      return null;
    }

    return data;
  },

  async getUserPlanLimits(userId: string): Promise<Plan | null> {
    const { data: user } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .single();

    if (!user) return null;

    return this.getPlanBySlug(user.plan);
  },

  isUnlimited(limit: number): boolean {
    return limit === -1;
  },

  canUseFeature(used: number, limit: number): boolean {
    if (this.isUnlimited(limit)) return true;
    return used < limit;
  },
};