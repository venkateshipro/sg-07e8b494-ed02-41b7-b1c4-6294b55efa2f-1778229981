import { supabase } from "@/integrations/supabase/client";
import type { User, UserInsert, UserUpdate } from "@/types/database";

export const userService = {
  async getById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user by id:", error);
      return null;
    }

    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user:", error);
      return null;
    }

    return data;
  },

  async updateUser(userId: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return null;
    }

    return data;
  },

  async updateLastLogin(userId: string): Promise<void> {
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userId);
  },

  async isAdmin(userId: string): Promise<boolean> {
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId)
      .single();

    return data?.role === "admin";
  },

  async getUserPlan(userId: string): Promise<string> {
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", userId)
      .single();

    return data?.plan || "free";
  },
};