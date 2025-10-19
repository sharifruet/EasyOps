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
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import accountingService from '../../services/accountingService';

const BankTransactions: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [glAccounts, setGlAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  
  const organizationId = currentOrganizationId || '';

  const [formData, setFormData] = useState({
    bankAccountId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionType: 'DEPOSIT',
    amount: 0,
    referenceNumber: '',
    description: '',
    glAccountId: '',
    status: 'PENDING',
  });

  useEffect(() => {
    if (organizationId) {
      loadBankAccounts();
      loadGLAccounts();
    }
  }, [organizationId]);

  useEffect(() => {
    if (selectedAccountId) {
      loadTransactions();
    }
  }, [selectedAccountId]);

  const loadBankAccounts = async () => {
    try {
      const data = await accountingService.getBankAccounts(organizationId);
      setBankAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load bank accounts');
    }
  };

  const loadGLAccounts = async () => {
    try {
      const data = await accountingService.getActiveAccounts(organizationId);
      setGlAccounts(data);
    } catch (err: any) {
      console.error('Failed to load GL accounts:', err);
    }
  };

  const loadTransactions = async () => {
    if (!selectedAccountId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getBankTransactions(organizationId, selectedAccountId);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.bankAccountId) {
      setError('Please select a bank account');
      return;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!formData.glAccountId) {
      setError('Please select a GL account');
      return;
    }

    try {
      const transactionData = {
        organizationId,
        bankAccountId: formData.bankAccountId,
        transactionDate: formData.transactionDate,
        transactionType: formData.transactionType,
        amount: formData.amount,
        referenceNumber: formData.referenceNumber,
        description: formData.description,
        glAccountId: formData.glAccountId,
        status: formData.status,
      };

      await accountingService.createBankTransaction(transactionData);
      setSuccess('Transaction created successfully!');
      setOpenDialog(false);
      
      // Reset form
      setFormData({
        bankAccountId: '',
        transactionDate: new Date().toISOString().split('T')[0],
        transactionType: 'DEPOSIT',
        amount: 0,
        referenceNumber: '',
        description: '',
        glAccountId: '',
        status: 'PENDING',
      });
      
      loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSelectedAccountName = () => {
    const account = bankAccounts.find(acc => acc.id === selectedAccountId);
    return account ? account.accountName : 'Select Account';
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Bank Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          disabled={bankAccounts.length === 0}
        >
          Add Transaction
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

      {bankAccounts.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No bank accounts found. Please create a bank account first.
        </Alert>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Bank Account"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  fullWidth
                >
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} - {account.accountNumber} ({formatCurrency(account.currentBalance || 0)})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Current Balance: <strong>{formatCurrency(
                    bankAccounts.find(acc => acc.id === selectedAccountId)?.currentBalance || 0
                  )}</strong>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transactions for {getSelectedAccountName()}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="right">Debit</TableCell>
                  <TableCell align="right">Credit</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2">Loading transactions...</Typography>
                    </TableCell>
                  </TableRow>
                ) : !selectedAccountId ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        Please select a bank account to view transactions
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No transactions yet. Add your first transaction to get started!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((txn) => (
                    <TableRow key={txn.id}>
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
                      <TableCell align="right">
                        <strong>{formatCurrency(txn.runningBalance || 0)}</strong>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={txn.status} 
                          size="small"
                          color={txn.status === 'CLEARED' ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Transaction Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bank Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={12}>
              <TextField
                select
                label="Bank Account"
                value={formData.bankAccountId}
                onChange={(e) => setFormData({ ...formData, bankAccountId: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="">Select Bank Account</MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName} - {account.accountNumber}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label="Transaction Date"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label="Transaction Type"
                value={formData.transactionType}
                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value })}
                fullWidth
              >
                <MenuItem value="DEPOSIT">Deposit</MenuItem>
                <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
                <MenuItem value="TRANSFER">Transfer</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Reference Number"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="GL Account"
                value={formData.glAccountId}
                onChange={(e) => setFormData({ ...formData, glAccountId: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="">Select GL Account</MenuItem>
                {glAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountCode} - {account.accountName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                fullWidth
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CLEARED">Cleared</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTransaction}
            disabled={!formData.bankAccountId || !formData.amount || !formData.glAccountId}
          >
            Create Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankTransactions;
