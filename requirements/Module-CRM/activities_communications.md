# CRM: Activities & Communications

## Problem Statement
Plan, execute, and track all interactions with customers across channels.

## User Roles & Permissions
- All CRM users: create/view activities on owned accounts
- Managers: view team calendars; reassign tasks

## Entities & Fields
- Activity/Task
  - Type (call/email/meeting/task), Subject, Description, Start/End, Due Date
  - Owner, Priority, Status, Outcome, Next Action, Attachments
- Communication Log
  - Channel, Direction, Template, Delivery Status, Open/Click

## Core Flows
1. Schedule and assign activities; reminders and SLAs
2. Log calls/emails; auto-sync from integrations
3. Update outcomes; create follow-up tasks
4. Calendar view; team capacity planning

## Validations & Business Rules
- Overdue escalation; required outcome on completion
- Visibility by account/team; private notes

## Integrations & Events
- Email/Calendar sync (IMAP/Graph/Google), telephony (SIP/dialer)
- Events: activity.created, activity.completed, email.sent, call.logged

## Reports & KPIs
- Activities completed by type/user; SLA adherence; response times

## Edge Cases
- Timezone handling for meetings; recurring tasks exceptions
