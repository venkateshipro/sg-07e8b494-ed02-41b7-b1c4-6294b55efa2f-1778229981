import { supabase } from "@/integrations/supabase/client";
import type { Announcement } from "@/types/database";

export const announcementService = {
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching announcements:", error);
      return [];
    }

    return (data || []) as Announcement[];
  },

  async getAllAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all announcements:", error);
      return [];
    }

    return (data || []) as Announcement[];
  },

  async createAnnouncement(
    title: string,
    message: string,
    type: "info" | "warning" | "success"
  ): Promise<Announcement | null> {
    const { data, error } = await supabase
      .from("announcements")
      .insert([{ title, message, type, active: true }])
      .select()
      .single();

    if (error) {
      console.error("Error creating announcement:", error);
      return null;
    }

    return data as Announcement;
  },

  async toggleActive(id: string, active: boolean): Promise<boolean> {
    const { error } = await supabase
      .from("announcements")
      .update({ active })
      .eq("id", id);

    if (error) {
      console.error("Error toggling announcement:", error);
      return false;
    }

    return true;
  },

  async deleteAnnouncement(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting announcement:", error);
      return false;
    }

    return true;
  },
};