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
} from '@mui/material';
import {
  Check as CheckIcon,
  AccountBalance as BankIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import accountingService from '../../services/accountingService';
import { formatCurrency } from '../../utils/currencyFormatter';

const BankReconciliation: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [reconciliationData, setReconciliationData] = useState({
    bankAccountId: '',
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: 0,
    openingBalance: 0,
  });

  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganizationId) {
      loadBankAccounts();
    }
  }, [currentOrganizationId]);

  useEffect(() => {
    if (reconciliationData.bankAccountId) {
      loadTransactions();
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

  const loadTransactions = async () => {
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

  const calculateDifference = () => {
    const reconciledTotal = transactions
      .filter(t => t.isReconciled)
      .reduce((sum, t) => sum + (t.creditAmount || 0) - (t.debitAmount || 0), 0);
    return reconciliationData.statementBalance - (reconciliationData.openingBalance + reconciledTotal);
  };

  const handleCompleteReconciliation = async () => {
    try {
      setLoading(true);
      await accountingService.createReconciliation({
        bankAccountId: reconciliationData.bankAccountId,
        statementDate: reconciliationData.statementDate,
        statementBalance: reconciliationData.statementBalance,
        openingBalance: reconciliationData.openingBalance,
        reconciledTransactions: transactions.filter(t => t.isReconciled)
      });
      setError(null);
      // Refresh transactions
      await loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to complete reconciliation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bank Reconciliation
      </Typography>

      {!currentOrganizationId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No organization selected. Please select an organization or contact your administrator.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <BankIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Reconciliation Details
              </Typography>
              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <TextField
                  select
                  label="Bank Account"
                  value={reconciliationData.bankAccountId}
                  onChange={(e) => setReconciliationData({ ...reconciliationData, bankAccountId: e.target.value })}
                  fullWidth
                  disabled={loading}
                >
                  <MenuItem value="">Select Bank Account</MenuItem>
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} - {account.accountNumber}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Statement Date"
                  type="date"
                  value={reconciliationData.statementDate}
                  onChange={(e) => setReconciliationData({ ...reconciliationData, statementDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Opening Balance"
                  type="number"
                  value={reconciliationData.openingBalance}
                  onChange={(e) => setReconciliationData({ ...reconciliationData, openingBalance: parseFloat(e.target.value) })}
                  fullWidth
                />

                <TextField
                  label="Statement Closing Balance"
                  type="number"
                  value={reconciliationData.statementBalance}
                  onChange={(e) => setReconciliationData({ ...reconciliationData, statementBalance: parseFloat(e.target.value) })}
                  fullWidth
                />

                <Box sx={{ p: 2, bgcolor: calculateDifference() === 0 ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Difference:</Typography>
                  <Typography variant="h5" color={calculateDifference() === 0 ? 'success.main' : 'error.main'}>
                    {formatCurrency(Math.abs(calculateDifference()))}
                  </Typography>
                  {calculateDifference() === 0 && (
                    <Chip label="✓ Reconciled" color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
                  fullWidth
                  disabled={calculateDifference() !== 0 || loading}
                  onClick={handleCompleteReconciliation}
                >
                  {loading ? 'Processing...' : 'Complete Reconciliation'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" gutterBottom>
                  Unreconciled Transactions
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={loadTransactions}
                  disabled={loading || !reconciliationData.bankAccountId}
                >
                  Refresh
                </Button>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Reconcile</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Reference</TableCell>
                      <TableCell align="right">Debit</TableCell>
                      <TableCell align="right">Credit</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <CircularProgress size={24} />
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Loading transactions...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="textSecondary">
                            {reconciliationData.bankAccountId 
                              ? 'No unreconciled transactions found'
                              : 'Select a bank account to load transactions'
                            }
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={transaction.isReconciled || false}
                              onChange={(e) => {
                                const updatedTransactions = transactions.map(t =>
                                  t.id === transaction.id 
                                    ? { ...t, isReconciled: e.target.checked }
                                    : t
                                );
                                setTransactions(updatedTransactions);
                              }}
                            />
                          </TableCell>
                          <TableCell>{new Date(transaction.transactionDate).toLocaleDateString()}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.referenceNumber}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(transaction.debitAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(transaction.creditAmount)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(transaction.runningBalance)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BankReconciliation;











