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
  Upload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { documentsAPI, documentSetsAPI, versionsAPI } from '@/lib/api';

export default function DocumentsAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    title: '',
    docCode: '',
    documentSetId: '',
  });

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');

  const { data: documents, isLoading } = useQuery('documents', () =>
    documentsAPI.getAll().then((res) => res.data)
  );

  const { data: documentSets } = useQuery('documentSets', () =>
    documentSetsAPI.getAll().then((res) => res.data)
  );

  const createMutation = useMutation(
    (data: any) => documentsAPI.create(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
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
    ({ id, data }: any) => documentsAPI.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
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
    (id: number) => documentsAPI.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setSnackbar({ open: true, message: t('messages.deleteSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.operationFailed');
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      },
    }
  );

  const uploadMutation = useMutation(
    (formData: FormData) => versionsAPI.upload(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('documents');
        setUploadDialogOpen(false);
        setUploadFile(null);
        setVersionNotes('');
        setSelectedDocument(null);
        setSnackbar({ open: true, message: t('messages.uploadSuccess'), severity: 'success' });
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || error.message || t('messages.uploadFailed');
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
      title: '',
      docCode: '',
      documentSetId: '',
    });
    setEditingDocument(null);
  };

  const handleOpenDialog = (doc?: any) => {
    if (doc) {
      setEditingDocument(doc);
      setFormData({
        title: doc.title,
        docCode: doc.docCode || '',
        documentSetId: doc.documentSet?.id || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleOpenUploadDialog = (doc: any) => {
    setSelectedDocument(doc);
    setUploadDialogOpen(true);
  };

  const handleSubmit = () => {
    const submitData: any = {
      title: formData.title.trim(),
      docCode: formData.docCode.trim(),
      documentSetId: parseInt(formData.documentSetId),
    };

    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleUpload = () => {
    if (!uploadFile || !selectedDocument) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('documentId', selectedDocument.id.toString());
    if (versionNotes) {
      formData.append('notes', versionNotes);
    }

    uploadMutation.mutate(formData);
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
            {t('documents.title')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {t('documents.createNew')}
          </Button>
        </Box>

        <Card>
          <CardContent>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : documents && documents.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('documents.title')}</TableCell>
                      <TableCell>{t('documents.code')}</TableCell>
                      <TableCell>{t('documents.documentSet')}</TableCell>
                      <TableCell>{t('documents.currentVersion')}</TableCell>
                      <TableCell align="right">{t('documents.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc: any) => (
                      <TableRow key={doc.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{doc.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={doc.docCode} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{doc.documentSet?.title || '-'}</TableCell>
                        <TableCell>
                          {doc.currentVersion ? (
                            <Box>
                              <Typography variant="body2">
                                v{doc.currentVersion.versionNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(doc.currentVersion.uploadedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('documents.noVersion')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenUploadDialog(doc)}
                            title={t('documents.uploadVersion')}
                          >
                            <UploadIcon />
                          </IconButton>
                          {doc.currentVersion && (
                            <>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => window.open(versionsAPI.getViewUrl(doc.currentVersion.id), '_blank')}
                                title={t('documents.view')}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => versionsAPI.download(doc.currentVersion.id)}
                                title={t('documents.download')}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </>
                          )}
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(doc)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(doc.id)}
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
              <Alert severity="info">{t('documents.noDocuments')}</Alert>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingDocument ? t('documents.edit') : t('documents.createNew')}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label={t('documents.title')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label={t('documents.code')}
                value={formData.docCode}
                onChange={(e) => setFormData({ ...formData, docCode: e.target.value })}
                required
              />
              <TextField
                fullWidth
                select
                label={t('documents.documentSet')}
                value={formData.documentSetId}
                onChange={(e) => setFormData({ ...formData, documentSetId: e.target.value })}
                required
              >
                {documentSets?.map((set: any) => (
                  <MenuItem key={set.id} value={set.id}>
                    {set.title}
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
              disabled={
                !formData.title ||
                !formData.docCode ||
                !formData.documentSetId ||
                createMutation.isLoading ||
                updateMutation.isLoading
              }
            >
              {editingDocument ? t('common.update') : t('common.create')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Version Dialog */}
        <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {t('documents.uploadVersion')} - {selectedDocument?.title}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                {uploadFile ? uploadFile.name : t('documents.selectFile')}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </Button>
              <TextField
                fullWidth
                label={t('documents.versionNotes')}
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                multiline
                rows={3}
                placeholder={t('documents.versionNotesPlaceholder')}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!uploadFile || uploadMutation.isLoading}
            >
              {t('common.upload')}
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
