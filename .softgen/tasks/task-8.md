---
title: Subscription & Billing System
status: done
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
- [x] Create billing page with current plan display
- [x] Show all 4 plan cards with feature comparison table
- [x] Create API route: Razorpay checkout for plan upgrade
- [x] Create API route: Razorpay webhook handler for subscription events
- [x] Handle plan upgrade/downgrade flow
- [x] Show cancel subscription option with confirmation modal
- [x] Display invoice history table from Razorpay
- [x] Enforce plan limits across all features server-side
- [x] Auto-reset daily usage counters at midnight