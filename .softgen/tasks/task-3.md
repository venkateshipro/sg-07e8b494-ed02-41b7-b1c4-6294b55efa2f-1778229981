---
title: Authentication & Onboarding Flow
status: todo
priority: high
type: feature
tags: [auth, onboarding, supabase]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 3
---

## Notes
Implement Supabase Auth with Google OAuth + email/password. Multi-step onboarding: welcome, platform selection, YouTube OAuth, plan selection.

## Checklist
- [ ] Create auth service with Supabase Auth SDK
- [ ] Build login page with Google OAuth + email/password
- [ ] Build signup page with email/password
- [ ] Create 4-step onboarding flow: Welcome → Platform → YouTube OAuth → Plan Selection
- [ ] Store user profile in users table on signup
- [ ] Create protected route middleware for /dashboard
- [ ] Create admin route middleware for /admin
- [ ] Handle YouTube OAuth callback and token storage