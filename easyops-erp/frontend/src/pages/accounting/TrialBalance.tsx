import React, { useEffect, useState } from 'react';
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
  Alert,
  TextField,
  MenuItem,
  Chip,
} from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import accountingService from '../../services/accountingService';
import { TrialBalance as TrialBalanceType, AccountType } from '../../types/accounting';

const TrialBalance: React.FC = () => {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodId, setPeriodId] = useState<string>('');
  
  const organizationId = localStorage.getItem('currentOrganizationId') || '';

  const loadTrialBalance = async () => {
    if (!periodId) {
      setError('Please select a period');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await accountingService.getTrialBalance(organizationId, periodId);
      setTrialBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load trial balance');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    return trialBalance.reduce(
      (acc, row) => ({
        openingBalance: acc.openingBalance + row.openingBalance,
        debitTotal: acc.debitTotal + row.debitTotal,
        creditTotal: acc.creditTotal + row.creditTotal,
        closingBalance: acc.closingBalance + row.closingBalance,
      }),
      { openingBalance: 0, debitTotal: 0, creditTotal: 0, closingBalance: 0 }
    );
  };

  const totals = trialBalance.length > 0 ? calculateTotals() : null;

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

  const groupedByType = trialBalance.reduce((acc, row) => {
    if (!acc[row.accountType]) {
      acc[row.accountType] = [];
    }
    acc[row.accountType].push(row);
    return acc;
  }, {} as Record<string, TrialBalanceType[]>);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Trial Balance</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTrialBalance}
            disabled={!periodId}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disabled={trialBalance.length === 0}
          >
            Export
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              label="Period"
              value={periodId}
              onChange={(e) => setPeriodId(e.target.value)}
              placeholder="Enter Period ID"
              sx={{ flexGrow: 1 }}
              helperText="Note: Period selection UI will be added in next iteration"
            />
            <Button
              variant="contained"
              onClick={loadTrialBalance}
              disabled={!periodId}
            >
              Load Trial Balance
            </Button>
          </Box>
        </CardContent>
      </Card>

      {trialBalance.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Trial Balance Report
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Account Code</strong></TableCell>
                    <TableCell><strong>Account Name</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell align="right"><strong>Opening Balance</strong></TableCell>
                    <TableCell align="right"><strong>Debit</strong></TableCell>
                    <TableCell align="right"><strong>Credit</strong></TableCell>
                    <TableCell align="right"><strong>Closing Balance</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(groupedByType).map(([type, accounts]) => (
                    <React.Fragment key={type}>
                      <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell colSpan={7}>
                          <Chip
                            label={type}
                            color={getAccountTypeColor(type as AccountType) as any}
                            size="small"
                          />
                          <strong style={{ marginLeft: 8 }}>{type}</strong>
                        </TableCell>
                      </TableRow>
                      {accounts.map((row) => (
                        <TableRow key={row.accountCode}>
                          <TableCell>{row.accountCode}</TableCell>
                          <TableCell>{row.accountName}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.accountType}
                              size="small"
                              color={getAccountTypeColor(row.accountType) as any}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {row.openingBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.debitTotal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.creditTotal.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="right">
                            {row.closingBalance.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                  {totals && (
                    <TableRow sx={{ backgroundColor: '#fff9c4' }}>
                      <TableCell colSpan={3}>
                        <strong>GRAND TOTAL</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {totals.openingBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {totals.debitTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {totals.creditTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>
                          {totals.closingBalance.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totals && Math.abs(totals.debitTotal - totals.creditTotal) < 0.01 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                ✓ Trial Balance is balanced! Debits ({totals.debitTotal.toFixed(2)}) = Credits ({totals.creditTotal.toFixed(2)})
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TrialBalance;

