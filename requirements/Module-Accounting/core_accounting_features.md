
# 🔹 Core Accounting Features – Full Breakdown  

## Table of Contents
- 1. Overview
- 1.1 User Roles & Permissions (summary)
- 1.2 Data Model (high-level)
- 1.3 Accounting Configurations (global)
- 2. Chart of Accounts (CoA) Management
  - 2.1 CoA Data Model (detailed)
  - 2.2 CoA Operations & Governance
- 3. Journal Entries
- 4. General Ledger (GL)
  - 4.1 Intercompany & Consolidation
- 5. Trial Balance
- 6. Profit & Loss Statement
- 7. Balance Sheet Generation
- 8. Cash Flow Statement
- 9. Double-Entry Bookkeeping System
- 10. Fiscal Year & Period Locking
- 11. Bank Reconciliation
- 12. Other Possible Core Features
- 13. Period Close & Reconciliation
- 14. Opening Balances & Migration
- 15. Multi-Currency Enhancements
- 16. Controls, Approvals, and Audit
- 17. Integrations & APIs (summary)
- 18. Reporting Enhancements
- 19. Non-Functional Requirements (see cross-cutting)
- Appendix
  - A. Worked Journal Example
  - B. Glossary (selected)
  - C. References

---

## 1. Overview
- Purpose: Define core financial accounting capabilities powering GL, subledgers, and statutory reporting.
- Out of scope: Detailed AR/AP, Fixed Assets, Payroll (covered in dedicated docs) except where they auto-post to GL.
- Cross-cutting: See `requirements/cross-cutting/` for RBAC, audit, data, and platform NFRs.

---

## 1.1 User Roles & Permissions (summary)
- Accountant: create/approve journals (as per role), reconciliations, reports
- Finance Manager/Controller: approve, period lock/unlock, adjustments
- Auditor (read-only): full audit logs, drill-down to vouchers
- Branch Accountant: scoped access to branch/warehouse/company

---

## 1.2 Data Model (high-level)
- Account (GL): code, name, type, currency, parent, active
- Journal Entry (Header): voucher no, date, period, branch, status, attachments
- Journal Line: account, debit, credit, narration, reference, currency, fx rate
- Posting Reference: source module (Sales, Purchase, Payroll, Inventory), source id
- Period/Fiscal Year: start/end, status (open/closed), lock flags
- Bank Statement Line: date, description, debit/credit, balance, match status

---

## 1.3 Accounting Configurations (global)
- Fiscal calendar: start month, period definitions (monthly/13-period), holidays
- Numbering sequences: separate sequences per voucher type, branch, fiscal year
- Default accounts: retained earnings, exchange gain/loss, rounding, suspense
- Dimensions: enablement and required rules (branch, department, cost center, project)
- Posting rules: allow backdated days, future-dated days, weekend/holiday rules
- Consolidation: multi-company setup, translation method, elimination policies

---

## 2. **Chart of Accounts (CoA) Management**
- **Account Types**
  - Assets
    - Current Assets (Cash, Bank, Receivables, Inventory)
    - Fixed Assets (Property, Plant, Equipment, Vehicles)
    - Intangible Assets (Goodwill, Patents, Trademarks)
    - Accumulated Depreciation
  - Liabilities
    - Current Liabilities (Payables, Accrued Expenses, Taxes Payable)
    - Long-Term Liabilities (Loans, Bonds Payable, Lease Obligations)
    - Provisions
  - Equity
    - Share Capital
    - Retained Earnings
    - Reserves
  - Income
    - Sales Revenue
    - Other Income
    - Discounts/Returns
  - Expenses
    - Direct Expenses (COGS, Purchases)
    - Indirect Expenses (Admin, Marketing, Depreciation, Salaries)
- **Features**
  - Account Code & Numbering (hierarchical)
  - Parent & Sub-Accounts
  - Account Groups & Categories
  - Multi-Currency Support
  - Active/Inactive Accounts
  - Account Mapping (for reporting & integrations)
  - Posting Controls (allow postings, reconciliation required, tax-linked)
  - Cash/Bank flags, Control Accounts (AR/AP/Inventory) mapping
  - Dimensions allowed (cost center, project, branch) with validation
  - Localization (IFRS/GAAP mapping), external system code mappings

