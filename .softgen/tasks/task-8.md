---
title: Subscription & Billing System
status: todo
priority: high
type: feature
tags: [billing, razorpay, subscriptions]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 8
---

## Notes
Razorpay integration for subscription billing. 4 plans: Free, Starter ($9), Pro ($29), Enterprise ($99). Plan management, usage tracking, invoice history.

## Checklist
- [ ] Create billing page with current plan display
- [ ] Show all 4 plan cards with feature comparison table
- [ ] Create API route: Razorpay checkout for plan upgrade
- [ ] Create API route: Razorpay webhook handler for subscription events
- [ ] Handle plan upgrade/downgrade flow
- [ ] Show cancel subscription option with confirmation modal
- [ ] Display invoice history table from Razorpay
- [ ] Enforce plan limits across all features server-side
- [ ] Auto-reset daily usage counters at midnight