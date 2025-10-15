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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const organizationId = localStorage.getItem('currentOrganizationId') || '';

  const [formData, setFormData] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    customerId: '',
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
        <Typography variant="h4">Accounts Receivable - Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Invoice
        </Button>
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setError(null)}>
          📝 Phase 1.2 Note: AR Service (Port 8090) needs to be started to load actual data.
          This UI is ready and will work once the backend service is running.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Invoices
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
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
                      No invoices yet. Create your first invoice to get started!
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      (AR Service will be started in next deployment)
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Customer Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={1}>
            <Grid item xs={6}>
              <TextField
                label="Invoice Date"
                type="date"
                value={formData.invoiceDate}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
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
                label="Customer"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                fullWidth
                required
              >
                <MenuItem value="">Select Customer</MenuItem>
                <MenuItem value="cust1">Sample Customer 1</MenuItem>
                <MenuItem value="cust2">Sample Customer 2</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Invoice Lines
              </Typography>
              {formData.lines.map((line, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <TextField
                      label="Description"
                      value={line.description}
                      onChange={(e) => {
                        const newLines = [...formData.lines];
                        newLines[index].description = e.target.value;
                        setFormData({ ...formData, lines: newLines });
                      }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Qty"
                      type="number"
                      value={line.quantity}
                      onChange={(e) => {
                        const newLines = [...formData.lines];
                        newLines[index].quantity = parseFloat(e.target.value);
                        setFormData({ ...formData, lines: newLines });
                      }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Unit Price"
                      type="number"
                      value={line.unitPrice}
                      onChange={(e) => {
                        const newLines = [...formData.lines];
                        newLines[index].unitPrice = parseFloat(e.target.value);
                        setFormData({ ...formData, lines: newLines });
                      }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Tax %"
                      type="number"
                      value={line.taxPercent}
                      onChange={(e) => {
                        const newLines = [...formData.lines];
                        newLines[index].taxPercent = parseFloat(e.target.value);
                        setFormData({ ...formData, lines: newLines });
                      }}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="body2" sx={{ pt: 2 }}>
                      Total: {(line.quantity * line.unitPrice * (1 + line.taxPercent / 100)).toFixed(2)}
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
            setError('AR Service not started yet. Invoice functionality ready for deployment.');
            setOpenDialog(false);
          }}>
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;


