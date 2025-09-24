# CRM: Service & Support

## Problem Statement
Provide post-sales support through case management and knowledge base to improve CSAT.

## User Roles & Permissions
- Agent: create/update cases; use knowledge base
- Supervisor: assign cases; manage SLAs; approvals

## Entities & Fields
- Case/Ticket
  - Subject, Description, Priority, Severity, Status, SLA Plan
  - Account/Contact, Product, Serial/Asset, Channel, Attachments
- Knowledge Article
  - Title, Content, Category, Version, Visibility, Related Cases

## Core Flows
1. Case intake (email, phone, portal, chat); auto-categorize and prioritize
2. Assignment and SLA tracking; internal/external comments
3. Escalations, approvals, and problem/bug linkage
4. Resolution and CSAT survey; closure with root-cause

## Validations & Business Rules
- SLA timers; required fields by severity; entitlement checks

## Integrations & Events
- Email-to-case; chat; bug tracker; RMA with Inventory
- Events: case.created, case.updated, case.closed

## Reports & KPIs
- First response/resolution time, backlog, CSAT, reopen rate

## Edge Cases
- Major incident handling; multi-party communications
