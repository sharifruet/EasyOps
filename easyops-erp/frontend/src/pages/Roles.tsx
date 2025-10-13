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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Security as SecurityIcon,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import rbacService from '@services/rbacService';
import { Role, RoleRequest } from '@types/index';

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState<RoleRequest>({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  const { enqueueSnackbar } = useSnackbar();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // Mock data for now - uncomment when RBAC service is ready
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'System Administrator',
          code: 'SYSTEM_ADMIN',
          description: 'Full system access',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
        {
          id: '2',
          name: 'Organization Administrator',
          code: 'ORG_ADMIN',
          description: 'Organization-level administration',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
        {
          id: '3',
          name: 'User',
          code: 'USER',
          description: 'Standard user access',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
        {
          id: '4',
          name: 'Guest',
          code: 'GUEST',
          description: 'Limited guest access',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
      ];
      
      setRoles(mockRoles);
      setTotalElements(mockRoles.length);
      
      // Uncomment when service is ready:
      // const response = await rbacService.getAllRoles({ page, size: rowsPerPage });
      // setRoles(response.content);
      // setTotalElements(response.totalElements);
    } catch (error) {
      enqueueSnackbar('Failed to load roles', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page, rowsPerPage]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Get all roles (mock data for now)
      const mockRoles: Role[] = [
        {
          id: '1',
          name: 'System Administrator',
          code: 'SYSTEM_ADMIN',
          description: 'Full system access',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
        {
          id: '2',
          name: 'Organization Administrator',
          code: 'ORG_ADMIN',
          description: 'Organization-level administration',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
        {
          id: '3',
          name: 'User',
          code: 'USER',
          description: 'Standard user access',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
        {
          id: '4',
          name: 'Guest',
          code: 'GUEST',
          description: 'Limited guest access',
          isSystemRole: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          permissions: [],
        },
      ];
      
      if (!searchTerm.trim()) {
        setRoles(mockRoles);
        setTotalElements(mockRoles.length);
      } else {
        // Client-side search filtering
        const term = searchTerm.toLowerCase();
        const filtered = mockRoles.filter(role =>
          role.name.toLowerCase().includes(term) ||
          role.code.toLowerCase().includes(term) ||
          (role.description && role.description.toLowerCase().includes(term))
        );
        setRoles(filtered);
        setTotalElements(filtered.length);
        
        if (filtered.length > 0) {
          enqueueSnackbar(`Found ${filtered.length} role(s)`, { variant: 'success' });
        } else {
          enqueueSnackbar('No roles found matching your search', { variant: 'info' });
        }
      }
      
      // When service is ready, use this:
      // const response = await rbacService.searchRoles(searchTerm, { page, size: rowsPerPage });
      // setRoles(response.content);
      // setTotalElements(response.totalElements);
    } catch (error) {
      enqueueSnackbar('Search failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      // await rbacService.createRole(newRole);
      enqueueSnackbar('Role creation will be available when RBAC service is implemented', { variant: 'info' });
      setOpenDialog(false);
      resetForm();
      // fetchRoles();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create role';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleUpdateRole = async () => {
    if (!currentRole) return;
    
    try {
      // await rbacService.updateRole(currentRole.id, newRole);
      enqueueSnackbar('Role update will be available when RBAC service is implemented', { variant: 'info' });
      setOpenDialog(false);
      resetForm();
      // fetchRoles();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update role';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleEditRole = (role: Role) => {
    setCurrentRole(role);
    setNewRole({
      name: role.name,
      code: role.code,
      description: role.description || '',
      isActive: role.isActive,
    });
    setEditMode(true);
    setOpenDialog(true);
  };

  const handleToggleActive = async (role: Role) => {
    if (role.isSystemRole) {
      enqueueSnackbar('Cannot modify system roles', { variant: 'warning' });
      return;
    }
    
    try {
      // await rbacService.toggleRoleStatus(role.id);
      enqueueSnackbar('Role status toggle will be available when RBAC service is implemented', { variant: 'info' });
      // fetchRoles();
    } catch (error) {
      enqueueSnackbar('Failed to update role status', { variant: 'error' });
    }
  };

  const handleDeleteRole = async (roleId: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      enqueueSnackbar('Cannot delete system roles', { variant: 'warning' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        // await rbacService.deleteRole(roleId);
        enqueueSnackbar('Role deletion will be available when RBAC service is implemented', { variant: 'info' });
        // fetchRoles();
      } catch (error) {
        enqueueSnackbar('Failed to delete role', { variant: 'error' });
      }
    }
  };

  const resetForm = () => {
    setNewRole({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
    setCurrentRole(null);
    setEditMode(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Role Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage roles and their permissions
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
          Add Role
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search roles by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <Button onClick={handleSearch}>Search</Button>
            ),
          }}
        />
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
                  <TableCell>Role Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No roles found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                          <Typography fontWeight="medium">{role.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={role.code} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{role.description || '-'}</TableCell>
                      <TableCell>
                        {role.isSystemRole ? (
                          <Chip label="System" color="secondary" size="small" />
                        ) : (
                          <Chip label="Custom" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={role.isActive ? <CheckCircle /> : <Cancel />}
                          label={role.isActive ? 'Active' : 'Inactive'}
                          color={role.isActive ? 'success' : 'default'}
                          size="small"
                          onClick={() => handleToggleActive(role)}
                          sx={{ cursor: role.isSystemRole ? 'not-allowed' : 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${role.permissions?.length || 0} permissions`}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title={role.isSystemRole ? "System roles cannot be edited" : "Edit"}>
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditRole(role)}
                              disabled={role.isSystemRole}
                            >
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={role.isSystemRole ? "System roles cannot be deleted" : "Delete"}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRole(role.id, role.isSystemRole)}
                              disabled={role.isSystemRole}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </span>
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

      {/* Create/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
            fullWidth
            required
            value={newRole.name}
            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
            disabled={editMode && currentRole?.isSystemRole}
          />
          <TextField
            margin="dense"
            label="Role Code"
            fullWidth
            required
            value={newRole.code}
            onChange={(e) => setNewRole({ ...newRole, code: e.target.value.toUpperCase() })}
            disabled={editMode && currentRole?.isSystemRole}
            helperText="Unique identifier in UPPER_CASE format (e.g., SALES_MANAGER)"
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newRole.description}
            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={newRole.isActive}
                onChange={(e) => setNewRole({ ...newRole, isActive: e.target.checked })}
                disabled={editMode && currentRole?.isSystemRole}
              />
            }
            label="Active"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
            <Typography variant="caption" color="info.main">
              💡 Tip: Permissions can be assigned to roles after creation from the role details page.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={editMode ? handleUpdateRole : handleCreateRole}
            variant="contained"
            disabled={!newRole.name || !newRole.code}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Roles;

