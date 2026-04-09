---
title: Email Notifications & User Settings
status: todo
priority: low
type: feature
tags: [email, resend, settings]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 14
---

## Notes
Resend integration for transactional emails. User settings page for profile, connected platforms, notifications, danger zone.

## Checklist
- [ ] Set up Resend API integration
- [ ] Create email templates: welcome, YouTube connected, plan upgrade, plan cancelled, usage warning (80%), enterprise signup alert
- [ ] Create API routes for sending emails via Resend
- [ ] Create /settings page with tabs: Profile, Connected Platforms, Notifications, Danger Zone
- [ ] Profile tab: name, email, avatar upload
- [ ] Connected Platforms tab: show YouTube as connected, others as "Coming Soon"
- [ ] Notifications tab: email notification preferences (toggle each notification type)
- [ ] Danger Zone tab: delete account with confirmation modal