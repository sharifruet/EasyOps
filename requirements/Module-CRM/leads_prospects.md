# CRM: Leads & Prospects

## Problem Statement
Centralize lead capture from multiple channels and manage qualification to increase conversion.

## User Roles & Permissions
- Sales Rep: create/update leads, convert to contact/opportunity
- Sales Manager: assign leads, bulk actions, SLA oversight
- Marketing: import leads, campaign attribution

## Entities & Fields
- Lead
  - Name, Company, Email, Phone, Source, Campaign, Owner, Status, Score, Tags
  - Address, Industry, Size, Notes, Attachments, Consent flags
- Lead Activity
  - Type (call/email/meeting/task), Subject, Notes, Next Action, Due Date, Outcome

## Core Flows
1. Capture lead (web form, import, API, chat, manual)
2. Auto-assign by round-robin/rules; notify owner
3. Qualify with score/rules; schedule next activity
4. Convert to Account/Contact and create Opportunity
5. De-duplicate with fuzzy match; merge

## Validations & Business Rules
- Required fields per source; email/phone format
- Duplicate prevention by email/phone + name/company similarity
- Conversion allowed only for qualified statuses

## Integrations & Events
- Web-to-lead API and forms; UTM capture
- Email/SMS gateway for outreach; dialer click-to-call
- Events: lead.created, lead.assigned, lead.converted

## Reports & KPIs
- Leads by source/campaign; conversion rate; time-to-first-touch
- SLA compliance on response time; rep productivity

## Edge Cases
- Reopen disqualified leads with reason tracking
- GDPR consent management and suppression lists
