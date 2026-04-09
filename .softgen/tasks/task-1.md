---
title: Database Schema & RLS Setup
status: done
priority: urgent
type: feature
tags: [backend, database, supabase]
created_by: agent
created_at: 2026-04-09T08:25:38Z
position: 1
---

## Notes
Set up complete Supabase PostgreSQL schema for FaGrow with all tables and Row Level Security policies. Admin users bypass all RLS, regular users access only their own data.

## Checklist
- [x] Create users table with role, plan, expiry tracking
- [x] Create connected_platforms table for OAuth tokens
- [x] Create usage_tracking table for daily limits
- [x] Create subscriptions table for Razorpay integration
- [x] Create plans table with feature limits
- [x] Create platforms_config table for platform management
- [x] Create announcements table for admin broadcasts
- [x] Create ai_config table for provider configuration
- [x] Create team_members table for Enterprise collaboration
- [x] Apply RLS policies: users own their data, admins bypass all
- [x] Create indexes for performance
- [x] Seed initial data: plans, platforms_config, default ai_config