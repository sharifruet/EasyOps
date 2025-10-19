import React, { useState, useEffect } from 'react';
import {
  Box,
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
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import accountingService from '../../services/accountingService';
import { exportAPAgingToExcel } from '../../utils/excelExport';

interface AgingReportItem {
  vendorId: string;
  vendorName: string;
  totalBalance: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  over90: number;
}

const APAgingReport: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agingData, setAgingData] = useState<AgingReportItem[]>([]);
  const [asOfDate, setAsOfDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const organizationId = currentOrganizationId || '';

  const loadAgingReport = async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await accountingService.getAPAgingReport(
        organizationId,
        asOfDate
      );
      setAgingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load aging report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      loadAgingReport();
    }
  }, [organizationId, asOfDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getTotalBalance = () => {
    return agingData.reduce((sum, item) => sum + item.totalBalance, 0);
  };

  const getTotalCurrent = () => {
    return agingData.reduce((sum, item) => sum + item.current, 0);
  };

  const getTotalDays30 = () => {
    return agingData.reduce((sum, item) => sum + item.days30, 0);
  };

  const getTotalDays60 = () => {
    return agingData.reduce((sum, item) => sum + item.days60, 0);
  };

  const getTotalDays90 = () => {
    return agingData.reduce((sum, item) => sum + item.days90, 0);
  };

  const getTotalOver90 = () => {
    return agingData.reduce((sum, item) => sum + item.over90, 0);
  };

  if (!organizationId) {
    return (
      <Box p={3}>
        <Alert severity="warning">Please select an organization to view aging reports.</Alert>
      </Box>
    );
  }

  return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            AP Aging Report
          </Typography>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              const exportData = agingData.map(item => ({
                vendorName: item.vendorName,
                current: item.current,
                days1to30: item.days30,
                days31to60: item.days60,
                days61to90: item.days90,
                over90: item.over90,
                total: item.totalBalance
              }));
              exportAPAgingToExcel(exportData);
            }}
            disabled={agingData.length === 0}
          >
            Export to Excel
          </Button>
        </Box>
        
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  label="As of Date"
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  onClick={loadAgingReport}
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Refresh'}
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="primary">
                  Total Outstanding: {formatCurrency(getTotalBalance())}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Card>
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Vendor</strong></TableCell>
                      <TableCell align="right"><strong>Total Balance</strong></TableCell>
                      <TableCell align="right"><strong>Current</strong></TableCell>
                      <TableCell align="right"><strong>1-30 Days</strong></TableCell>
                      <TableCell align="right"><strong>31-60 Days</strong></TableCell>
                      <TableCell align="right"><strong>61-90 Days</strong></TableCell>
                      <TableCell align="right"><strong>Over 90 Days</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {agingData.map((item, index) => (
                      <TableRow key={item.vendorId || index}>
                        <TableCell>
                          <Typography variant="subtitle2">
                            {item.vendorName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" color="primary">
                            <strong>{formatCurrency(item.totalBalance)}</strong>
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.current)}
                        </TableCell>
                        <TableCell align="right">
                          {item.days30 > 0 && (
                            <Chip 
                              label={formatCurrency(item.days30)} 
                              size="small" 
                              color="warning" 
                            />
                          )}
                          {item.days30 === 0 && formatCurrency(item.days30)}
                        </TableCell>
                        <TableCell align="right">
                          {item.days60 > 0 && (
                            <Chip 
                              label={formatCurrency(item.days60)} 
                              size="small" 
                              color="warning" 
                            />
                          )}
                          {item.days60 === 0 && formatCurrency(item.days60)}
                        </TableCell>
                        <TableCell align="right">
                          {item.days90 > 0 && (
                            <Chip 
                              label={formatCurrency(item.days90)} 
                              size="small" 
                              color="error" 
                            />
                          )}
                          {item.days90 === 0 && formatCurrency(item.days90)}
                        </TableCell>
                        <TableCell align="right">
                          {item.over90 > 0 && (
                            <Chip 
                              label={formatCurrency(item.over90)} 
                              size="small" 
                              color="error" 
                              variant="outlined"
                            />
                          )}
                          {item.over90 === 0 && formatCurrency(item.over90)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {agingData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No aging data available for the selected date.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>TOTALS</strong></TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(getTotalBalance())}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(getTotalCurrent())}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(getTotalDays30())}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(getTotalDays60())}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(getTotalDays90())}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{formatCurrency(getTotalOver90())}</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Box>
  );
};

export default APAgingReport;
