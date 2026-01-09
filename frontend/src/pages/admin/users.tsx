import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { usersAPI, groupsAPI } from '@/lib/api';

export default function UsersAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true,
  });

  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');

  const { data: users, isLoading } = useQuery('users', () =>
    usersAPI.getAll().then((res) => res.data)
  );

  const { data: groups } = useQuery('groups', () =>
    groupsAPI.getAll().then((res) => res.data)
  );

  const createMutation = useMutation(
    (data: any) => usersAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setDialogOpen(false);
        resetForm();
        setSnackbar({ open: true, message: t('messages.createSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: any) => usersAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setDialogOpen(false);
        resetForm();
        setSnackbar({ open: true, message: t('messages.updateSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => usersAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setSnackbar({ open: true, message: t('messages.deleteSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      },
    }
  );

  const assignGroupsMutation = useMutation(
    ({ userId, groupIds }: any) => usersAPI.assignGroups(userId, groupIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setGroupDialogOpen(false);
        setSelectedUser(null);
        setSelectedGroups([]);
        setSnackbar({ open: true, message: t('messages.updateSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      },
    }
  );

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      isActive: true,
    });
    setEditingUser(null);
  };

  const handleOpenDialog = (usr?: any) => {
    if (usr) {
      setEditingUser(usr);
      setFormData({
        name: usr.name,
        email: usr.email,
        password: '', // Don't populate password when editing
        role: usr.role,
        isActive: usr.isActive,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleOpenGroupDialog = (usr: any) => {
    setSelectedUser(usr);
    setSelectedGroups(usr.groups?.map((g: any) => g.id) || []);
    setGroupSearchQuery(''); // Reset search when opening dialog
    setGroupDialogOpen(true);
  };

  const handleSubmit = () => {
    const submitData: any = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      isActive: formData.isActive,
    };

    // Only include password if it's set (for new users or when changing password)
    if (formData.password) {
      submitData.password = formData.password;
    }

    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleAssignGroups = () => {
    if (selectedUser) {
      // Ensure groupIds are numbers
      const groupIds = selectedGroups.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
      assignGroupsMutation.mutate({ userId: selectedUser.id, groupIds });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t('messages.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Filter users based on search query
  const filteredUsers = users?.filter((usr: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      usr.name?.toLowerCase().includes(query) ||
      usr.email?.toLowerCase().includes(query) ||
      usr.role?.toLowerCase().includes(query) ||
      usr.groups?.some((g: any) => g.name?.toLowerCase().includes(query))
    );
  }) || [];

  return (
    <MainLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('users.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('users.createNew')}
          </Button>
        </Box>

        {/* Search Bar */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder={t('users.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredUsers.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('users.name')}</TableCell>
                      <TableCell>{t('users.email')}</TableCell>
                      <TableCell>{t('users.role')}</TableCell>
                      <TableCell>{t('users.groups')}</TableCell>
                      <TableCell>{t('users.status')}</TableCell>
                      <TableCell align="right">{t('documents.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((usr: any) => (
                      <TableRow key={usr.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{usr.name}</Typography>
                        </TableCell>
                        <TableCell>{usr.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={usr.role}
                            color={usr.role === 'admin' ? 'secondary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {usr.groups?.slice(0, 2).map((group: any) => (
                              <Chip
                                key={group.id}
                                label={group.name}
                                size="small"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                            {usr.groups?.length > 2 && (
                              <Typography variant="caption" color="text.secondary">
                                +{usr.groups.length - 2}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={usr.isActive ? t('users.active') : t('users.inactive')}
                            color={usr.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t('users.manageGroups')} arrow>
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleOpenGroupDialog(usr)}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                }
                              }}
                            >
                              <GroupIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('users.edit')} arrow>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenDialog(usr)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('users.delete')} arrow>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(usr.id)}
                                disabled={usr.id === user?.id}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : searchQuery ? (
              <Alert severity="info">
                {t('users.noResults')} "{searchQuery}"
              </Alert>
            ) : (
              <Alert severity="info">{t('users.noUsers')}</Alert>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingUser ? t('users.edit') : t('users.createNew')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label={t('users.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label={t('users.email')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label={editingUser ? t('users.newPassword') : t('users.password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                helperText={editingUser ? t('users.passwordHelper') : ''}
              />
              <TextField
                fullWidth
                select
                label={t('users.role')}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <MenuItem value="user">{t('users.roleUser')}</MenuItem>
                <MenuItem value="admin">{t('users.roleAdmin')}</MenuItem>
              </TextField>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label={t('users.active')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={
                !formData.name ||
                !formData.email ||
                (!editingUser && !formData.password) ||
                createMutation.isLoading ||
                updateMutation.isLoading
              }
            >
              {editingUser ? t('common.update') : t('common.create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Assign Groups Dialog */}
        <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {t('users.manageGroups')} - {selectedUser?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder={t('users.searchGroupsPlaceholder')}
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
              <TextField
                fullWidth
                select
                label={t('users.groups')}
                value={selectedGroups}
                onChange={(e) => {
                  const value = e.target.value as any;
                  // Ensure values are numbers
                  const numericValues = Array.isArray(value) 
                    ? value.map(v => typeof v === 'string' ? parseInt(v, 10) : v)
                    : [];
                  setSelectedGroups(numericValues);
                }}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected: any) =>
                    groups
                      ?.filter((g: any) => selected.includes(g.id))
                      .map((g: any) => g.name)
                      .join(', '),
                }}
              >
                {groups
                  ?.filter((group: any) => {
                    if (!groupSearchQuery.trim()) return true;
                    const query = groupSearchQuery.toLowerCase();
                    return (
                      group.name?.toLowerCase().includes(query) ||
                      group.description?.toLowerCase().includes(query)
                    );
                  })
                  .map((group: any) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.name}
                      {group.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          - {group.description}
                        </Typography>
                      )}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGroupDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleAssignGroups}
              variant="contained"
              disabled={assignGroupsMutation.isLoading}
            >
              {t('common.save')}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
