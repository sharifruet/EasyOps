import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tooltip,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  VpnKey as PermissionIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import rbacService from '@services/rbacService';
import { Permission, PermissionRequest } from '@types/index';

const Permissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResource, setFilterResource] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState<PermissionRequest>({
    name: '',
    code: '',
    resource: '',
    action: '',
    description: '',
    isActive: true,
  });

  const { enqueueSnackbar } = useSnackbar();

  // Common resources and actions
  const resourceOptions = ['users', 'roles', 'permissions', 'organizations', 'system', 'audit', 'reports'];
  const actionOptions = ['create', 'read', 'update', 'delete', 'manage', 'view', 'configure', 'export'];

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      // Mock data for now - uncomment when RBAC service is ready
      const mockPermissions: Permission[] = [
        {
          id: '1',
          name: 'User Management',
          code: 'USER_MANAGE',
          resource: 'users',
          action: 'manage',
          description: 'Manage user accounts',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'User View',
          code: 'USER_VIEW',
          resource: 'users',
          action: 'view',
          description: 'View user information',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Role Management',
          code: 'ROLE_MANAGE',
          resource: 'roles',
          action: 'manage',
          description: 'Manage roles and permissions',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Role View',
          code: 'ROLE_VIEW',
          resource: 'roles',
          action: 'view',
          description: 'View roles and permissions',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'System Configuration',
          code: 'SYSTEM_CONFIG',
          resource: 'system',
          action: 'configure',
          description: 'Configure system settings',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '6',
          name: 'System View',
          code: 'SYSTEM_VIEW',
          resource: 'system',
          action: 'view',
          description: 'View system information',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '7',
          name: 'Audit Logs',
          code: 'AUDIT_VIEW',
          resource: 'audit',
          action: 'view',
          description: 'View audit logs',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '8',
          name: 'Organization Management',
          code: 'ORG_MANAGE',
          resource: 'organizations',
          action: 'manage',
          description: 'Manage organizations',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      let filteredPermissions = mockPermissions;
      if (filterResource !== 'all') {
        filteredPermissions = mockPermissions.filter(p => p.resource === filterResource);
      }
      
      setPermissions(filteredPermissions);
      setTotalElements(filteredPermissions.length);
      
      // Uncomment when service is ready:
      // const response = await rbacService.getAllPermissions({ page, size: rowsPerPage });
      // setPermissions(response.content);
      // setTotalElements(response.totalElements);
    } catch (error) {
      enqueueSnackbar('Failed to load permissions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [page, rowsPerPage, filterResource]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Get all permissions (mock data)
      const allPermissions: Permission[] = [
        {
          id: '1',
          name: 'User Management',
          code: 'USER_MANAGE',
          resource: 'users',
          action: 'manage',
          description: 'Manage user accounts',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'User View',
          code: 'USER_VIEW',
          resource: 'users',
          action: 'view',
          description: 'View user information',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Role Management',
          code: 'ROLE_MANAGE',
          resource: 'roles',
          action: 'manage',
          description: 'Manage roles and permissions',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Role View',
          code: 'ROLE_VIEW',
          resource: 'roles',
          action: 'view',
          description: 'View roles and permissions',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '5',
          name: 'System Configuration',
          code: 'SYSTEM_CONFIG',
          resource: 'system',
          action: 'configure',
          description: 'Configure system settings',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '6',
          name: 'System View',
          code: 'SYSTEM_VIEW',
          resource: 'system',
          action: 'view',
          description: 'View system information',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '7',
          name: 'Audit Logs',
          code: 'AUDIT_VIEW',
          resource: 'audit',
          action: 'view',
          description: 'View audit logs',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '8',
          name: 'Organization Management',
          code: 'ORG_MANAGE',
          resource: 'organizations',
          action: 'manage',
          description: 'Manage organizations',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      let filtered = allPermissions;
      
      // Apply resource filter
      if (filterResource !== 'all') {
        filtered = filtered.filter(p => p.resource === filterResource);
      }
      
      // Apply search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(permission =>
          permission.name.toLowerCase().includes(term) ||
          permission.code.toLowerCase().includes(term) ||
          permission.resource.toLowerCase().includes(term) ||
          permission.action.toLowerCase().includes(term) ||
          (permission.description && permission.description.toLowerCase().includes(term))
        );
        
        if (filtered.length > 0) {
          enqueueSnackbar(`Found ${filtered.length} permission(s)`, { variant: 'success' });
        } else {
          enqueueSnackbar('No permissions found matching your search', { variant: 'info' });
        }
      }
      
      setPermissions(filtered);
      setTotalElements(filtered.length);
      
      // When service is ready, use this:
      // const response = await rbacService.searchPermissions(searchTerm, { page, size: rowsPerPage });
      // setPermissions(response.content);
      // setTotalElements(response.totalElements);
    } catch (error) {
      enqueueSnackbar('Search failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      // await rbacService.createPermission(newPermission);
      enqueueSnackbar('Permission creation will be available when RBAC service is implemented', { variant: 'info' });
      setOpenDialog(false);
      resetForm();
      // fetchPermissions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create permission';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleUpdatePermission = async () => {
    if (!currentPermission) return;
    
    try {
      // await rbacService.updatePermission(currentPermission.id, newPermission);
      enqueueSnackbar('Permission update will be available when RBAC service is implemented', { variant: 'info' });
      setOpenDialog(false);
      resetForm();
      // fetchPermissions();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update permission';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleEditPermission = (permission: Permission) => {
    setCurrentPermission(permission);
    setNewPermission({
      name: permission.name,
      code: permission.code,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || '',
      isActive: permission.isActive,
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleToggleActive = async (permission: Permission) => {
    try {
      // await rbacService.togglePermissionStatus(permission.id);
      enqueueSnackbar('Permission status toggle will be available when RBAC service is implemented', { variant: 'info' });
      // fetchPermissions();
    } catch (error) {
      enqueueSnackbar('Failed to update permission status', { variant: 'error' });
    }
  };

  const handleDeletePermission = async (permissionId: string) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        // await rbacService.deletePermission(permissionId);
        enqueueSnackbar('Permission deletion will be available when RBAC service is implemented', { variant: 'info' });
        // fetchPermissions();
      } catch (error) {
        enqueueSnackbar('Failed to delete permission', { variant: 'error' });
      }
    }
  };

  const resetForm = () => {
    setNewPermission({
      name: '',
      code: '',
      resource: '',
      action: '',
      description: '',
      isActive: true,
    });
    setCurrentPermission(null);
    setEditMode(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
      create: 'success',
      read: 'info',
      update: 'warning',
      delete: 'error',
      manage: 'primary',
      view: 'info',
      configure: 'secondary',
      export: 'default',
    };
    return colors[action] || 'default';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Permission Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Define and manage system permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Add Permission
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search permissions by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Resource</InputLabel>
            <Select
              value={filterResource}
              label="Filter by Resource"
              onChange={(e) => setFilterResource(e.target.value)}
            >
              <MenuItem value="all">All Resources</MenuItem>
              {resourceOptions.map(resource => (
                <MenuItem key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button onClick={handleSearch} variant="outlined">
            Search
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Permission Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {permissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No permissions found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <PermissionIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                          <Typography fontWeight="medium">{permission.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={permission.code} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={permission.resource}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={permission.action}
                          size="small"
                          color={getActionColor(permission.action)}
                        />
                      </TableCell>
                      <TableCell>{permission.description || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          icon={permission.isActive ? <CheckCircle /> : <Cancel />}
                          label={permission.isActive ? 'Active' : 'Inactive'}
                          color={permission.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => handleToggleActive(permission)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditPermission(permission)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePermission(permission.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={totalElements}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </TableContainer>

      {/* Create/Edit Permission Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Permission' : 'Create New Permission'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Permission Name"
            fullWidth
            required
            value={newPermission.name}
            onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Permission Code"
            fullWidth
            required
            value={newPermission.code}
            onChange={(e) => setNewPermission({ ...newPermission, code: e.target.value.toUpperCase() })}
            helperText="Unique identifier in UPPER_CASE format (e.g., USER_CREATE)"
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Resource</InputLabel>
            <Select
              value={newPermission.resource}
              label="Resource"
              onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
            >
              {resourceOptions.map(resource => (
                <MenuItem key={resource} value={resource}>
                  {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Action</InputLabel>
            <Select
              value={newPermission.action}
              label="Action"
              onChange={(e) => setNewPermission({ ...newPermission, action: e.target.value })}
            >
              {actionOptions.map(action => (
                <MenuItem key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newPermission.description}
            onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newPermission.isActive}
                onChange={(e) => setNewPermission({ ...newPermission, isActive: e.target.checked })}
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="warning.dark">
              ⚠️ Note: Permissions define what actions users can perform on resources. Assign permissions to roles in the Role Management page.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editMode ? handleUpdatePermission : handleCreatePermission}
            variant="contained"
            disabled={!newPermission.name || !newPermission.code || !newPermission.resource || !newPermission.action}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Permissions;

