-- FaGrow Complete Database Migration
-- Single script for fresh Supabase deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Connected platforms table
CREATE TABLE IF NOT EXISTS connected_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('youtube')),
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  channel_id TEXT,
  channel_name TEXT,
  channel_avatar TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  keyword_searches INTEGER DEFAULT 0,
  seo_optimizations INTEGER DEFAULT 0,
  competitor_analysis INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  razorpay_subscription_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE CHECK (slug IN ('free', 'starter', 'pro', 'enterprise')),
  price INTEGER NOT NULL DEFAULT 0,
  keyword_searches_limit INTEGER NOT NULL DEFAULT 5,
  seo_optimizations_limit INTEGER NOT NULL DEFAULT 0,
  competitor_analysis_limit INTEGER NOT NULL DEFAULT 0,
  platforms_limit INTEGER NOT NULL DEFAULT 1,
  team_members_limit INTEGER NOT NULL DEFAULT 1,
  priority_support BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platforms config table
CREATE TABLE IF NOT EXISTS platforms_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'live' CHECK (status IN ('live', 'coming_soon')),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success')),
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI config table
CREATE TABLE IF NOT EXISTS ai_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ai_enabled BOOLEAN DEFAULT true,
  active_provider TEXT DEFAULT 'openai' CHECK (active_provider IN ('openai', 'anthropic', 'deepseek')),
  active_model TEXT DEFAULT 'gpt-4o-mini',
  fallback_enabled BOOLEAN DEFAULT false,
  fallback_provider TEXT CHECK (fallback_provider IN ('openai', 'anthropic', 'deepseek')),
  openai_key_encrypted TEXT,
  anthropic_key_encrypted TEXT,
  deepseek_key_encrypted TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI usage logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  provider TEXT,
  model TEXT,
  feature TEXT,
  tokens_used INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  fallback_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, member_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_connected_platforms_user_id ON connected_platforms(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_platform ON connected_platforms(platform);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_date ON usage_tracking(date);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(active);

CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature ON ai_usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_provider ON ai_usage_logs(provider);

CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_id ON team_members(member_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Users table RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all users"
  ON users FOR UPDATE
  USING (is_admin());

-- Connected platforms RLS
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own platforms"
  ON connected_platforms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own platforms"
  ON connected_platforms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
  ON connected_platforms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
  ON connected_platforms FOR DELETE
  USING (auth.uid() = user_id);

-- Usage tracking RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all usage"
  ON usage_tracking FOR SELECT
  USING (is_admin());

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all subscriptions"
  ON subscriptions FOR UPDATE
  USING (is_admin());

-- Plans RLS (public read)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view plans"
  ON plans FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage plans"
  ON plans FOR ALL
  USING (is_admin());

-- Platforms config RLS (public read)
ALTER TABLE platforms_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platforms"
  ON platforms_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage platforms"
  ON platforms_config FOR ALL
  USING (is_admin());

-- Announcements RLS (public read)
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements"
  ON announcements FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can view all announcements"
  ON announcements FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  USING (is_admin());

-- AI config RLS (admin only)
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view AI config"
  ON ai_config FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage AI config"
  ON ai_config FOR ALL
  USING (is_admin());

-- AI usage logs RLS
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage"
  ON ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs"
  ON ai_usage_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all AI usage"
  ON ai_usage_logs FOR SELECT
  USING (is_admin());

-- Team members RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team owners can view their teams"
  ON team_members FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = member_id);

CREATE POLICY "Team owners can manage their teams"
  ON team_members FOR ALL
  USING (auth.uid() = owner_id);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert plans
INSERT INTO plans (name, slug, price, keyword_searches_limit, seo_optimizations_limit, competitor_analysis_limit, platforms_limit, team_members_limit, priority_support)
VALUES
  ('Free', 'free', 0, 5, 0, 0, 1, 1, false),
  ('Starter', 'starter', 9, -1, 20, 5, 1, 1, false),
  ('Pro', 'pro', 29, -1, -1, -1, 1, 3, false),
  ('Enterprise', 'enterprise', 99, -1, -1, -1, 1, 10, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert platform config
INSERT INTO platforms_config (platform_name, slug, status, display_order)
VALUES ('YouTube', 'youtube', 'live', 1)
ON CONFLICT (slug) DO NOTHING;

-- Insert default AI config
INSERT INTO ai_config (ai_enabled, active_provider, active_model, fallback_enabled)
VALUES (true, 'openai', 'gpt-4o-mini', false)
ON CONFLICT DO NOTHING;