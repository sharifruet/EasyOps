import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Paper,
  Chip,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Check as PostIcon,
  Undo as ReverseIcon,
} from '@mui/icons-material';
import accountingService from '../../services/accountingService';
import { JournalEntryRequest, JournalLineRequest, ChartOfAccount, JournalEntry as JournalEntryType } from '../../types/accounting';

const JournalEntry: React.FC = () => {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [journals, setJournals] = useState<JournalEntryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const organizationId = localStorage.getItem('currentOrganizationId') || '';

  const [formData, setFormData] = useState<JournalEntryRequest>({
    organizationId: organizationId,
    journalDate: new Date().toISOString().split('T')[0],
    journalType: 'MANUAL',
    description: '',
    lines: [
      { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
      { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
    ],
  });

  useEffect(() => {
    loadPostingAccounts();
    loadJournals();
  }, []);

  const loadPostingAccounts = async () => {
    try {
      const data = await accountingService.getPostingAccounts(organizationId);
      setAccounts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    }
  };

  const loadJournals = async () => {
    setLoading(true);
    try {
      const data = await accountingService.getJournalEntries(organizationId, 0, 10);
      setJournals(data.content || data);
    } catch (err: any) {
      console.error('Failed to load journals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { accountId: '', debitAmount: 0, creditAmount: 0, description: '' }],
    });
  };

  const handleRemoveLine = (index: number) => {
    if (formData.lines.length > 2) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData({ ...formData, lines: newLines });
    }
  };

  const handleLineChange = (index: number, field: keyof JournalLineRequest, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    const totals = calculateTotals();
    if (Math.abs(totals.difference) > 0.01) {
      setError(`Journal is not balanced! Debits: ${totals.totalDebit}, Credits: ${totals.totalCredit}`);
      return;
    }

    try {
      const journal = await accountingService.createJournalEntry(formData);
      setSuccess(`Journal entry ${journal.journalNumber} created successfully!`);
      // Reset form
      setFormData({
        organizationId: organizationId,
        journalDate: new Date().toISOString().split('T')[0],
        journalType: 'MANUAL',
        description: '',
        lines: [
          { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
          { accountId: '', debitAmount: 0, creditAmount: 0, description: '' },
        ],
      });
      loadJournals();
    } catch (err: any) {
      setError(err.message || 'Failed to create journal entry');
    }
  };

  const handlePostJournal = async (journalId: string) => {
    try {
      await accountingService.postJournalEntry(journalId);
      setSuccess('Journal posted successfully!');
      loadJournals();
    } catch (err: any) {
      setError(err.message || 'Failed to post journal');
    }
  };

  const totals = calculateTotals();
  const isBalanced = Math.abs(totals.difference) < 0.01;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Journal Entry
      </Typography>

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create New Journal Entry
              </Typography>

              <Box display="flex" flexDirection="column" gap={2} mt={2}>
                <TextField
                  label="Journal Date"
                  type="date"
                  value={formData.journalDate}
                  onChange={(e) => setFormData({ ...formData, journalDate: e.target.value })}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  fullWidth
                  required
                  multiline
                  rows={2}
                />

                <TextField
                  label="Reference Number"
                  value={formData.referenceNumber || ''}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  fullWidth
                  placeholder="Optional reference"
                />

                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Journal Lines
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Account</TableCell>
                        <TableCell align="right">Debit</TableCell>
                        <TableCell align="right">Credit</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formData.lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={line.accountId}
                              onChange={(e) => handleLineChange(index, 'accountId', e.target.value)}
                              fullWidth
                              required
                            >
                              <MenuItem value="">Select Account</MenuItem>
                              {accounts.map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                  {account.accountCode} - {account.accountName}
                                </MenuItem>
                              ))}
                            </TextField>
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={line.debitAmount}
                              onChange={(e) => handleLineChange(index, 'debitAmount', parseFloat(e.target.value) || 0)}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={line.creditAmount}
                              onChange={(e) => handleLineChange(index, 'creditAmount', parseFloat(e.target.value) || 0)}
                              inputProps={{ min: 0, step: 0.01 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={line.description || ''}
                              onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveLine(index)}
                              disabled={formData.lines.length <= 2}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleAddLine}
                          >
                            Add Line
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: isBalanced ? '#e8f5e9' : '#ffebee' }}>
                        <TableCell><strong>Totals</strong></TableCell>
                        <TableCell align="right">
                          <strong>{totals.totalDebit.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell align="right">
                          <strong>{totals.totalCredit.toFixed(2)}</strong>
                        </TableCell>
                        <TableCell colSpan={2}>
                          {isBalanced ? (
                            <Chip label="✓ Balanced" color="success" size="small" />
                          ) : (
                            <Chip
                              label={`⚠ Difference: ${Math.abs(totals.difference).toFixed(2)}`}
                              color="error"
                              size="small"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box display="flex" gap={2} mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={!isBalanced || !formData.description}
                    fullWidth
                  >
                    Create Journal Entry
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Journal Entries
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Number</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {journals.map((journal) => (
                      <TableRow key={journal.id}>
                        <TableCell>{journal.journalNumber}</TableCell>
                        <TableCell>{journal.journalDate}</TableCell>
                        <TableCell>{journal.description}</TableCell>
                        <TableCell>
                          <Chip
                            label={journal.status}
                            size="small"
                            color={
                              journal.status === 'POSTED'
                                ? 'success'
                                : journal.status === 'DRAFT'
                                ? 'default'
                                : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {journal.status === 'DRAFT' && (
                            <IconButton
                              size="small"
                              onClick={() => handlePostJournal(journal.id)}
                              color="primary"
                              title="Post to GL"
                            >
                              <PostIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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

export default JournalEntry;

