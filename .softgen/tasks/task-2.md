---
title: Design System & Core Layout
status: in_progress
priority: urgent
type: feature
tags: [frontend, design, components]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 2
---

## Notes
Implement FaGrow's dark-mode-first design system with deep purple primary, bright green accent. Create reusable layout components for dashboard and admin panel with sidebar navigation.

## Checklist
- [x] Update globals.css with FaGrow color tokens (purple/green theme)
- [x] Configure Inter font in tailwind.config.ts
- [ ] Create DashboardLayout component with collapsible sidebar
- [ ] Create AdminLayout component with admin-specific sidebar
- [ ] Create Sidebar component with platform selector, navigation items, user profile footer
- [ ] Create PlatformBadge component for "Coming Soon" pills
- [ ] Create StatsCard component for metrics display
- [ ] Create UsageMeter component for plan limit tracking
- [ ] Create PlanCard component for subscription tiers