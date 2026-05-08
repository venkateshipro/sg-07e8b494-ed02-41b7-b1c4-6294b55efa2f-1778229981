-- Seed YouTube platform
INSERT INTO platforms_config (platform_name, slug, status, display_order) 
VALUES ('YouTube', 'youtube', 'live', 1)
ON CONFLICT (platform_name) DO UPDATE 
SET status = 'live', slug = 'youtube', display_order = 1;

-- Add DeepSeek support to ai_config
ALTER TABLE ai_config 
ADD COLUMN IF NOT EXISTS deepseek_key_encrypted text,
ADD COLUMN IF NOT EXISTS ai_enabled boolean DEFAULT true;

-- Update provider constraints
ALTER TABLE ai_config 
DROP CONSTRAINT IF EXISTS ai_config_active_provider_check;

ALTER TABLE ai_config 
ADD CONSTRAINT ai_config_active_provider_check 
CHECK (active_provider IN ('openai', 'anthropic', 'deepseek'));

ALTER TABLE ai_config 
DROP CONSTRAINT IF EXISTS ai_config_fallback_provider_check;

ALTER TABLE ai_config 
ADD CONSTRAINT ai_config_fallback_provider_check 
CHECK (fallback_provider IN ('openai', 'anthropic', 'deepseek'));