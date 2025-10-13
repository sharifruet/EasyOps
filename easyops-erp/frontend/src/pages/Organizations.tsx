import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import organizationService from '@/services/organizationService';
import { Organization, OrganizationFormData } from '@/types/organization';

const Organizations: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    code: '',
    name: '',
    email: '',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    locale: 'bn-BD',
    subscriptionPlan: 'FREE',
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getAllOrganizations(0, 100);
      setOrganizations(data.content || []);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Failed to fetch organizations', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (org?: Organization) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        code: org.code,
        name: org.name,
        legalName: org.legalName,
        description: org.description,
        email: org.email,
        phone: org.phone,
        website: org.website,
        industry: org.industry,
        businessType: org.businessType,
        taxId: org.taxId,
        currency: org.currency || 'USD',
        timezone: org.timezone || 'UTC',
        locale: org.locale || 'en-US',
        addressLine1: org.addressLine1,
        city: org.city,
        state: org.state,
        postalCode: org.postalCode,
        country: org.country,
        subscriptionPlan: org.subscriptionPlan || 'FREE',
      });
    } else {
      setEditingOrg(null);
      setFormData({
        code: '',
        name: '',
        email: '',
        currency: 'USD',
        timezone: 'UTC',
        locale: 'en-US',
        subscriptionPlan: 'FREE',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOrg(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingOrg) {
        await organizationService.updateOrganization(editingOrg.id, formData);
        enqueueSnackbar('Organization updated successfully', { variant: 'success' });
      } else {
        await organizationService.createOrganization(formData);
        enqueueSnackbar('Organization created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchOrganizations();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await organizationService.deleteOrganization(id);
        enqueueSnackbar('Organization deleted successfully', { variant: 'success' });
        fetchOrganizations();
      } catch (error: any) {
        enqueueSnackbar(error.response?.data?.message || 'Delete failed', { variant: 'error' });
      }
    }
  };

  const handleToggleStatus = async (org: Organization) => {
    try {
      if (org.status === 'ACTIVE') {
        await organizationService.suspendOrganization(org.id);
        enqueueSnackbar('Organization suspended', { variant: 'success' });
      } else {
        await organizationService.activateOrganization(org.id);
        enqueueSnackbar('Organization activated', { variant: 'success' });
      }
      fetchOrganizations();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Status update failed', { variant: 'error' });
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'error';
      case 'TRIAL':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Organizations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Organization
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Max Users</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id} hover onClick={() => navigate(`/organizations/${org.id}`)} sx={{ cursor: 'pointer' }}>
                <TableCell>{org.code}</TableCell>
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.email || '-'}</TableCell>
                <TableCell>
                  <Chip label={org.subscriptionPlan} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={org.status}
                    size="small"
                    color={getStatusColor(org.status)}
                    icon={org.status === 'ACTIVE' ? <ActiveIcon /> : <InactiveIcon />}
                  />
                </TableCell>
                <TableCell>{org.maxUsers || 10}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDialog(org);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(org);
                    }}
                    color={org.status === 'ACTIVE' ? 'error' : 'success'}
                  >
                    {org.status === 'ACTIVE' ? <InactiveIcon /> : <ActiveIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(org.id);
                    }}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {organizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="textSecondary">
                    No organizations found. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingOrg ? 'Edit Organization' : 'Create Organization'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Code *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                disabled={!!editingOrg}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Legal Name"
                value={formData.legalName || ''}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <MenuItem value="BDT">BDT - Bangladeshi Taka</MenuItem>
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="INR">INR - Indian Rupee</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Subscription Plan"
                value={formData.subscriptionPlan}
                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
              >
                <MenuItem value="FREE">Free</MenuItem>
                <MenuItem value="BASIC">Basic</MenuItem>
                <MenuItem value="PROFESSIONAL">Professional</MenuItem>
                <MenuItem value="ENTERPRISE">Enterprise</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.code || !formData.name}>
            {editingOrg ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Organizations;

