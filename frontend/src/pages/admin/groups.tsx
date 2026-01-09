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
  Chip,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { groupsAPI, usersAPI } from '@/lib/api';

export default function GroupsAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  const { data: groups, isLoading } = useQuery('groups', () =>
    groupsAPI.getAll().then((res) => res.data)
  );

  const { data: users } = useQuery('users', () =>
    usersAPI.getAll().then((res) => res.data)
  );

  const createMutation = useMutation(
    (data: any) => groupsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups');
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
    ({ id, data }: any) => groupsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups');
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
    (id: number) => groupsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('groups');
        setSnackbar({ open: true, message: t('messages.deleteSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      },
    }
  );

  const assignUsersMutation = useMutation(
    async ({ groupId, userIds }: { groupId: number; userIds: number[] }) => {
      // For each user, update their groups to include this group
      const promises = users
        ?.filter((u: any) => userIds.includes(u.id))
        .map((usr: any) => {
          const currentGroupIds = usr.groups?.map((g: any) => g.id) || [];
          const newGroupIds = Array.from(new Set([...currentGroupIds, groupId]));
          return usersAPI.assignGroups(usr.id, newGroupIds);
        }) || [];
      
      // Also remove users that were unselected
      const removePromises = users
        ?.filter((u: any) => !userIds.includes(u.id) && u.groups?.some((g: any) => g.id === groupId))
        .map((usr: any) => {
          const currentGroupIds = usr.groups?.map((g: any) => g.id) || [];
          const newGroupIds = currentGroupIds.filter((id: number) => id !== groupId);
          return usersAPI.assignGroups(usr.id, newGroupIds);
        }) || [];

      await Promise.all([...promises, ...removePromises]);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('groups');
        setMembersDialogOpen(false);
        setSelectedGroup(null);
        setSelectedUserIds([]);
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
      description: '',
    });
    setEditingGroup(null);
  };

  const handleOpenDialog = (group?: any) => {
    if (group) {
      setEditingGroup(group);
      setFormData({
        name: group.name,
        description: group.description || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const submitData: any = {
      name: formData.name.trim(),
    };

    if (formData.description && formData.description.trim()) {
      submitData.description = formData.description.trim();
    }

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleOpenMembersDialog = (group: any) => {
    setSelectedGroup(group);
    // Get all users that are members of this group
    const memberIds = users
      ?.filter((u: any) => u.groups?.some((g: any) => g.id === group.id))
      .map((u: any) => u.id) || [];
    setSelectedUserIds(memberIds);
    setMemberSearchQuery(''); // Reset search when opening dialog
    setMembersDialogOpen(true);
  };

  const handleAssignUsers = () => {
    if (selectedGroup) {
      assignUsersMutation.mutate({ 
        groupId: selectedGroup.id, 
        userIds: selectedUserIds 
      });
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

  // Filter groups based on search query
  const filteredGroups = groups?.filter((group: any) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      group.name?.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <MainLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('groups.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('groups.createNew')}
          </Button>
        </Box>

        {/* Search Bar */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder={t('groups.searchPlaceholder')}
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
            ) : filteredGroups.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('groups.name')}</TableCell>
                      <TableCell>{t('groups.description')}</TableCell>
                      <TableCell>{t('groups.members')}</TableCell>
                      <TableCell align="right">{t('documents.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredGroups.map((group: any) => {
                      // Count members of this group
                      const memberCount = users?.filter((u: any) => 
                        u.groups?.some((g: any) => g.id === group.id)
                      ).length || 0;

                      return (
                        <TableRow key={group.id} hover>
                          <TableCell>
                            <Typography fontWeight="medium">{group.name}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {group.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={`${memberCount} ${t('groups.members')}`}
                              size="small"
                              color={memberCount > 0 ? 'primary' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title={t('groups.manageMembers')} arrow>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleOpenMembersDialog(group)}
                                sx={{
                                  '&:hover': {
                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                  }
                                }}
                              >
                                <PeopleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('groups.edit')} arrow>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenDialog(group)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('groups.delete')} arrow>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(group.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : searchQuery ? (
              <Alert severity="info">
                {t('groups.noResults')} "{searchQuery}"
              </Alert>
            ) : (
              <Alert severity="info">{t('groups.noGroups')}</Alert>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingGroup ? t('groups.edit') : t('groups.createNew')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label={t('groups.name')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label={t('groups.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name || createMutation.isLoading || updateMutation.isLoading}
            >
              {editingGroup ? t('common.update') : t('common.create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Manage Members Dialog */}
        <Dialog open={membersDialogOpen} onClose={() => setMembersDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {t('groups.manageMembers')} - {selectedGroup?.name}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder={t('groups.searchMembersPlaceholder')}
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
              <TextField
                fullWidth
                select
                label={t('groups.selectMembers')}
                value={selectedUserIds}
                onChange={(e) => {
                  const value = e.target.value as any;
                  const numericValues = Array.isArray(value) 
                    ? value.map(v => typeof v === 'string' ? parseInt(v, 10) : v)
                    : [];
                  setSelectedUserIds(numericValues);
                }}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected: any) =>
                    users
                      ?.filter((u: any) => selected.includes(u.id))
                      .map((u: any) => u.name)
                      .join(', '),
                }}
                helperText={t('groups.selectMembersHelper')}
              >
                {users
                  ?.filter((usr: any) => {
                    if (!memberSearchQuery.trim()) return true;
                    const query = memberSearchQuery.toLowerCase();
                    return (
                      usr.name?.toLowerCase().includes(query) ||
                      usr.email?.toLowerCase().includes(query) ||
                      usr.role?.toLowerCase().includes(query)
                    );
                  })
                  .map((usr: any) => (
                    <MenuItem key={usr.id} value={usr.id}>
                      <Box display="flex" justifyContent="space-between" width="100%">
                        <Typography>{usr.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {usr.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMembersDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleAssignUsers}
              variant="contained"
              disabled={assignUsersMutation.isLoading}
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
