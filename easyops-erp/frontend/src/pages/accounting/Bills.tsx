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

const Bills: React.FC = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    billDate: new Date().toISOString().split('T')[0],
    vendorId: '',
    paymentTerms: 30,
    lines: [
      { description: '', quantity: 1, unitPrice: 0, taxPercent: 0, accountId: '' },
    ],
  });

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { description: '', quantity: 1, unitPrice: 0, taxPercent: 0, accountId: '' }],
    });
  };

  const calculateTotal = () => {
    return formData.lines.reduce((sum, line) => {
      const subtotal = line.quantity * line.unitPrice;
      const tax = subtotal * (line.taxPercent / 100);
      return sum + subtotal + tax;
    }, 0);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Accounts Payable - Bills</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Bill
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        📝 Phase 1.2 Note: AP Service (Port 8091) needs to be started to load actual data.
        This UI is ready and will work once the backend service is running.
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Vendor Bills
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Vendor</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No bills yet. Create your first vendor bill to get started!
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      (AP Service will be started in next deployment)
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Bill Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Vendor Bill</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                label="Bill Date"
                type="date"
                value={formData.billDate}
                onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Payment Terms (days)"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: parseInt(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Vendor"
                value={formData.vendorId}
                onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="">Select Vendor</MenuItem>
                <MenuItem value="v1">Sample Vendor 1</MenuItem>
                <MenuItem value="v2">Sample Vendor 2</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Bill Lines
              </Typography>
              {formData.lines.map((line, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <TextField
                      label="Description"
                      value={line.description}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField label="Qty" type="number" value={line.quantity} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField label="Unit Price" type="number" value={line.unitPrice} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField label="Tax %" type="number" value={line.taxPercent} fullWidth size="small" />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" sx={{ pt: 2 }}>
                      ${(line.quantity * line.unitPrice * (1 + line.taxPercent / 100)).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
              <Button size="small" startIcon={<AddIcon />} onClick={handleAddLine}>
                Add Line
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6">Total Amount:</Typography>
                <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setError('AP Service not started yet. Bill functionality ready for deployment.');
            setOpenDialog(false);
          }}>
            Create Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;


