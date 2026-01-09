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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
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
      assignGroupsMutation.mutate({ userId: selectedUser.id, groupIds: selectedGroups });
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

        <Card>
          <CardContent>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : users && users.length > 0 ? (
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
                    {users.map((usr: any) => (
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
                            <IconButton
                              size="small"
                              onClick={() => handleOpenGroupDialog(usr)}
                              title={t('users.manageGroups')}
                            >
                              <GroupIcon fontSize="small" />
                            </IconButton>
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
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(usr)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(usr.id)}
                            disabled={usr.id === user?.id}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                select
                label={t('users.groups')}
                value={selectedGroups}
                onChange={(e) => setSelectedGroups(e.target.value as any)}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected: any) =>
                    groups
                      ?.filter((g: any) => selected.includes(g.id))
                      .map((g: any) => g.name)
                      .join(', '),
                }}
              >
                {groups?.map((group: any) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
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
