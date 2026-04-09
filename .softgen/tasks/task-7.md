---
title: Competitor Analysis Tool
status: done
priority: high
type: feature
tags: [youtube, analytics, ai]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 7
---

## Notes
Build competitor analysis tool. Input competitor channel URL/handle, fetch metrics, display comparison table vs logged-in user's channel. Pro + Enterprise only — show upgrade modal to Free/Starter.

## Checklist
- [x] Create /competitor-analysis page with DashboardLayout
- [x] Add PlatformSelector (YouTube active only)
- [x] Create competitor URL/handle input
- [x] Call AI layer for competitor insights
- [x] Display competitor stats: subscribers, total videos, recent 5 videos, top tags, avg views
- [x] Create comparison table vs user's own channel
- [x] Display insights and recommendations based on competitor analysis
- [x] Display usage badge showing analyses used vs limit
- [x] Gating: only Pro + Enterprise: show upgrade modal to Free/Starter
- [x] Track usage in usage_tracking table