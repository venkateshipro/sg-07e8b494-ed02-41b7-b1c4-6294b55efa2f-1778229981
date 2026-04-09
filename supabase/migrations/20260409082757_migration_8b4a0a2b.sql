-- Drop existing profiles table since we'll use a custom users table
DROP TABLE IF EXISTS profiles CASCADE;

-- Create users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  plan_expiry TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connected_platforms table for OAuth tokens
CREATE TABLE connected_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram', 'tiktok', 'x', 'linkedin', 'facebook')),
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE,
  channel_id TEXT,
  channel_name TEXT,
  channel_avatar TEXT,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Create usage_tracking table for daily limits
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  keyword_searches INTEGER DEFAULT 0,
  seo_optimizations INTEGER DEFAULT 0,
  competitor_analysis INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

-- Create subscriptions table for Razorpay integration
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending')),
  razorpay_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create plans table with feature limits
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  keyword_searches_limit INTEGER NOT NULL DEFAULT 0,
  seo_optimizations_limit INTEGER NOT NULL DEFAULT 0,
  competitor_analysis_limit INTEGER NOT NULL DEFAULT 0,
  team_members_limit INTEGER NOT NULL DEFAULT 1,
  platforms_limit INTEGER NOT NULL DEFAULT 1,
  priority_support BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platforms_config table for platform management
CREATE TABLE platforms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (status IN ('live', 'coming_soon')),
  launch_date DATE,
  icon_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create announcements table for admin broadcasts
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success')),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_config table for provider configuration
CREATE TABLE ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_provider TEXT NOT NULL DEFAULT 'openai' CHECK (active_provider IN ('openai', 'anthropic')),
  active_model TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  fallback_enabled BOOLEAN DEFAULT FALSE,
  fallback_provider TEXT CHECK (fallback_provider IN ('openai', 'anthropic')),
  openai_key_encrypted TEXT,
  anthropic_key_encrypted TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table for Enterprise collaboration
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_user_id, member_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_connected_platforms_user_id ON connected_platforms(user_id);
CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, date);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_team_members_owner ON team_members(owner_user_id);
CREATE INDEX idx_team_members_member ON team_members(member_user_id);
CREATE INDEX idx_announcements_active ON announcements(active) WHERE active = TRUE;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admin bypass function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table policies
CREATE POLICY "users_select_own_or_admin" ON users FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own_or_admin" ON users FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "users_delete_admin_only" ON users FOR DELETE USING (is_admin());

-- Connected platforms policies
CREATE POLICY "platforms_select_own_or_admin" ON connected_platforms FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "platforms_insert_own" ON connected_platforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "platforms_update_own_or_admin" ON connected_platforms FOR UPDATE USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "platforms_delete_own_or_admin" ON connected_platforms FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- Usage tracking policies
CREATE POLICY "usage_select_own_or_admin" ON usage_tracking FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "usage_insert_own" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_update_own_or_admin" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Subscriptions policies
CREATE POLICY "subscriptions_select_own_or_admin" ON subscriptions FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "subscriptions_insert_own" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own_or_admin" ON subscriptions FOR UPDATE USING (auth.uid() = user_id OR is_admin());

-- Plans policies (public read, admin write)
CREATE POLICY "plans_select_all" ON plans FOR SELECT USING (true);
CREATE POLICY "plans_insert_admin" ON plans FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "plans_update_admin" ON plans FOR UPDATE USING (is_admin());
CREATE POLICY "plans_delete_admin" ON plans FOR DELETE USING (is_admin());

-- Platforms config policies (public read, admin write)
CREATE POLICY "platforms_config_select_all" ON platforms_config FOR SELECT USING (true);
CREATE POLICY "platforms_config_insert_admin" ON platforms_config FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "platforms_config_update_admin" ON platforms_config FOR UPDATE USING (is_admin());
CREATE POLICY "platforms_config_delete_admin" ON platforms_config FOR DELETE USING (is_admin());

-- Announcements policies (public read active, admin full)
CREATE POLICY "announcements_select_active_or_admin" ON announcements FOR SELECT USING (active = true OR is_admin());
CREATE POLICY "announcements_insert_admin" ON announcements FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "announcements_update_admin" ON announcements FOR UPDATE USING (is_admin());
CREATE POLICY "announcements_delete_admin" ON announcements FOR DELETE USING (is_admin());

-- AI config policies (admin only)
CREATE POLICY "ai_config_select_admin" ON ai_config FOR SELECT USING (is_admin());
CREATE POLICY "ai_config_insert_admin" ON ai_config FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "ai_config_update_admin" ON ai_config FOR UPDATE USING (is_admin());
CREATE POLICY "ai_config_delete_admin" ON ai_config FOR DELETE USING (is_admin());

-- Team members policies
CREATE POLICY "team_select_own_or_admin" ON team_members FOR SELECT USING (auth.uid() = owner_user_id OR auth.uid() = member_user_id OR is_admin());
CREATE POLICY "team_insert_owner" ON team_members FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "team_update_owner_or_admin" ON team_members FOR UPDATE USING (auth.uid() = owner_user_id OR is_admin());
CREATE POLICY "team_delete_owner_or_admin" ON team_members FOR DELETE USING (auth.uid() = owner_user_id OR is_admin());

-- Seed initial plans data
INSERT INTO plans (name, slug, price, keyword_searches_limit, seo_optimizations_limit, competitor_analysis_limit, team_members_limit, platforms_limit, priority_support) VALUES
('Free', 'free', 0, 5, 0, 0, 1, 1, false),
('Starter', 'starter', 9, 20, 0, 0, 1, 1, false),
('Pro', 'pro', 29, -1, -1, -1, 1, 1, false),
('Enterprise', 'enterprise', 99, -1, -1, -1, 10, 6, true);

-- Seed platforms_config data
INSERT INTO platforms_config (platform_name, slug, status, display_order, icon_url) VALUES
('YouTube', 'youtube', 'live', 1, 'https://cdn.simpleicons.org/youtube'),
('Instagram', 'instagram', 'coming_soon', 2, 'https://cdn.simpleicons.org/instagram'),
('TikTok', 'tiktok', 'coming_soon', 3, 'https://cdn.simpleicons.org/tiktok'),
('X', 'x', 'coming_soon', 4, 'https://cdn.simpleicons.org/x'),
('LinkedIn', 'linkedin', 'coming_soon', 5, 'https://cdn.simpleicons.org/linkedin'),
('Facebook', 'facebook', 'coming_soon', 6, 'https://cdn.simpleicons.org/facebook');

-- Seed default AI config
INSERT INTO ai_config (active_provider, active_model, fallback_enabled) VALUES
('openai', 'gpt-4o-mini', false);

-- Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();