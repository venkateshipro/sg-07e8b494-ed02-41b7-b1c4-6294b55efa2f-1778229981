---
title: Admin Panel - Platform & AI Management
status: todo
priority: medium
type: feature
tags: [admin, platforms, ai]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 11
---

## Notes
Admin can toggle platforms live/coming_soon, configure AI provider/model, manage API keys, enable fallback. Changes reflect instantly across all users without code deploy.

## Checklist
- [ ] Create /admin/platforms page with platform cards (YouTube, Instagram, TikTok, X, LinkedIn, Facebook)
- [ ] Add toggle for each: Live / Coming Soon, updates platforms_config table
- [ ] Create /admin/ai-config page with provider dropdown (OpenAI/Anthropic)
- [ ] Add model dropdown (dynamically populated based on selected provider)
- [ ] Add masked inputs for OpenAI and Anthropic API keys (store encrypted)
- [ ] Add "Enable Fallback Provider" toggle with fallback provider selector
- [ ] Add "Test Connection" button for each provider with success/error feedback
- [ ] Save button updates ai_config table instantly