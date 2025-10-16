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
  Tabs,
  Tab,
  Alert,
  Chip,
  Button,
  CircularProgress,
  Grid,
  TextField,
} from '@mui/material';
import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import accountingService from '../../services/accountingService';
import { formatCurrency } from '../../utils/currencyFormatter';

const AgingReports: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [agingData, setAgingData] = useState<any[]>([]);

  const agingBuckets = [
    { label: 'Current', color: 'success' as const, field: 'current' },
    { label: '1-30 Days', color: 'info' as const, field: 'days1To30' },
    { label: '31-60 Days', color: 'warning' as const, field: 'days31To60' },
    { label: '61-90 Days', color: 'error' as const, field: 'days61To90' },
    { label: 'Over 90 Days', color: 'error' as const, field: 'over90Days' },
  ];

  useEffect(() => {
    if (currentOrganizationId) {
      loadAgingReport();
    }
  }, [currentOrganizationId, tabValue, asOfDate]);

  const loadAgingReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountingService.getARAgingReport(currentOrganizationId || '', asOfDate);
      setAgingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load aging report');
    } finally {
      setLoading(false);
    }
  };

  const calculateBucketTotal = (field: string): number => {
    return agingData.reduce((sum, item) => sum + (item[field] || 0), 0);
  };

  const getTotalOutstanding = (): number => {
    return agingData.reduce((sum, item) => sum + (item.totalOutstanding || 0), 0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Aging Reports</Typography>
        <Box display="flex" gap={2}>
          <TextField
            label="As of Date"
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadAgingReport}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Box>
      </Box>

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

      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        <Tab label="Accounts Receivable Aging" />
        <Tab label="Accounts Payable Aging" />
      </Tabs>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {tabValue === 0 ? 'AR Aging Summary' : 'AP Aging Summary'}
          </Typography>

          {/* Aging Buckets Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {agingBuckets.map((bucket) => {
              const bucketTotal = calculateBucketTotal(bucket.field);
              const itemCount = agingData.filter(item => (item[bucket.field] || 0) > 0).length;
              
              return (
                <Grid item xs={12} sm={6} md={2.4} key={bucket.label}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        {bucket.label}
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(bucketTotal)}
                      </Typography>
                      <Typography variant="caption">
                        {itemCount} items
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Summary Row */}
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="h6">
              Total Outstanding: {formatCurrency(getTotalOutstanding())}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {agingData.length} {tabValue === 0 ? 'customers' : 'vendors'} with outstanding balances
            </Typography>
          </Box>

          {/* Detailed Aging Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{tabValue === 0 ? 'Customer' : 'Vendor'}</TableCell>
                  <TableCell align="right">Current</TableCell>
                  <TableCell align="right">1-30 Days</TableCell>
                  <TableCell align="right">31-60 Days</TableCell>
                  <TableCell align="right">61-90 Days</TableCell>
                  <TableCell align="right">Over 90 Days</TableCell>
                  <TableCell align="right">Total Outstanding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Loading aging report...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : agingData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No {tabValue === 0 ? 'receivables' : 'payables'} data available
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  agingData.map((item) => (
                    <TableRow key={item.customerId || item.vendorId}>
                      <TableCell>{item.customerName || item.vendorName}</TableCell>
                      <TableCell align="right">{formatCurrency(item.current)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.days1To30)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.days31To60)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.days61To90)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.over90Days)}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(item.totalOutstanding)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgingReports;











