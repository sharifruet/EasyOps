# CRM: Opportunities & Pipeline

## Problem Statement
Track potential deals through customizable stages to forecast revenue and improve win rates.

## User Roles & Permissions
- Sales Rep: create/update opportunities, log activities
- Sales Manager: change stage probabilities, approve discounts
- Finance: view pricing/margins, contract terms

## Entities & Fields
- Opportunity
  - Name, Account, Contact, Amount, Currency, Expected Close Date
  - Stage, Probability, Pipeline, Owner, Source, Competitors
  - Products (SKU, qty, price, discount), Margin, Terms
- Activity/Task (shared with CRM activities)

## Core Flows
1. Create opportunity from lead/contact/account
2. Add products, pricing, discounts; attach proposal/quote
3. Advance through stages with exit criteria checks
4. Approvals for high discounts or special terms
5. Close Won/Lost; capture reason; auto handoff to Sales/Order

## Validations & Business Rules
- Stage-specific required fields; exit criteria enforcement
- Max discount thresholds per role; approval workflow
- Currency conversion to reporting currency

## Integrations & Events
- Quote/CPQ, e-signature for proposals; document templates
- Events: opportunity.created, stage.changed, opportunity.closed

## Reports & KPIs
- Pipeline by stage/rep; weighted forecast; win rate
- Cycle time, age in stage; discount impact on margin

## Edge Cases
- Multi-currency deals across branches
- Split opportunities; team selling with multiple owners
