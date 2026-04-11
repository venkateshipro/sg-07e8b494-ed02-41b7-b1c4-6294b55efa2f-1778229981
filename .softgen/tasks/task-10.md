---
title: Admin Panel - Core & User Management
status: done
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
- [x] Create /admin route with middleware: require role="admin"
- [x] Create admin overview page: KPI cards (total users, active subs, MRR, churn)
- [x] Add charts: user growth (12 months), revenue by plan, platform usage breakdown
- [x] Show last 10 signups table
- [x] Create /admin/users page with searchable/filterable user table
- [x] Add user detail side panel: view stats, change plan, suspend/reactivate, delete
- [x] Create /admin/subscriptions page with subscription table and filters