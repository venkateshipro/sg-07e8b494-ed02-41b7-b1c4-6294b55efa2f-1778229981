---
title: AI Provider Abstraction Layer
status: done
priority: high
type: feature
tags: [ai, backend, openai, anthropic]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 9
---

## Notes
Build abstracted AI provider system supporting OpenAI and Anthropic Claude. Admin can switch providers from admin panel without code changes. Auto-fallback to secondary provider if primary fails. Unified response format across providers.

## Checklist
- [x] Create /lib/ai/index.ts unified AI caller
- [x] Create /lib/ai/openai.ts adapter (gpt-4o-mini, gpt-4o, gpt-3.5-turbo)
- [x] Create /lib/ai/anthropic.ts adapter (claude-sonnet-4, claude-haiku, claude-opus)
- [x] Implement provider routing based on ai_config table
- [x] Implement auto-fallback when primary provider fails
- [x] Unified response format for keyword analysis, SEO optimization, competitor insights
- [x] Create encryption utility for storing AI keys
- [x] Create test connection function for each provider