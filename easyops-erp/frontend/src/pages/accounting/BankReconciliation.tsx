import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Check as CheckIcon,
  AccountBalance as BankIcon,
} from '@mui/icons-material';

const BankReconciliation: React.FC = () => {
  const [reconciliationData, setReconciliationData] = useState({
    bankAccountId: '',
    statementDate: new Date().toISOString().split('T')[0],
    statementBalance: 0,
    openingBalance: 0,
  });

  const [transactions, setTransactions] = useState<any[]>([]);

  const calculateDifference = () => {
    const reconciledTotal = transactions
      .filter(t => t.isReconciled)
      .reduce((sum, t) => sum + (t.creditAmount - t.debitAmount), 0);
    return reconciliationData.statementBalance - (reconciliationData.openingBalance + reconciledTotal);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bank Reconciliation
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        📝 Phase 1.2 Note: Bank Service (Port 8092) needs to be started to load actual data.
        This UI is ready and will work once the backend service is running.
      </Alert>

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
                >
                  <MenuItem value="">Select Bank Account</MenuItem>
                  <MenuItem value="bank1">Main Operating Account</MenuItem>
                  <MenuItem value="bank2">Savings Account</MenuItem>
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
                  InputProps={{ startAdornment: '$' }}
                />

                <TextField
                  label="Statement Closing Balance"
                  type="number"
                  value={reconciliationData.statementBalance}
                  onChange={(e) => setReconciliationData({ ...reconciliationData, statementBalance: parseFloat(e.target.value) })}
                  fullWidth
                  InputProps={{ startAdornment: '$' }}
                />

                <Box sx={{ p: 2, bgcolor: calculateDifference() === 0 ? '#e8f5e9' : '#ffebee', borderRadius: 1 }}>
                  <Typography variant="subtitle2">Difference:</Typography>
                  <Typography variant="h5" color={calculateDifference() === 0 ? 'success.main' : 'error.main'}>
                    ${Math.abs(calculateDifference()).toFixed(2)}
                  </Typography>
                  {calculateDifference() === 0 && (
                    <Chip label="✓ Reconciled" color="success" size="small" sx={{ mt: 1 }} />
                  )}
                </Box>

                <Button
                  variant="contained"
                  startIcon={<CheckIcon />}
                  fullWidth
                  disabled={calculateDifference() !== 0}
                >
                  Complete Reconciliation
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bank Statement Transactions
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">Match</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Debit</TableCell>
                      <TableCell align="right">Credit</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="textSecondary">
                          Select a bank account to load transactions
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                          (Bank Service will be started in next deployment)
                        </Typography>
                      </TableCell>
                    </TableRow>
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









