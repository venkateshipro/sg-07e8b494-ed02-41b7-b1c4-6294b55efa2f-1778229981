---
title: Design System & Core Layout
status: done
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
- [x] Create DashboardLayout component with collapsible sidebar
- [x] Create AdminLayout component with admin-specific sidebar
- [x] Create Sidebar component with platform selector, navigation items, user profile footer
- [x] Create PlatformBadge component for "Coming Soon" pills
- [x] Create StatsCard component for metrics display
- [x] Create UsageMeter component for plan limit tracking
- [x] Create PlanCard component for subscription tiers