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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { groupsAPI } from '@/lib/api';

export default function GroupsAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { data: groups, isLoading } = useQuery('groups', () =>
    groupsAPI.getAll().then((res) => res.data)
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

        <Card>
          <CardContent>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : groups && groups.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('groups.name')}</TableCell>
                      <TableCell>{t('groups.description')}</TableCell>
                      <TableCell align="right">{t('documents.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groups.map((group: any) => (
                      <TableRow key={group.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{group.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {group.description || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(group)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(group.id)}
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
