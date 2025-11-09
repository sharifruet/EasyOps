import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountTree as TreeIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import accountingService from '../../services/accountingService';
import { ChartOfAccount, CoARequest, AccountType } from '../../types/accounting';

type StandardCoATemplateEntry = {
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  accountCategory: string;
  accountSubcategory?: string;
  level: number;
  isGroup: boolean;
  description?: string;
  isSystemAccount?: boolean;
};

const STANDARD_COA_TEMPLATE: StandardCoATemplateEntry[] = [
  { accountCode: '1000', accountName: 'Cash and Bank Accounts', accountType: 'ASSET', accountCategory: 'Current Assets', level: 1, isGroup: true, description: 'Group for all cash and bank accounts', isSystemAccount: true },
  { accountCode: '1010', accountName: 'Cash on Hand', accountType: 'ASSET', accountCategory: 'Current Assets', level: 2, isGroup: false, description: 'Physical cash', isSystemAccount: true },
  { accountCode: '1020', accountName: 'Petty Cash', accountType: 'ASSET', accountCategory: 'Current Assets', level: 2, isGroup: false, description: 'Petty cash fund', isSystemAccount: true },
  { accountCode: '1030', accountName: 'Bank - Operating Account', accountType: 'ASSET', accountCategory: 'Current Assets', level: 2, isGroup: false, description: 'Main operating bank account', isSystemAccount: true },
  { accountCode: '1040', accountName: 'Bank - Savings Account', accountType: 'ASSET', accountCategory: 'Current Assets', level: 2, isGroup: false, description: 'Savings account', isSystemAccount: true },
  { accountCode: '1100', accountName: 'Accounts Receivable', accountType: 'ASSET', accountCategory: 'Current Assets', level: 1, isGroup: true, description: 'Group for accounts receivable', isSystemAccount: true },
  { accountCode: '1110', accountName: 'Trade Debtors', accountType: 'ASSET', accountCategory: 'Current Assets', level: 2, isGroup: false, description: 'Money owed by customers', isSystemAccount: true },
  { accountCode: '1200', accountName: 'Inventory', accountType: 'ASSET', accountCategory: 'Current Assets', level: 1, isGroup: true, description: 'Group for inventory accounts', isSystemAccount: true },
  { accountCode: '1210', accountName: 'Raw Materials', accountType: 'ASSET', accountCategory: 'Current Assets', level: 2, isGroup: false, description: 'Raw materials inventory', isSystemAccount: true },
  { accountCode: '1500', accountName: 'Fixed Assets', accountType: 'ASSET', accountCategory: 'Fixed Assets', level: 1, isGroup: true, description: 'Group for fixed assets', isSystemAccount: true },
  { accountCode: '1510', accountName: 'Land and Buildings', accountType: 'ASSET', accountCategory: 'Fixed Assets', level: 2, isGroup: false, description: 'Land and buildings', isSystemAccount: true },
  { accountCode: '2000', accountName: 'Current Liabilities', accountType: 'LIABILITY', accountCategory: 'Current Liabilities', level: 1, isGroup: true, description: 'Group for current liabilities', isSystemAccount: true },
  { accountCode: '2010', accountName: 'Accounts Payable', accountType: 'LIABILITY', accountCategory: 'Current Liabilities', level: 2, isGroup: false, description: 'Trade creditors', isSystemAccount: true },
  { accountCode: '2500', accountName: 'Long-term Liabilities', accountType: 'LIABILITY', accountCategory: 'Long-term Liabilities', level: 1, isGroup: true, description: 'Group for long-term liabilities', isSystemAccount: true },
  { accountCode: '2510', accountName: 'Long-term Loans', accountType: 'LIABILITY', accountCategory: 'Long-term Liabilities', level: 2, isGroup: false, description: 'Long-term loans', isSystemAccount: true },
  { accountCode: '3000', accountName: 'Equity', accountType: 'EQUITY', accountCategory: "Owner's Equity", level: 1, isGroup: true, description: 'Group for equity accounts', isSystemAccount: true },
  { accountCode: '3010', accountName: 'Capital', accountType: 'EQUITY', accountCategory: "Owner's Equity", level: 2, isGroup: false, description: "Owner's capital", isSystemAccount: true },
  { accountCode: '4000', accountName: 'Revenue', accountType: 'REVENUE', accountCategory: 'Operating Revenue', level: 1, isGroup: true, description: 'Group for revenue accounts', isSystemAccount: true },
  { accountCode: '4010', accountName: 'Sales Revenue', accountType: 'REVENUE', accountCategory: 'Operating Revenue', level: 2, isGroup: false, description: 'Sales revenue', isSystemAccount: true },
  { accountCode: '5000', accountName: 'Cost of Goods Sold', accountType: 'EXPENSE', accountCategory: 'Cost of Sales', level: 1, isGroup: true, description: 'Group for COGS accounts', isSystemAccount: true },
  { accountCode: '5010', accountName: 'Materials Cost', accountType: 'EXPENSE', accountCategory: 'Cost of Sales', level: 2, isGroup: false, description: 'Materials cost', isSystemAccount: true },
  { accountCode: '6000', accountName: 'Operating Expenses', accountType: 'EXPENSE', accountCategory: 'Operating Expenses', level: 1, isGroup: true, description: 'Group for operating expenses', isSystemAccount: true },
  { accountCode: '6010', accountName: 'Salaries and Wages', accountType: 'EXPENSE', accountCategory: 'Operating Expenses', level: 2, isGroup: false, description: 'Salaries and wages', isSystemAccount: true },
  { accountCode: '6070', accountName: 'Marketing and Advertising', accountType: 'EXPENSE', accountCategory: 'Operating Expenses', level: 2, isGroup: false, description: 'Marketing and advertising', isSystemAccount: true },
];

