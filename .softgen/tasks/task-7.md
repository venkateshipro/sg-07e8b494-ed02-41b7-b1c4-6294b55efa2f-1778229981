---
title: Competitor Analysis Tool
status: todo
priority: high
type: feature
tags: [youtube, competitor, analytics]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 7
---

## Notes
Analyze competitor YouTube channels: input URL/handle, fetch stats, recent videos, most used tags, avg views. Compare with user's own channel. Pro + Enterprise only.

## Checklist
- [ ] Create competitor-analysis page with URL/handle input
- [ ] Create API route: fetch competitor channel data via YouTube Data API
- [ ] Display: name, subscribers, total videos, recent 5 videos, most used tags, avg views
- [ ] Fetch user's own channel stats for comparison
- [ ] Show comparison table: user vs competitor metrics
- [ ] Restrict to Pro + Enterprise: show upgrade modal to Free/Starter
- [ ] Track usage in usage_tracking table