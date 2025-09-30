# Module: Accounting – Overview & Index

This module covers core financials (GL, journals, TB, P&L, BS, CF), subledgers (AR/AP/Payroll), cash & banks, multi-currency/branch, compliance, reporting, and controls. Use this page to navigate requirements and to track development phases.

## Core
- [core_accounting_features.md](core_accounting_features.md) – GL, journal entries, trial balance, P&L, balance sheet, cash flow
- [bank_cash_management.md](bank_cash_management.md) – Bank accounts, statements, reconciliation, charges/interest
- [multi_currency_branch_support.md](multi_currency_branch_support.md) – Multi-currency accounting and multi-branch/company consolidation

## Subledgers
- [sales_receivables.md](sales_receivables.md) – Accounts receivable, invoicing, credit notes, collections
- [purchasing_payables.md](purchasing_payables.md) – Accounts payable, bills, debit notes, payments
- [payroll_integration.md](payroll_integration.md) – Payroll postings, provisions, and reconciliations

## Compliance & Reporting
- [taxation_compliance.md](taxation_compliance.md) – VAT/GST, withholding, returns, e-invoicing (where applicable)
- [reporting_dashboards.md](reporting_dashboards.md) – Standard reports, analytics, exports, and KPIs

## Controls & Automation
- [security_audit.md](security_audit.md) – RBAC, audit trails, period locks, approvals
- [automation_smart_features.md](automation_smart_features.md) – Recurring entries, auto-postings, rules, alerts
- [accounts_module_features.md](accounts_module_features.md) – Overview and summary of accounting capabilities

---

## Development Phases (EasyOps Accounting)

- Phase 1: Foundations & GL
  - CoA setup, Journal posting (manual + system), GL, TB, basic P&L/BS, period locks
  - Minimal reporting (ledger/TB exports), basic RBAC, audit trail

- Phase 2: Cash & Banks, AP/AR Basics
  - Bank & cash management (accounts, deposits, transfers, reconciliation), AP/AR posting from bills/invoices
  - Payment/receipt batches, aging reports, supplier/customer statements

- Phase 3: Integrations & Automation
  - Procurement/Inventory links (GR/IR, COGS), payroll integration, recurring journals, approval workflows
  - Scheduling, notifications, import/export templates, APIs for journals/reports

- Phase 4: Multi-Currency/Branch & Compliance
  - Multi-currency postings and revaluations; branch/company dimensions; intercompany
  - Tax engine (VAT/GST/withholding), return preparation, e-filing integrations (where supported)

- Phase 5: Advanced Reporting & Close
  - Dashboards, budget vs actual, custom report layouts; close calendar and tasks
  - Consolidation & translation, elimination entries; performance/scalability hardening

- Phase 6: Hardening & Audit Readiness
  - SoD reviews, access certification, retention/backups, DR testing
  - External auditor packages, data lineage, observability dashboards

Notes
- Cross-cutting requirements live under `requirements/cross-cutting/` and apply across modules.
- Each phase should be production-grade for its scope, with migration paths and documentation.
