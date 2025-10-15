import React, { useState } from 'react';
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
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const AgingReports: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const agingBuckets = [
    { label: 'Current', color: 'success' },
    { label: '1-30 Days', color: 'info' },
    { label: '31-60 Days', color: 'warning' },
    { label: '61-90 Days', color: 'error' },
    { label: 'Over 90 Days', color: 'error' },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Aging Reports</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        📝 Phase 1.2 Note: AR/AP Services need to be started to load actual aging data.
        This UI is ready and will work once the backend services are running.
      </Alert>

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
            {agingBuckets.map((bucket) => (
              <Grid item xs={12} sm={6} md={2.4} key={bucket.label}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      {bucket.label}
                    </Typography>
                    <Typography variant="h6">
                      $0.00
                    </Typography>
                    <Typography variant="caption">
                      0 items
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Detailed Aging Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice/Bill #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>{tabValue === 0 ? 'Customer' : 'Vendor'}</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Days Overdue</TableCell>
                  <TableCell>Aging</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No {tabValue === 0 ? 'receivables' : 'payables'} data available
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      ({tabValue === 0 ? 'AR' : 'AP'} Service will be started in next deployment)
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AgingReports;