const ChartOfAccounts: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  
  const organizationId = currentOrganizationId || '';

  const [formData, setFormData] = useState<CoARequest>({
    organizationId: organizationId,
    accountCode: '',
    accountName: '',
    accountType: 'ASSET',
    level: 1,
    isGroup: false,
    currency: 'USD',
    openingBalance: 0,
    allowManualEntry: true,
  });

  useEffect(() => {
    if (organizationId) {
      loadAccounts();
    }
  }, [organizationId]);

  const buildFallbackAccounts = useMemo(() => {
    return (orgId: string): ChartOfAccount[] => {
      const timestamp = new Date().toISOString();
      return STANDARD_COA_TEMPLATE.map((template) => ({
        id: `${orgId || 'org'}-${template.accountCode}`,
        organizationId: orgId,
        accountCode: template.accountCode,
        accountName: template.accountName,
        parentAccountId: undefined,
        accountType: template.accountType,
        accountCategory: template.accountCategory,
        accountSubcategory: template.accountSubcategory,
        level: template.level,
        isGroup: template.isGroup,
        isSystemAccount: template.isSystemAccount ?? true,
        currency: 'USD',
        openingBalance: 0,
        openingBalanceDate: undefined,
        currentBalance: 0,
        isActive: true,
        allowManualEntry: !template.isGroup,
        description: template.description,
        taxType: undefined,
        tags: [],
        createdAt: timestamp,
        updatedAt: timestamp,
        createdBy: undefined,
        updatedBy: undefined,
      }));
    };
  }, []);

  const normalizeAccount = (raw: any, orgId: string): ChartOfAccount => {
    const parseNumber = (value: any) => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    };

    const code = raw?.accountCode || raw?.code || raw?.acctCode || '';
    const identifier = raw?.id || (code ? `${orgId || 'org'}-${code}` : `${orgId || 'org'}-${Math.random().toString(36).slice(2)}`);

    return {
      id: identifier,
      organizationId: raw?.organizationId || orgId,
      accountCode: code,
      accountName: raw?.accountName || raw?.name || 'Unnamed Account',
      parentAccountId: raw?.parentAccountId || undefined,
      accountType: (raw?.accountType || 'ASSET') as AccountType,
      accountCategory: raw?.accountCategory || '',
      accountSubcategory: raw?.accountSubcategory,
      level: typeof raw?.level === 'number' ? raw.level : Number(raw?.level ?? 1),
      isGroup: Boolean(raw?.isGroup),
      isSystemAccount: raw?.isSystemAccount ?? false,
      currency: raw?.currency || 'USD',
      openingBalance: parseNumber(raw?.openingBalance),
      openingBalanceDate: raw?.openingBalanceDate,
      currentBalance: parseNumber(raw?.currentBalance),
      isActive: raw?.isActive ?? true,
      allowManualEntry: raw?.allowManualEntry ?? !raw?.isGroup,
      description: raw?.description,
      taxType: raw?.taxType,
      tags: raw?.tags || [],
      createdAt: raw?.createdAt || new Date().toISOString(),
      updatedAt: raw?.updatedAt || new Date().toISOString(),
      createdBy: raw?.createdBy,
      updatedBy: raw?.updatedBy,
    };
  };

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getAccounts(organizationId);
      const hasMeaningfulData = Array.isArray(data) && data.some((item) => item && Object.keys(item).length > 0);

      if (!hasMeaningfulData) {
        console.warn('[ChartOfAccounts] API returned empty payload; using standard template.');
        setAccounts(buildFallbackAccounts(organizationId));
        return;
      }

      const normalized = data.map((item) => normalizeAccount(item, organizationId));
      setAccounts(normalized);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (account?: ChartOfAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        organizationId: account.organizationId,
        accountCode: account.accountCode,
        accountName: account.accountName,
        parentAccountId: account.parentAccountId,
        accountType: account.accountType,
        accountCategory: account.accountCategory,
        accountSubcategory: account.accountSubcategory,
        level: account.level,
        isGroup: account.isGroup,
        currency: account.currency,
        openingBalance: account.openingBalance,
        openingBalanceDate: account.openingBalanceDate,
        allowManualEntry: account.allowManualEntry,
        description: account.description,
        taxType: account.taxType,
        tags: account.tags,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        organizationId: organizationId,
        accountCode: '',
        accountName: '',
        accountType: 'ASSET',
        level: 1,
        isGroup: false,
        currency: 'USD',
        openingBalance: 0,
        allowManualEntry: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingAccount) {
        await accountingService.updateAccount(editingAccount.id, formData);
      } else {
        await accountingService.createAccount(formData);
      }
      handleCloseDialog();
      loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Failed to save account');
    }
  };

  const handleDeactivate = async (accountId: string) => {
    if (window.confirm('Are you sure you want to deactivate this account?')) {
      try {
        await accountingService.deactivateAccount(accountId, organizationId);
        loadAccounts();
      } catch (err: any) {
        setError(err.message || 'Failed to deactivate account');
      }
    }
  };

  const handleLoadStandardCOA = async () => {
    if (window.confirm('This will load a standard chart of accounts template. Continue?')) {
      try {
        await accountingService.loadStandardCOA(organizationId);
        loadAccounts();
      } catch (err: any) {
        setError(err.message || 'Failed to load standard chart of accounts');
      }
    }
  };

  const getAccountTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      ASSET: 'success',
      LIABILITY: 'error',
      EQUITY: 'info',
      REVENUE: 'primary',
      EXPENSE: 'warning',
    };
    return colors[type] || 'default';
  };

  const formatAmount = (value?: number) => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return '0.00';
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.accountType]) {
      acc[account.accountType] = [];
    }
    acc[account.accountType].push(account);
    return acc;
  }, {} as Record<string, ChartOfAccount[]>);

  return (
    <Box>
      {!organizationId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No organization selected. Please select an organization to view and manage your chart of accounts.
        </Alert>
      )}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Chart of Accounts</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={viewMode === 'list' ? <TreeIcon /> : <ListIcon />}
            onClick={() => setViewMode(viewMode === 'list' ? 'tree' : 'list')}
          >
            {viewMode === 'list' ? 'Tree View' : 'List View'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleLoadStandardCOA}
            disabled={!organizationId || loading}
          >
            Load Standard COA
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!organizationId}
          >
            Add Account
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {viewMode === 'list' ? (
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Code</TableCell>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Opening Balance</TableCell>
                    <TableCell align="right">Current Balance</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No accounts found. Create your first account to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => (
                      <TableRow
                        key={account.id}
                        sx={{
                          backgroundColor: account.isGroup ? '#f5f5f5' : 'inherit',
                          fontWeight: account.isGroup ? 'bold' : 'normal',
                        }}
                      >
                        <TableCell>
                          {account.isGroup && '📁 '}
                          {account.accountCode}
                        </TableCell>
                        <TableCell>{account.accountName}</TableCell>
                        <TableCell>
                          <Chip
                            label={account.accountType}
                            size="small"
                            color={getAccountTypeColor(account.accountType) as any}
                          />
                        </TableCell>
                        <TableCell>{account.accountCategory}</TableCell>
                        <TableCell align="right">
                          {account.isGroup ? '-' : formatAmount(account.openingBalance)}
                        </TableCell>
                        <TableCell align="right">
                          {account.isGroup ? '-' : formatAmount(account.currentBalance)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={account.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={account.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(account)}
                            color="primary"
                            title={account.isSystemAccount ? "View/Edit Account" : "Edit Account"}
                          >
                            <EditIcon />
                          </IconButton>
                          {!account.isSystemAccount && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeactivate(account.id)}
                              color="error"
                              title="Deactivate Account"
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                          {account.isSystemAccount && (
                            <Chip
                              label="System"
                              size="small"
                              color="default"
                              variant="outlined"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {Object.entries(groupedAccounts).map(([type, accts]) => (
            <Card key={type} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Chip label={type} color={getAccountTypeColor(type as AccountType) as any} sx={{ mr: 1 }} />
                  {type} ({accts.length} accounts)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell align="right">Balance</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountCode}</TableCell>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell align="right">
                            {formatAmount(account.currentBalance)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(account)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAccount ? 'Edit Account' : 'Create New Account'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Account Code"
              value={formData.accountCode}
              onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
              required
              fullWidth
              disabled={!!editingAccount}
            />
            <TextField
              label="Account Name"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              select
              label="Account Type"
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
              required
              fullWidth
            >
              <MenuItem value="ASSET">Asset</MenuItem>
              <MenuItem value="LIABILITY">Liability</MenuItem>
              <MenuItem value="EQUITY">Equity</MenuItem>
              <MenuItem value="REVENUE">Revenue</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </TextField>
            <TextField
              label="Account Category"
              value={formData.accountCategory || ''}
              onChange={(e) => setFormData({ ...formData, accountCategory: e.target.value })}
              fullWidth
              placeholder="e.g., Current Assets, Fixed Assets"
            />
            <TextField
              label="Opening Balance"
              type="number"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
              fullWidth
              disabled={formData.isGroup}
            />
            <TextField
              label="Description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isGroup || false}
                  onChange={(e) => setFormData({ ...formData, isGroup: e.target.checked })}
                />
              }
              label="Is Group Account (summary only, no posting)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingAccount ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChartOfAccounts;

