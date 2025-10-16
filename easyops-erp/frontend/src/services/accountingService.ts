import api from './api';
import {
  ChartOfAccount,
  CoARequest,
  JournalEntry,
  JournalEntryRequest,
  JournalLine,
  TrialBalance,
  Period,
  FiscalYear
} from '../types/accounting';

const accountingService = {
  // Chart of Accounts APIs
  async getAccounts(organizationId: string): Promise<ChartOfAccount[]> {
    const response = await api.get(`/api/accounting/coa/organization/${organizationId}`);
    return response.data;
  },

  async getActiveAccounts(organizationId: string): Promise<ChartOfAccount[]> {
    const response = await api.get(`/api/accounting/coa/organization/${organizationId}/active`);
    return response.data;
  },

  async getPostingAccounts(organizationId: string): Promise<ChartOfAccount[]> {
    const response = await api.get(`/api/accounting/coa/organization/${organizationId}/posting`);
    return response.data;
  },

  async getAccountsByType(organizationId: string, accountType: string): Promise<ChartOfAccount[]> {
    const response = await api.get(`/api/accounting/coa/organization/${organizationId}/type/${accountType}`);
    return response.data;
  },

  async getAccount(accountId: string): Promise<ChartOfAccount> {
    const response = await api.get(`/api/accounting/coa/${accountId}`);
    return response.data;
  },

  async createAccount(data: CoARequest): Promise<ChartOfAccount> {
    const response = await api.post('/api/accounting/coa', data);
    return response.data;
  },

  async updateAccount(accountId: string, data: CoARequest): Promise<ChartOfAccount> {
    const response = await api.put(`/api/accounting/coa/${accountId}`, data);
    return response.data;
  },

  async deactivateAccount(accountId: string, organizationId: string): Promise<void> {
    await api.delete(`/api/accounting/coa/${accountId}?organizationId=${organizationId}`);
  },

  // Journal Entry APIs
  async getJournalEntries(organizationId: string, page = 0, size = 20): Promise<any> {
    const response = await api.get(`/api/accounting/journals/organization/${organizationId}`, {
      params: { page, size }
    });
    return response.data;
  },

  async getJournalEntry(journalId: string): Promise<JournalEntry> {
    const response = await api.get(`/api/accounting/journals/${journalId}`);
    return response.data;
  },

  async getJournalLines(journalId: string): Promise<JournalLine[]> {
    const response = await api.get(`/api/accounting/journals/${journalId}/lines`);
    return response.data;
  },

  async createJournalEntry(data: JournalEntryRequest): Promise<JournalEntry> {
    const response = await api.post('/api/accounting/journals', data);
    return response.data;
  },

  async postJournalEntry(journalId: string): Promise<JournalEntry> {
    const response = await api.post(`/api/accounting/journals/${journalId}/post`);
    return response.data;
  },

  async reverseJournalEntry(journalId: string): Promise<JournalEntry> {
    const response = await api.post(`/api/accounting/journals/${journalId}/reverse`);
    return response.data;
  },

  // Reports APIs
  async getTrialBalance(organizationId: string, periodId: string): Promise<TrialBalance[]> {
    const response = await api.get('/api/accounting/reports/trial-balance', {
      params: { organizationId, periodId }
    });
    return response.data;
  },

  // Fiscal Year & Period APIs
  async getFiscalYears(organizationId: string): Promise<FiscalYear[]> {
    const response = await api.get(`/api/accounting/fiscal-years/organization/${organizationId}`);
    return response.data;
  },

  async getOpenFiscalYears(organizationId: string): Promise<FiscalYear[]> {
    const response = await api.get(`/api/accounting/fiscal-years/organization/${organizationId}/open`);
    return response.data;
  },

  async getPeriods(organizationId: string): Promise<Period[]> {
    const response = await api.get(`/api/accounting/fiscal-years/organization/${organizationId}/periods`);
    return response.data;
  },

  async getOpenPeriods(organizationId: string): Promise<Period[]> {
    const response = await api.get(`/api/accounting/fiscal-years/organization/${organizationId}/periods/open`);
    return response.data;
  },

  async setupCurrentFiscalYear(organizationId: string): Promise<FiscalYear> {
    const response = await api.post(`/api/accounting/fiscal-years/organization/${organizationId}/setup-current-year`);
    return response.data;
  },

  // Bank Service APIs
  async getBankAccounts(organizationId: string): Promise<any[]> {
    const response = await api.get('/api/bank/accounts', {
      params: { organizationId, activeOnly: true }
    });
    return response.data;
  },

  async getBankTransactions(accountId: string, startDate?: string, endDate?: string): Promise<any[]> {
    const params: any = { accountId };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await api.get('/api/bank/transactions', { params });
    return response.data;
  },

  async getUnreconciledTransactions(accountId: string): Promise<any[]> {
    const response = await api.get('/api/bank/transactions/unreconciled', {
      params: { accountId }
    });
    return response.data;
  },

  async createReconciliation(data: any): Promise<any> {
    const response = await api.post('/api/bank/reconciliations', data);
    return response.data;
  },

  // AR Service APIs
  async getARAgingReport(organizationId: string, asOfDate?: string): Promise<any[]> {
    const params: any = { organizationId };
    if (asOfDate) params.asOfDate = asOfDate;
    
    const response = await api.get('/api/ar/aging', { params });
    return response.data;
  },

  async getARInvoices(organizationId: string, status?: string): Promise<any[]> {
    const params: any = { organizationId };
    if (status) params.status = status;
    
    const response = await api.get('/api/ar/invoices', { params });
    return response.data;
  },

  async getOutstandingInvoices(organizationId: string): Promise<any[]> {
    const response = await api.get('/api/ar/invoices/outstanding', {
      params: { organizationId }
    });
    return response.data;
  },

  // AP Service APIs
  async getAPBills(organizationId: string, status?: string): Promise<any[]> {
    const params: any = { organizationId };
    if (status) params.status = status;
    
    const response = await api.get('/api/ap/bills', { params });
    return response.data;
  },

  async getOutstandingBills(organizationId: string): Promise<any[]> {
    const response = await api.get('/api/ap/bills/outstanding', {
      params: { organizationId }
    });
    return response.data;
  },
};

export default accountingService;