### 2.1 CoA Data Model (detailed)
- Account
  - Code (unique, hierarchical), Name (localized), Description
  - Type (Asset/Liability/Equity/Income/Expense), Subtype/Group
  - Level (depth), Parent Account (nullable)
  - Normal Balance (Debit/Credit)
  - Currency (accounting or reporting currency scope)
  - Posting Allowed (Y/N), Reconciliation Required (Y/N)
  - Flags: Cash/Bank, Control Account, Tax Account, Suspense Account
  - Subledger Type (Customer, Vendor, FixedAsset, Inventory) for control accounts
  - Dimensions Allowed: Branch, Department, Cost Center, Project (booleans)
  - Opening Balance (per branch/currency), Effective From / To (versioning)
  - Status (Active/Inactive), Lock Reason
  - External Mappings: Tally/QuickBooks/Local GAAP codes
  - Notes, Attachments (chart policies)
- Constraints & Validations
  - Unique code; parent must exist and not be circular
  - Type consistency between parent and child
  - Control accounts: direct manual postings configurable (block/warn/allow)
  - Mandatory dimensions by account or type
  - Closed or inactive accounts cannot accept new postings
- Numbering Schema
  - Configurable patterns (e.g., 1xxx Assets, 2xxx Liabilities, etc.)
  - Auto-suggest next code within a group; reserved ranges

### 2.2 CoA Operations & Governance
- Templates & Import/Export
  - Seed templates by industry; CSV/Excel import with validation report
  - Bulk edit for renames, regrouping, and merge (with audit)
- Lifecycle
  - Draft → Active → Inactive (with effective dates)
  - Deactivation checks: no open items, no future-dated postings
- Controls
  - Maker-checker for new/edited accounts; approval workflow
  - Period lock interaction: structural changes restricted in closed periods
- Policies
  - Naming and coding standards; account usage guidelines
  - Mapping to statutory reporting lines (P&L/BS) and tax categories

---

## 3. **Journal Entries**
- **Types**
  - Manual Journal Entry
  - System Generated (Auto-Posted from Submodules: Sales, Purchase, Payroll, Inventory)
- **Fields**
  - Voucher No.
  - Date
  - Debit Account (GL Code, Amount)
  - Credit Account (GL Code, Amount)
  - Narration / Description
  - Reference No. (Invoice, Bill, PO, etc.)
  - Attachments (supporting docs)
- **Features**
  - Recurring Journal Entries
  - Reversing Entries
  - Draft vs Approved Entries
  - Audit Trail (who created/modified/approved)
  - Validations: balanced lines, closed-period prevention, account posting allowed

---

## 4. **General Ledger (GL)**
- **Fields**
  - Account Name & Code
  - Debit & Credit Transactions
  - Opening Balance
  - Closing Balance
  - Reference/Document Links
- **Features**
  - Account-Wise Ledger
  - Date Range Filter
  - Drill-Down to Transactions
  - Multi-Currency GL
  - Export to Excel/PDF
  - Consolidated Ledger (multi-branch)

### 4.1 Intercompany & Consolidation
- Intercompany Accounts: due-to/due-from per company with auto balancing
- Elimination Entries: configurable rules at consolidation level; period-end process
- Translation: FX translation for subsidiaries; CTA postings as per policy
- Reporting: consolidated TB, elimination reports, and intercompany mismatch report

---

## 5. **Trial Balance**
- **Fields**
  - Account Code
  - Account Name
  - Debit Balance
  - Credit Balance
  - Adjusted Balances
- **Features**
  - Unadjusted vs Adjusted Trial Balance
  - Date/Period Wise Report
  - Automatic Balancing Check
  - Export & Print

---

