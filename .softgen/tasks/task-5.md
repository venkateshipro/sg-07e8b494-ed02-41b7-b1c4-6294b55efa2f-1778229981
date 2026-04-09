---
title: Keyword Explorer Tool
status: done
priority: high
type: feature
tags: [youtube, seo, ai]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 5
---

## Notes
Build YouTube keyword research tool with AI-powered analysis. Shows related keywords, competition level, keyword score /100, and top 5 ranking videos. Enforces daily limits server-side per plan.

## Checklist
- [x] Create /keyword-explorer page with DashboardLayout
- [x] Add PlatformSelector (YouTube active only)
- [x] Create keyword search input with search button
- [x] Display usage badge showing searches used vs plan limit
- [x] Call AI layer for keyword analysis
- [x] Display results: related keywords list with badges
- [x] Display competition badge (Low/Medium/High) with color coding
- [x] Display keyword score /100 with progress bar
- [x] Display top 5 ranking videos (title, views, channel)
- [x] Show upgrade prompt when limit reached (Free/Starter users)
- [x] Track usage in database on every search