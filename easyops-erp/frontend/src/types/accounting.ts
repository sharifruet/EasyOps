// Accounting Module Types

export interface ChartOfAccount {
  id: string;
  organizationId: string;
  accountCode: string;
  accountName: string;
  parentAccountId?: string;
  accountType: AccountType;
  accountCategory?: string;
  accountSubcategory?: string;
  level: number;
  isGroup: boolean;
  isSystemAccount: boolean;
  currency: string;
  openingBalance: number;
  openingBalanceDate?: string;
  currentBalance: number;
  isActive: boolean;
  allowManualEntry: boolean;
  description?: string;
  taxType?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface CoARequest {
  organizationId: string;
  accountCode: string;
  accountName: string;
  parentAccountId?: string;
  accountType: AccountType;
  accountCategory?: string;
  accountSubcategory?: string;
  level?: number;
  isGroup?: boolean;
  currency?: string;
  openingBalance?: number;
  openingBalanceDate?: string;
  allowManualEntry?: boolean;
  description?: string;
  taxType?: string;
  tags?: string[];
}

export interface FiscalYear {
  id: string;
  organizationId: string;
  yearCode: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
}

export interface Period {
  id: string;
  organizationId: string;
  fiscalYearId: string;
  periodNumber: number;
  periodName: string;
  periodType: 'MONTHLY' | 'QUARTERLY';
  startDate: string;
  endDate: string;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
  closedAt?: string;
  closedBy?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  organizationId: string;
  journalNumber: string;
  journalDate: string;
  periodId: string;
  journalType: JournalType;
  sourceModule?: string;
  sourceDocumentId?: string;
  referenceNumber?: string;
  description: string;
  status: JournalStatus;
  totalDebit: number;
  totalCredit: number;
  postedAt?: string;
  postedBy?: string;
  reversedAt?: string;
  reversedBy?: string;
  reversalJournalId?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  lines?: JournalLine[];
}

export type JournalType = 'MANUAL' | 'SYSTEM' | 'RECURRING' | 'ADJUSTMENT';
export type JournalStatus = 'DRAFT' | 'POSTED' | 'REVERSED' | 'CANCELLED';

export interface JournalLine {
  id: string;
  journalEntryId: string;
  lineNumber: number;
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  exchangeRate: number;
  debitBase: number;
  creditBase: number;
  description?: string;
  costCenterId?: string;
  departmentId?: string;
  projectId?: string;
  tags?: Record<string, any>;
  createdAt: string;
}

export interface JournalEntryRequest {
  organizationId: string;
  journalDate: string;
  journalType?: JournalType;
  referenceNumber?: string;
  description: string;
  lines: JournalLineRequest[];
}

export interface JournalLineRequest {
  accountId: string;
  debitAmount: number;
  creditAmount: number;
  description?: string;
  departmentId?: string;
  costCenterId?: string;
  tags?: Record<string, any>;
}

export interface TrialBalance {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
}

export interface AccountBalance {
  id: string;
  organizationId: string;
  accountId: string;
  periodId: string;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  currency: string;
  lastUpdated: string;
}

