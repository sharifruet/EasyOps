# CRM: Accounts & Contacts

## Problem Statement
Maintain a clean master of organizations (accounts) and people (contacts) for 360° customer view.

## User Roles & Permissions
- Sales/Support: create/update contacts; link to accounts
- Manager: merge duplicates; manage ownership and territories

## Entities & Fields
- Account
  - Name, Type (Customer/Prospect/Partner/Vendor), Industry, Size, Tax IDs
  - Billing/Shipping addresses, Payment Terms, Currency, Branch/Region
- Contact
  - Name, Title, Email, Phone, Preferred Channel, Consent
  - Account link, Role, Department, Notes

## Core Flows
1. Create account/contact manually or via import/API
2. Territory assignment by rules (region, industry, size)
3. Merge duplicates with audit trail
4. Lifecycle status (prospect → active → inactive) with reasons

## Validations & Business Rules
- Unique constraints (tax ID per region; email per contact)
- Territory reassignment when region changes

## Integrations & Events
- Sync with ERP customers/vendors; email/calendar sync
- Events: account.created, contact.created, merged, status.changed

## Reports & KPIs
- Account growth by region; contact engagement; data quality score

## Edge Cases
- Multi-branch accounts with multiple shipping addresses
- Contact working across multiple accounts (consultants)
