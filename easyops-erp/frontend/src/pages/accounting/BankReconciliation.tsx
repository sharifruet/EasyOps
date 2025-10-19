import React, { useState, useEffect } from 'react';
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
  TextField,
  Grid,
  Checkbox,
  Alert,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Check as CheckIcon,
  AccountBalance as BankIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import accountingService from '../../services/accountingService';

const BankReconciliation: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [reconciliationData, setReconciliationData] = useState({
    bankAccountId: '',
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: 0,
    openingBalance: 0,
    closingBalance: 0,
  });

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganizationId) {
      loadBankAccounts();
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    if (reconciliationData.bankAccountId) {
      loadUnreconciledTransactions();
      // Set opening balance from selected account
      const selectedAccount = bankAccounts.find(acc => acc.id === reconciliationData.bankAccountId);
      if (selectedAccount) {
        setReconciliationData(prev => ({
          ...prev,
          openingBalance: selectedAccount.currentBalance || 0,
        }));
      }
    }
  }, [reconciliationData.bankAccountId]);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const accounts = await accountingService.getBankAccounts(currentOrganizationId || '');
      setBankAccounts(accounts);
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreconciledTransactions = async () => {
    try {
      setLoading(true);
      const unreconciled = await accountingService.getUnreconciledTransactions(reconciliationData.bankAccountId);
      setTransactions(unreconciled);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionToggle = (transactionId: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const calculateReconciledBalance = () => {
    return transactions
      .filter(t => selectedTransactions.has(t.id))
      .reduce((sum, t) => {
        if (t.transactionType === 'DEPOSIT') {
          return sum + (t.amount || 0);
        } else {
          return sum - (t.amount || 0);
        }
      }, reconciliationData.openingBalance);
  };

  const calculateDifference = () => {
    const reconciledBalance = calculateReconciledBalance();
    return reconciliationData.closingBalance - reconciledBalance;
  };

  const handleCompleteReconciliation = async () => {
    setError(null);
    setSuccess(null);

    if (!reconciliationData.bankAccountId) {
      setError('Please select a bank account');
      return;
    }

    if (selectedTransactions.size === 0) {
      setError('Please select at least one transaction to reconcile');
      return;
    }

    const difference = calculateDifference();
    if (Math.abs(difference) > 0.01) {
      setError(`Reconciliation is out of balance by ${formatCurrency(Math.abs(difference))}. Please review selected transactions.`);
      return;
    }

    try {
      setLoading(true);
      
      // Create reconciliation
      const reconciliationRequest = {
        organizationId: currentOrganizationId,
        bankAccountId: reconciliationData.bankAccountId,
        statementDate: reconciliationData.statementDate,
        openingBalance: reconciliationData.openingBalance,
        closingBalance: reconciliationData.closingBalance,
        items: Array.from(selectedTransactions).map(txnId => ({
          transactionId: txnId,
        })),
      };

      const reconciliation = await accountingService.createBankReconciliation(reconciliationRequest);
      await accountingService.completeBankReconciliation(reconciliation.id);
      
      setSuccess('Bank reconciliation completed successfully!');
      
      // Reset form
      setSelectedTransactions(new Set());
      loadUnreconciledTransactions();
      
    } catch (err: any) {
      setError(err.message || 'Failed to complete reconciliation');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const difference = calculateDifference();
  const isBalanced = Math.abs(difference) < 0.01;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <BankIcon sx={{ mr: 1, fontSize: 32 }} />
          <Typography variant="h4">Bank Reconciliation</Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadUnreconciledTransactions}
          disabled={!reconciliationData.bankAccountId || loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Reconciliation Setup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Reconciliation Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Bank Account"
                value={reconciliationData.bankAccountId}
                onChange={(e) => setReconciliationData({ ...reconciliationData, bankAccountId: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="">Select Bank Account</MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName} - {account.accountNumber} ({formatCurrency(account.currentBalance || 0)})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Statement Date"
                type="date"
                value={reconciliationData.statementDate}
                onChange={(e) => setReconciliationData({ ...reconciliationData, statementDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Opening Balance (Book)"
                type="number"
                value={reconciliationData.openingBalance}
                onChange={(e) => setReconciliationData({ ...reconciliationData, openingBalance: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Closing Balance (Statement)"
                type="number"
                value={reconciliationData.closingBalance}
                onChange={(e) => setReconciliationData({ ...reconciliationData, closingBalance: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                inputProps={{ step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Reconciled Balance"
                value={formatCurrency(calculateReconciledBalance())}
                fullWidth
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reconciliation Status */}
      {reconciliationData.bankAccountId && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="caption" color="text.secondary">Opening Balance</Typography>
                  <Typography variant="h6">{formatCurrency(reconciliationData.openingBalance)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="caption" color="text.secondary">Closing Balance (Statement)</Typography>
                  <Typography variant="h6">{formatCurrency(reconciliationData.closingBalance)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Typography variant="caption" color="text.secondary">Reconciled Balance</Typography>
                  <Typography variant="h6">{formatCurrency(calculateReconciledBalance())}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: isBalanced ? '#e8f5e9' : '#ffebee' 
                  }}
                >
                  <Typography variant="caption" color="text.secondary">Difference</Typography>
                  <Typography 
                    variant="h6" 
                    color={isBalanced ? 'success.main' : 'error.main'}
                  >
                    {formatCurrency(difference)}
                    {isBalanced && <CheckIcon sx={{ ml: 1, verticalAlign: 'middle' }} />}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Unreconciled Transactions ({transactions.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selected: {selectedTransactions.size} transactions
            </Typography>
          </Box>
          
          {!reconciliationData.bankAccountId ? (
            <Alert severity="info">Please select a bank account to view unreconciled transactions.</Alert>
          ) : loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Alert severity="success">
              All transactions are reconciled! No unreconciled transactions found.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Select</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell align="right">Debit</TableCell>
                    <TableCell align="right">Credit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((txn) => (
                    <TableRow 
                      key={txn.id}
                      selected={selectedTransactions.has(txn.id)}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleTransactionToggle(txn.id)}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedTransactions.has(txn.id)}
                          onChange={() => handleTransactionToggle(txn.id)}
                        />
                      </TableCell>
                      <TableCell>{txn.transactionDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={txn.transactionType} 
                          size="small"
                          color={txn.transactionType === 'DEPOSIT' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{txn.description}</TableCell>
                      <TableCell>{txn.referenceNumber || '-'}</TableCell>
                      <TableCell align="right">
                        {txn.transactionType === 'WITHDRAWAL' ? formatCurrency(txn.amount) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {txn.transactionType === 'DEPOSIT' ? formatCurrency(txn.amount) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {reconciliationData.bankAccountId && transactions.length > 0 && (
            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckIcon />}
                onClick={handleCompleteReconciliation}
                disabled={loading || selectedTransactions.size === 0 || !isBalanced}
              >
                Complete Reconciliation
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankReconciliation;