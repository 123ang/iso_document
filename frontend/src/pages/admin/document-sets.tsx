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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { documentSetsAPI, groupsAPI } from '@/lib/api';

export default function DocumentSetsAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSet, setEditingSet] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    sortOrder: 0,
    groupIds: [] as number[],
  });

  const { data: documentSets, isLoading } = useQuery('documentSets', () =>
    documentSetsAPI.getAll().then((res) => res.data)
  );

  const { data: groups } = useQuery('groups', () =>
    groupsAPI.getAll().then((res) => res.data)
  );

  const createMutation = useMutation(
    (data: any) => documentSetsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documentSets');
        setDialogOpen(false);
        resetForm();
        setSnackbar({ open: true, message: t('messages.createSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        console.error('Create error:', error.response?.data);
      },
    }
  );

  const updateMutation = useMutation(
    ({ id, data }: any) => documentSetsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documentSets');
        setDialogOpen(false);
        resetForm();
        setSnackbar({ open: true, message: t('messages.updateSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        console.error('Update error:', error.response?.data);
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => documentSetsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documentSets');
        setSnackbar({ open: true, message: t('messages.deleteSuccess'), severity: 'success' });
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
      title: '',
      category: '',
      description: '',
      sortOrder: 0,
      groupIds: [],
    });
    setEditingSet(null);
  };

  const handleOpenDialog = (set?: any) => {
    if (set) {
      setEditingSet(set);
      setFormData({
        title: set.title,
        category: set.category || '',
        description: set.description || '',
        sortOrder: set.sortOrder || 0,
        groupIds: set.groups?.map((g: any) => g.id) || [],
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    // Clean up the data before sending
    const submitData: any = {
      title: formData.title.trim(),
    };

    // Only include optional fields if they have values
    if (formData.category && formData.category.trim()) {
      submitData.category = formData.category.trim();
    }

    if (formData.description && formData.description.trim()) {
      submitData.description = formData.description.trim();
    }

    // Ensure sortOrder is a valid number
    const sortOrder = Number(formData.sortOrder);
    if (!isNaN(sortOrder)) {
      submitData.sortOrder = sortOrder;
    }

    // Only include groupIds if array is not empty
    if (formData.groupIds && Array.isArray(formData.groupIds) && formData.groupIds.length > 0) {
      submitData.groupIds = formData.groupIds;
    }

    if (editingSet) {
      updateMutation.mutate({ id: editingSet.id, data: submitData });
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
            {t('documentSets.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('documentSets.createNew')}
          </Button>
        </Box>

        <Card>
          <CardContent>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : documentSets && documentSets.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('documentSets.name')}</TableCell>
                      <TableCell>{t('documentSets.category')}</TableCell>
                      <TableCell>{t('documentSets.groups')}</TableCell>
                      <TableCell>{t('documentSets.sortOrder')}</TableCell>
                      <TableCell align="right">{t('documents.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documentSets.map((set: any) => (
                      <TableRow key={set.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{set.title}</Typography>
                          {set.description && (
                            <Typography variant="caption" color="text.secondary">
                              {set.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{set.category}</TableCell>
                        <TableCell>
                          {set.groups?.map((group: any) => (
                            <Chip
                              key={group.id}
                              label={group.name}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </TableCell>
                        <TableCell>{set.sortOrder}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(set)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(set.id)}
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
              <Alert severity="info">{t('documentSets.noSets')}</Alert>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingSet ? t('documentSets.edit') : t('documentSets.createNew')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label={t('documentSets.name')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label={t('documentSets.category')}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
              <TextField
                fullWidth
                label={t('documentSets.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label={t('documentSets.sortOrder')}
                type="number"
                value={formData.sortOrder || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? 0 : parseInt(value, 10);
                  setFormData({ ...formData, sortOrder: isNaN(numValue) ? 0 : numValue });
                }}
              />
              <TextField
                fullWidth
                select
                label={t('documentSets.groups')}
                value={formData.groupIds}
                onChange={(e) => setFormData({ ...formData, groupIds: e.target.value as any })}
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
            <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.title || createMutation.isLoading || updateMutation.isLoading}
            >
              {editingSet ? t('common.update') : t('common.create')}
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
