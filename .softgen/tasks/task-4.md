---
title: User Dashboard & Platform Management
status: todo
priority: high
type: feature
tags: [dashboard, youtube, stats]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 4
---

## Notes
Main user dashboard with YouTube analytics, recent videos, usage meters, announcement banners. Platform selector shows YouTube active, others as "Coming Soon".

## Checklist
- [ ] Create dashboard page with platform tabs
- [ ] Fetch YouTube channel stats via YouTube Data API v3
- [ ] Display stats cards: Subscribers, Views, Videos, Est Monthly Views
- [ ] Show recent 10 videos table with thumbnails, views, likes
- [ ] Show top performing video this month
- [ ] Display usage meters: keyword searches, SEO optimizations used vs limit
- [ ] Show active announcement banner if admin published one
- [ ] Create PlatformSelector component with "Coming Soon" badges