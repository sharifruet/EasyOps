import React, { useCallback, useEffect, useState } from 'react';
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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle,
  Cancel,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import userService from '@services/userService';
import rbacService from '@services/rbacService';
import { User, UserCreateRequest, Role } from '@types/index';
import { useAuth } from '@contexts/AuthContext';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newUser, setNewUser] = useState<UserCreateRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [assignRolesOpen, setAssignRolesOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [assignedRoleIds, setAssignedRoleIds] = useState<string[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, Role[]>>({});

  const { enqueueSnackbar } = useSnackbar();
  const { canManageResource } = useAuth();
  const canManageUsers = canManageResource('users');
  const canManageRoles = canManageResource('roles');

  const preloadUserRoles = useCallback(
    async (userList: User[]) => {
      const missingUsers = userList.filter((user) => !userRolesMap[user.id]);
      if (missingUsers.length === 0) {
        return;
      }

      try {
        const entries = await Promise.all(
          missingUsers.map(async (user) => {
            const roles = await rbacService.getUserRoles(user.id);
            return [user.id, roles] as [string, Role[]];
          })
        );

        setUserRolesMap((prev) => {
          const next = { ...prev };
          entries.forEach(([userId, roles]) => {
            next[userId] = roles;
          });
          return next;
        });
      } catch (error) {
        console.error('Failed to preload user roles', error);
      }
    },
    [userRolesMap]
  );

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({
        page,
        size: rowsPerPage,
      });
      const fetchedUsers = response.content || [];
      setUsers(fetchedUsers);
      setTotalElements(response.totalElements);
      preloadUserRoles(fetchedUsers);
    } catch (error) {
      enqueueSnackbar('Failed to load users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await userService.searchUsers(searchTerm, {
        page,
        size: rowsPerPage,
      });
      const fetchedUsers = response.content || [];
      setUsers(fetchedUsers);
      setTotalElements(response.totalElements);
      preloadUserRoles(fetchedUsers);
    } catch (error) {
      enqueueSnackbar('Search failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!canManageUsers) {
      enqueueSnackbar('You do not have permission to manage users', { variant: 'warning' });
      return;
    }

    try {
      await userService.createUser(newUser);
      enqueueSnackbar('User created successfully', { variant: 'success' });
      setOpenDialog(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      });
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create user';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const handleToggleActive = async (user: User) => {
    if (!canManageUsers) {
      enqueueSnackbar('You do not have permission to manage users', { variant: 'warning' });
      return;
    }

    try {
      if (user.isActive) {
        await userService.deactivateUser(user.id);
        enqueueSnackbar('User deactivated', { variant: 'success' });
      } else {
        await userService.activateUser(user.id);
        enqueueSnackbar('User activated', { variant: 'success' });
      }
      fetchUsers();
    } catch (error) {
      enqueueSnackbar('Failed to update user status', { variant: 'error' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!canManageUsers) {
      enqueueSnackbar('You do not have permission to manage users', { variant: 'warning' });
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsers();
      } catch (error) {
        enqueueSnackbar('Failed to delete user', { variant: 'error' });
      }
    }
  };

  const handleManageRoles = async (user: User) => {
    if (!canManageRoles) {
      enqueueSnackbar('You do not have permission to manage roles', { variant: 'warning' });
      return;
    }

    setSelectedUser(user);
    setAssignRolesOpen(true);
    setRolesLoading(true);

    try {
      const [activeRoles, userRoles] = await Promise.all([
        rbacService.getActiveRoles(),
        rbacService.getUserRoles(user.id),
      ]);

      const mergedRoles = [...activeRoles];
      userRoles.forEach((role) => {
        if (!mergedRoles.some((existing) => existing.id === role.id)) {
          mergedRoles.push(role);
        }
      });

      setAvailableRoles(mergedRoles);
      setAssignedRoleIds(userRoles.map((role) => role.id));
      setUserRolesMap((prev) => ({ ...prev, [user.id]: userRoles }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to load user roles';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) {
      return;
    }

    if (!canManageRoles) {
      enqueueSnackbar('You do not have permission to manage roles', { variant: 'warning' });
      return;
    }

    try {
      setRolesLoading(true);
      let updatedRoles: Role[] = [];

      if (assignedRoleIds.length > 0) {
        updatedRoles = await rbacService.assignRolesToUser({
          userId: selectedUser.id,
          roleIds: assignedRoleIds,
        });
      } else {
        await rbacService.removeAllRolesFromUser(selectedUser.id);
      }

      if (assignedRoleIds.length === 0) {
        updatedRoles = [];
      }

      setUserRolesMap((prev) => ({
        ...prev,
        [selectedUser.id]: updatedRoles,
      }));

      enqueueSnackbar('User roles updated successfully', { variant: 'success' });
      setAssignRolesOpen(false);
      setSelectedUser(null);
      setAssignedRoleIds([]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update user roles';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setRolesLoading(false);
    }
  };

  const handleCloseRolesDialog = () => {
    setAssignRolesOpen(false);
    setSelectedUser(null);
    setAssignedRoleIds([]);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
        <Tooltip
          title={
            canManageUsers
              ? 'Create a new user'
              : 'You do not have permission to create users'
          }
        >
          <span>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              disabled={!canManageUsers}
            >
              Add User
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search users by name, email, or username..."
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
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Roles</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary" py={4}>
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography fontWeight="medium">{user.username}</Typography>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.firstName || user.lastName
                          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip
                          title={
                            canManageUsers
                              ? 'Toggle user status'
                              : 'You do not have permission to manage users'
                          }
                        >
                          <span style={{ display: 'inline-block' }}>
                            <Chip
                              icon={user.isActive ? <CheckCircle /> : <Cancel />}
                              label={user.isActive ? 'Active' : 'Inactive'}
                              color={user.isActive ? 'success' : 'default'}
                              size="small"
                              onClick={canManageUsers ? () => handleToggleActive(user) : undefined}
                              sx={{
                                cursor: canManageUsers ? 'pointer' : 'not-allowed',
                                opacity: canManageUsers ? 1 : 0.75,
                              }}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {userRolesMap[user.id]?.length ? (
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {userRolesMap[user.id].map((role) => (
                              <Chip key={role.id} label={role.code} size="small" variant="outlined" />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No roles
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip
                          title={
                            canManageRoles
                              ? 'Manage user roles'
                              : 'You do not have permission to manage roles'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => handleManageRoles(user)}
                              disabled={!canManageRoles}
                            >
                              <SecurityIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            canManageUsers
                              ? 'Edit user'
                              : 'You do not have permission to manage users'
                          }
                        >
                          <span>
                            <IconButton size="small" color="primary" disabled={!canManageUsers}>
                              <EditIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            canManageUsers
                              ? 'Delete user'
                              : 'You do not have permission to manage users'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={!canManageUsers}
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

      {/* Create User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            fullWidth
            required
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            required
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            required
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            value={newUser.firstName}
            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={newUser.lastName}
            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={
              !canManageUsers ||
              !newUser.username.trim() ||
              !newUser.email.trim() ||
              !newUser.password.trim()
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={assignRolesOpen} onClose={handleCloseRolesDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Roles{selectedUser ? ` – ${selectedUser.username}` : ''}
        </DialogTitle>
        <DialogContent>
          {rolesLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                multiple
                options={availableRoles}
                value={availableRoles.filter((role) => assignedRoleIds.includes(role.id))}
                onChange={(_, selected) => setAssignedRoleIds(selected.map((role) => role.id))}
                getOptionLabel={(option) => `${option.name} (${option.code})`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField {...params} label="Roles" placeholder="Assign roles" margin="normal" />
                )}
              />
              <Typography variant="caption" color="text.secondary">
                Users inherit permissions from the roles assigned here.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRolesDialog}>Cancel</Button>
          <Button
            onClick={handleSaveRoles}
            variant="contained"
            disabled={rolesLoading || !canManageRoles || !selectedUser}
          >
            {rolesLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;