## 6. **Profit & Loss Statement**
- **Sections**
  - Revenue
    - Sales Income
    - Other Income
  - Cost of Goods Sold (COGS)
      1. COGS Calculation Methods
        - Fields
          - Calculation Method (FIFO, LIFO, Weighted Average, Specific Identification)
          - Product / SKU
          - Unit Cost
          - Purchase Date
          - Sale Date
        - Features
          - Auto COGS posting at time of sale
          - Multiple costing methods support
          - Product category-wise COGS
          - Switching costing methods (with adjustment entries)
      2. Direct Material Costs
        - Fields
          - Raw Material ID
          - Purchase Cost
          - Freight & Import Duties
          - Storage/Handling Costs
          - Batch / Lot Number
        - Features
          - Automatic allocation of raw material cost to finished goods
          - Integration with Inventory
          - Batch-wise costing
      3. Direct Labor Costs
        - Fields
          - Employee / Worker ID
          - Work Order / Production Batch
          - Hours Worked
          - Hourly Rate / Salary
          - Overtime Cost
        - Features
          - Labor allocation to production orders
          - Job Costing Reports
          - Payroll integration
      4. Manufacturing Overheads (if applicable)
        - Fields
          - Overhead Type (Electricity, Rent, Maintenance, Depreciation)
          - Amount
          - Allocation Basis (Machine Hours, Labor Hours, Units Produced)
        - Features
          - Automatic overhead absorption in COGS
          - Multiple allocation bases supported
          - Department / Factory-wise overhead tracking
      5. Purchase Returns & Discounts Adjustment
        - Fields
          - Purchase Return ID
          - Supplier Name
          - Returned Quantity
          - Value Adjusted
          - Discounts Received
        - Features
          - Auto adjustment in COGS
          - Link to supplier accounts
          - Debit Note linkage
      6. COGS vs Revenue Analysis
        - Fields
          - Product / Category
          - Revenue (per sale)
          - COGS (per sale)
          - Gross Margin %
        - Features
          - Real-time gross profit reports
          - Product-wise profitability analysis
          - Trend analysis over time
      7. COGS Accounting & Reporting
        - Fields
          - GL Accounts (Inventory, COGS, Purchases, Sales)
          - Journal Entries
          - Fiscal Year / Period
        - Features
          - Auto COGS posting during sales
          - Period-end inventory adjustments
          - Trial Balance & P&L integration
          - COGS Statement (Monthly/Quarterly/Yearly)
      8. Advanced Features
        - Features
          - Multi-Currency COGS Tracking
          - Multi-Warehouse Costing
          - Cost Variance Reports (Standard vs Actual Cost)
          - Forecasted COGS for Planning
          - Integration with Budget & Forecast Module
  - Gross Profit
  - Operating Expenses
    - Admin, Selling, Marketing, Finance
  - Operating Profit
  - Non-Operating Income/Expenses
  - Net Profit Before Tax
  - Tax Provision
  - Net Profit After Tax
- **Features**
  - Monthly, Quarterly, Yearly P&L
  - Branch/Department-wise P&L
  - Comparison (Budget vs Actual, This Year vs Last Year)

---

## 7. **Balance Sheet Generation**
- **Sections**
  - Assets
    - Current Assets
    - Fixed Assets
    - Intangible Assets
  - Liabilities
    - Current Liabilities
    - Long-Term Liabilities
  - Equity
    - Share Capital
    - Retained Earnings
- **Features**
  - Date Wise Balance Sheet
  - Consolidated vs Standalone
  - Comparative Balance Sheet
  - Ratio Indicators (Working Capital, Debt-Equity, Current Ratio)

---

## 8. **Cash Flow Statement**
- **Sections**
  - Operating Activities
    - Cash Receipts from Customers
    - Payments to Suppliers & Employees
    - Interest & Taxes Paid
  - Investing Activities
    - Purchase/Sale of Assets
    - Investments
  - Financing Activities
    - Loans Received/Repayment
    - Dividend Payments
- **Features**
  - Direct vs Indirect Method
  - Forecasted Cash Flow
  - Bank vs Cash Flow Reconciliation

---

## 9. **Double-Entry Bookkeeping System**
- Every Debit = Credit
- Features:
  - Real-Time Balancing
  - Error Alerts
  - Audit Log

