import type { Database } from "@/integrations/supabase/types";

export type User = Database["public"]["Tables"]["users"]["Row"];
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];

export type ConnectedPlatform = Database["public"]["Tables"]["connected_platforms"]["Row"];
export type ConnectedPlatformInsert = Database["public"]["Tables"]["connected_platforms"]["Insert"];

export type UsageTracking = Database["public"]["Tables"]["usage_tracking"]["Row"];
export type UsageTrackingInsert = Database["public"]["Tables"]["usage_tracking"]["Insert"];
export type UsageTrackingUpdate = Database["public"]["Tables"]["usage_tracking"]["Update"];

export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
export type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
export type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];

export type Plan = Database["public"]["Tables"]["plans"]["Row"];
export type PlanInsert = Database["public"]["Tables"]["plans"]["Insert"];
export type PlanUpdate = Database["public"]["Tables"]["plans"]["Update"];

export type PlatformConfig = Database["public"]["Tables"]["platforms_config"]["Row"];
export type PlatformConfigInsert = Database["public"]["Tables"]["platforms_config"]["Insert"];
export type PlatformConfigUpdate = Database["public"]["Tables"]["platforms_config"]["Update"];

export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];
export type AnnouncementInsert = Database["public"]["Tables"]["announcements"]["Insert"];
export type AnnouncementUpdate = Database["public"]["Tables"]["announcements"]["Update"];

export type AIConfig = Database["public"]["Tables"]["ai_config"]["Row"];
export type AIConfigInsert = Database["public"]["Tables"]["ai_config"]["Insert"];
export type AIConfigUpdate = Database["public"]["Tables"]["ai_config"]["Update"];

export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type TeamMemberInsert = Database["public"]["Tables"]["team_members"]["Insert"];
export type TeamMemberUpdate = Database["public"]["Tables"]["team_members"]["Update"];

export type PlanType = "free" | "starter" | "pro" | "enterprise";
export type UserRole = "user" | "admin";
export type PlatformType = "youtube" | "instagram" | "tiktok" | "x" | "linkedin" | "facebook";
export type PlatformStatus = "live" | "coming_soon";
export type AnnouncementType = "info" | "warning" | "success";
export type AIProvider = "openai" | "anthropic";