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
};

export default accountingService;