---

## 10. **Fiscal Year & Period Locking**
- **Features**
  - Define Fiscal Year Start/End
  - Multi-Year Handling
  - Close Period (No Backdated Entry)
  - Reopen Period (with Admin Approval)
  - Auto Year-End Closing (P&L → Retained Earnings)

---

## 11. **Bank Reconciliation**
- **Fields**
  - Bank Statement Import (CSV, Excel, API)
  - Transaction Date
  - Cheque/Reference No.
  - Debit/Credit Amount
  - Balance as per Bank
  - Balance as per Books
- **Features**
  - Auto-Matching of Transactions
  - Manual Matching
  - Unreconciled Item Report
  - Bank Charges & Interest Posting
  - Multi-Bank Support

---

## 12. **Other Possible Core Features**
- **Multi-Currency Accounting**
- **Tax & VAT/GST Handling**
  - Automatic Tax Calculation
  - Tax Return Reports
- **Audit Trail & Logs**
- **Role-Based Access Control**
- **Recurring Vouchers**
- **Attachment & Document Storage**
- **Integration Points**
  - Payroll
  - Inventory
  - Sales & Purchase
  - CRM / ERP

---

## 13. Period Close & Reconciliation (additions)
- Pre-close checklist: complete postings (Sales/Purchase/Inventory/Payroll), suspense clearance
- Accruals/Provisions: month-end accrual journals with reversal next period
- Intercompany & Branch eliminations (if consolidation enabled)
- Reconciliations: bank, subledger-to-GL (AR/AP/Inventory), GR/IR clearing
- Lock & approvals: controller sign-off, period lock, auditor view-only

---

## 14. Opening Balances & Migration
- Import templates for opening TB (account, debit/credit, branch, currency)
- Subledger openings (AR/AP) with customer/vendor, invoice aging buckets
- Inventory openings with costing method and quantities by warehouse
- Audit trail of migration entries and reconciliation to legacy TB

---

## 15. Multi-Currency Enhancements
- Account currency vs transaction currency; automatic fx gain/loss postings
- Period-end revaluation by monetary accounts; revaluation reports and reversals
- Historical rate repositories and effective dating

---

## 16. Controls, Approvals, and Audit
- Maker-checker approvals for high-risk journals; configurable thresholds
- Period locks with exception workflows; backdated entry restrictions
- Immutable audit logs for all postings and master changes; exportable

---

## 17. Integrations & APIs (summary)
- Import/Export for journals, bank statements, trial balance
- Webhooks/events for journal.posted, period.closed, revaluation.completed
- API rate limits, idempotency keys, and retries for safe posting from submodules

---

## 18. Reporting Enhancements
- Variance analysis (Actual vs Budget); comparative multi-period views
- Dimensions: branch, department, project, cost center tagging on entries
- Custom report builder with saved filters and scheduled delivery

---

## 19. Non-Functional Requirements (see cross-cutting)
- Performance targets for ledger queries and report generation
- Row-level security by branch/company; field masking where applicable
- Backups, retention, and disaster recovery parameters

---

## Appendix

### A. Worked Journal Example
- Scenario: Accrue monthly rent expense of 10,000 and reverse next month
  - Date: 2025-01-31 (Period Jan-2025)
  - Lines:
    - Debit Expense: Rent (6xxx) 10,000  [Dept=Admin, Cost Center=HQ]
    - Credit Accrued Expenses (2xxx) 10,000
  - Flags: Reversing on 2025-02-01
  - Result: P&L reflects expense in Jan; liability reversed in Feb automatically

### B. Glossary (selected)
- CoA: Chart of Accounts (hierarchical structure of GL accounts)
- Control Account: GL account representing subledger totals (e.g., AR/AP)
- Revaluation: Period-end FX adjustment of monetary balances
- GR/IR: Goods Received/Invoice Received clearing account

### C. References
- See `Module-Accounting/taxation_compliance.md`
- See `Module-Accounting/sales_receivables.md` and `purchasing_payables.md`
- See `requirements/cross-cutting/security_compliance.md` and `platform_nfrs.md`
