---
title: Admin Panel - Core & User Management
status: todo
priority: medium
type: feature
tags: [admin, management]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 10
---

## Notes
Admin panel overview dashboard with KPIs, user management table with search/filter, ability to change plans, suspend accounts. Role-based access control (admin only).

## Checklist
- [ ] Create /admin route with middleware: require role="admin"
- [ ] Create admin overview page: KPI cards (total users, active subs, MRR, churn)
- [ ] Add charts: user growth (12 months), revenue by plan, platform usage breakdown
- [ ] Show last 10 signups table
- [ ] Create /admin/users page with searchable/filterable user table
- [ ] Add user detail side panel: view stats, change plan, suspend/reactivate, delete
- [ ] Create /admin/subscriptions page with subscription table and filters