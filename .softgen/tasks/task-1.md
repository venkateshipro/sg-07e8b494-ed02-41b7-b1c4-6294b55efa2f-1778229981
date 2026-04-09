---
title: Database Schema & RLS Setup
status: in_progress
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
- [ ] Create users table with role, plan, expiry tracking
- [ ] Create connected_platforms table for OAuth tokens
- [ ] Create usage_tracking table for daily limits
- [ ] Create subscriptions table for Razorpay integration
- [ ] Create plans table with feature limits
- [ ] Create platforms_config table for platform management
- [ ] Create announcements table for admin broadcasts
- [ ] Create ai_config table for provider configuration
- [ ] Create team_members table for Enterprise collaboration
- [ ] Apply RLS policies: users own their data, admins bypass all
- [ ] Create indexes for performance
- [ ] Seed initial data: plans, platforms_config, default ai_config