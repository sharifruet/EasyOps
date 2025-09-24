# CRM: Campaigns & Marketing

## Problem Statement
Run targeted campaigns and attribute leads and revenue to marketing efforts.

## User Roles & Permissions
- Marketing: create campaigns, segments, templates
- Sales: view campaign leads, follow-up tasks

## Entities & Fields
- Campaign
  - Name, Type, Budget, Start/End, Target Segment, Channels, Owner
  - Goals (leads, MQLs, revenue), UTM parameters, Assets
- Segment
  - Criteria builder (attributes, behavior, lists)

## Core Flows
1. Define campaign with goals and budget
2. Build audience segment and send communications
3. Capture responses and attribute leads/opportunities
4. Analyze ROI and optimize

## Validations & Business Rules
- Consent checks; frequency capping; unsubscribe links

## Integrations & Events
- Email/SMS providers; landing pages/forms; ad platforms tagging
- Events: campaign.created, message.sent, conversion.recorded

## Reports & KPIs
- Cost per lead, MQL rate, pipeline and revenue attribution

## Edge Cases
- Multi-language assets; time-window throttling
