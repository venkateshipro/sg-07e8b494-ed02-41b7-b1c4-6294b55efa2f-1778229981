---
title: AI Provider Abstraction Layer
status: todo
priority: high
type: feature
tags: [ai, openai, anthropic]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 9
---

## Notes
Unified AI service layer supporting OpenAI (gpt-4o-mini default) and Anthropic Claude. Admin can switch providers/models from admin panel without code changes. Auto-fallback on failure.

## Checklist
- [ ] Create /lib/ai/index.ts: unified AI caller, reads active provider from ai_config table
- [ ] Create /lib/ai/openai.ts: OpenAI adapter (gpt-4o-mini, gpt-4o, gpt-3.5-turbo)
- [ ] Create /lib/ai/anthropic.ts: Anthropic adapter (claude-sonnet-4, claude-haiku, claude-opus)
- [ ] Implement fallback logic: if primary fails, auto-switch to fallback provider
- [ ] Return unified response format for all providers
- [ ] Encrypt API keys before storing in ai_config table
- [ ] Create test connection function for each provider