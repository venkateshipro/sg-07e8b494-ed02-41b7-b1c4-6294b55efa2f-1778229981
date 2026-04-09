import { supabase } from "@/integrations/supabase/client";
import type { PlatformConfig, ConnectedPlatform, ConnectedPlatformInsert } from "@/types/database";

export const platformService = {
  async getAllPlatforms(): Promise<PlatformConfig[]> {
    const { data, error } = await supabase
      .from("platforms_config")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching platforms:", error);
      return [];
    }

    return data || [];
  },

  async getUserConnectedPlatforms(userId: string): Promise<ConnectedPlatform[]> {
    const { data, error } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching connected platforms:", error);
      return [];
    }

    return data || [];
  },

  async connectPlatform(platformData: ConnectedPlatformInsert): Promise<ConnectedPlatform | null> {
    const { data, error } = await supabase
      .from("connected_platforms")
      .upsert(platformData, { onConflict: "user_id,platform" })
      .select()
      .single();

    if (error) {
      console.error("Error connecting platform:", error);
      return null;
    }

    return data;
  },

  async disconnectPlatform(userId: string, platform: string): Promise<boolean> {
    const { error } = await supabase
      .from("connected_platforms")
      .delete()
      .eq("user_id", userId)
      .eq("platform", platform);

    if (error) {
      console.error("Error disconnecting platform:", error);
      return false;
    }

    return true;
  },

  async getYouTubeConnection(userId: string): Promise<ConnectedPlatform | null> {
    const { data, error } = await supabase
      .from("connected_platforms")
      .select("*")
      .eq("user_id", userId)
      .eq("platform", "youtube")
      .single();

    if (error) {
      console.error("Error fetching YouTube connection:", error);
      return null;
    }

    return data;
  },
};