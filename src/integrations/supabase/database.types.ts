/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_config: {
        Row: {
          active_model: string
          active_provider: string
          ai_enabled: boolean | null
          anthropic_key_encrypted: string | null
          deepseek_key_encrypted: string | null
          fallback_enabled: boolean | null
          fallback_provider: string | null
          id: string
          openai_key_encrypted: string | null
          updated_at: string | null
        }
        Insert: {
          active_model?: string
          active_provider?: string
          ai_enabled?: boolean | null
          anthropic_key_encrypted?: string | null
          deepseek_key_encrypted?: string | null
          fallback_enabled?: boolean | null
          fallback_provider?: string | null
          id?: string
          openai_key_encrypted?: string | null
          updated_at?: string | null
        }
        Update: {
          active_model?: string
          active_provider?: string
          ai_enabled?: boolean | null
          anthropic_key_encrypted?: string | null
          deepseek_key_encrypted?: string | null
          fallback_enabled?: boolean | null
          fallback_provider?: string | null
          id?: string
          openai_key_encrypted?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          message: string
          title: string
          type: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          message: string
          title: string
          type?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          message?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      connected_platforms: {
        Row: {
          access_token: string | null
          channel_avatar: string | null
          channel_id: string | null
          channel_name: string | null
          connected_at: string | null
          id: string
          platform: string
          refresh_token: string | null
          token_expiry: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          channel_avatar?: string | null
          channel_id?: string | null
          channel_name?: string | null
          connected_at?: string | null
          id?: string
          platform: string
          refresh_token?: string | null
          token_expiry?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          channel_avatar?: string | null
          channel_id?: string | null
          channel_name?: string | null
          connected_at?: string | null
          id?: string
          platform?: string
          refresh_token?: string | null
          token_expiry?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_platforms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          competitor_analysis_limit: number
          created_at: string | null
          id: string
          keyword_searches_limit: number
          name: string
          platforms_limit: number
          price: number
          priority_support: boolean | null
          seo_optimizations_limit: number
          slug: string
          team_members_limit: number
        }
        Insert: {
          competitor_analysis_limit?: number
          created_at?: string | null
          id?: string
          keyword_searches_limit?: number
          name: string
          platforms_limit?: number
          price?: number
          priority_support?: boolean | null
          seo_optimizations_limit?: number
          slug: string
          team_members_limit?: number
        }
        Update: {
          competitor_analysis_limit?: number
          created_at?: string | null
          id?: string
          keyword_searches_limit?: number
          name?: string
          platforms_limit?: number
          price?: number
          priority_support?: boolean | null
          seo_optimizations_limit?: number
          slug?: string
          team_members_limit?: number
        }
        Relationships: []
      }
      platforms_config: {
        Row: {
          created_at: string | null
          display_order: number | null
          icon_url: string | null
          id: string
          launch_date: string | null
          platform_name: string
          slug: string
          status: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          launch_date?: string | null
          platform_name: string
          slug: string
          status?: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          icon_url?: string | null
          id?: string
          launch_date?: string | null
          platform_name?: string
          slug?: string
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          razorpay_subscription_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan: string
          razorpay_subscription_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          razorpay_subscription_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          accepted_at: string | null
          id: string
          invited_at: string | null
          member_user_id: string
          owner_user_id: string
          role: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          member_user_id: string
          owner_user_id: string
          role?: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          invited_at?: string | null
          member_user_id?: string
          owner_user_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_member_user_id_fkey"
            columns: ["member_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          competitor_analysis: number | null
          date: string
          id: string
          keyword_searches: number | null
          seo_optimizations: number | null
          user_id: string
        }
        Insert: {
          competitor_analysis?: number | null
          date?: string
          id?: string
          keyword_searches?: number | null
          seo_optimizations?: number | null
          user_id: string
        }
        Update: {
          competitor_analysis?: number | null
          date?: string
          id?: string
          keyword_searches?: number | null
          seo_optimizations?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string | null
          plan: string
          plan_expiry: string | null
          role: string
          status: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          last_login?: string | null
          name?: string | null
          plan?: string
          plan_expiry?: string | null
          role?: string
          status?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string | null
          plan?: string
          plan_expiry?: string | null
          role?: string
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
