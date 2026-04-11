---
title: Admin Panel - Platform & AI Management
status: done
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
- [x] Create /admin/platforms page with platform cards (YouTube, Instagram, TikTok, X, LinkedIn, Facebook)
- [x] Add toggle for each: Live / Coming Soon, updates platforms_config table
- [x] Create /admin/ai-config page with provider dropdown (OpenAI/Anthropic)
- [x] Add model dropdown (dynamically populated based on selected provider)
- [x] Add masked inputs for OpenAI and Anthropic API keys (store encrypted)
- [x] Add "Enable Fallback Provider" toggle with fallback provider selector
- [x] Add "Test Connection" button for each provider with success/error feedback
- [x] Save button updates ai_config table instantly