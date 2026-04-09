---
title: SEO Optimizer Tool
status: done
priority: high
type: feature
tags: [youtube, seo, ai]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 6
---

## Notes
Build AI-powered SEO optimizer for YouTube videos. Select video from channel, AI suggests improved title/description/tags. Copy buttons for each field. Pro + Enterprise only — show upgrade modal to Free/Starter.

## Checklist
- [x] Create /seo-optimizer page with DashboardLayout
- [x] Add PlatformSelector (YouTube active only)
- [x] Create video selector dropdown (mock videos for now)
- [x] Display current title, description, tags
- [x] "Optimize with AI" button calling AI layer
- [x] Side-by-side comparison: original vs optimized
- [x] Copy buttons for each optimized field (title, description, tags)
- [x] Display usage badge showing optimizations used vs limit
- [x] Gating: only Pro + Enterprise: show upgrade modal to Free/Starter
- [x] Track usage in usage_tracking table