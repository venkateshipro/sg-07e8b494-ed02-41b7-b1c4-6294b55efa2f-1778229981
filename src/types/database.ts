import type { Database } from "@/integrations/supabase/types";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  role: "user" | "admin";
  created_at: string;
  last_login?: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: "free" | "starter" | "pro" | "enterprise";
  price: number;
  keyword_searches_limit: number;
  seo_optimizations_limit: number;
  competitor_analysis_limit: number;
  videos_analyzed_limit: number;
  team_members_limit: number;
  priority_support: boolean;
  features: string[];
}

export interface UsageTracking {
  id: string;
  user_id: string;
  date: string;
  keyword_searches: number;
  seo_optimizations: number;
  competitor_analysis: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  active: boolean;
  created_at: string;
}

export type PlatformType = "youtube";
export type PlatformStatus = "live";

export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type ConnectedPlatform = Database["public"]["Tables"]["connected_platforms"]["Row"];
export type ConnectedPlatformInsert = Database["public"]["Tables"]["connected_platforms"]["Insert"];

export type UsageTrackingInsert = Database["public"]["Tables"]["usage_tracking"]["Insert"];
export type UsageTrackingUpdate = Database["public"]["Tables"]["usage_tracking"]["Update"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

export type PlanInsert = Database["public"]["Tables"]["plans"]["Insert"];
export type PlanUpdate = Database["public"]["Tables"]["plans"]["Update"];

export type PlatformConfig = Database["public"]["Tables"]["platforms_config"]["Row"];
export type PlatformConfigInsert = Database["public"]["Tables"]["platforms_config"]["Insert"];
export type PlatformConfigUpdate = Database["public"]["Tables"]["platforms_config"]["Update"];

export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"];
export type AnnouncementUpdate = Database["public"]["Tables"]["announcements"]["Update"];

export type AIConfig = Database["public"]["Tables"]["ai_config"]["Row"];
export type AIConfigInsert = Database["public"]["Tables"]["ai_config"]["Insert"];
export type AIConfigUpdate = Database["public"]["Tables"]["ai_config"]["Update"];

export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"];
export type TeamMemberUpdate = Database["public"]["Tables"]["team_members"]["Update"];

export type UserRole = "user" | "admin";
export type AnnouncementType = "info" | "warning" | "success";
export type AIProvider = "openai" | "anthropic";