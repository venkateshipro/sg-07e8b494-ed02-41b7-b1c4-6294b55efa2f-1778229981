---
title: Keyword Explorer Tool
status: todo
priority: high
type: feature
tags: [youtube, keywords, ai]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 5
---

## Notes
Keyword research tool: search input, AI-powered keyword scoring, competition analysis, top ranking videos. Enforce daily plan limits server-side.

## Checklist
- [ ] Create keyword-explorer page with search input
- [ ] Create API route: fetch related keywords via YouTube Data API
- [ ] Integrate AI layer for keyword scoring and competition analysis
- [ ] Display results: keyword list, competition badge (Low/Medium/High), score /100
- [ ] Show top 5 ranking videos per keyword: title, views, channel
- [ ] Enforce daily limit via usage_tracking table
- [ ] Show upgrade prompt when limit reached (Free/Starter users)
- [ ] Track usage in database on every search