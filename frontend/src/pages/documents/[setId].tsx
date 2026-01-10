import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { documentSetsAPI, documentsAPI, versionsAPI } from '@/lib/api';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setId } = router.query;
  const { isAuthenticated } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const { data: documentSet, isLoading: loadingSet } = useQuery(
    ['documentSet', setId],
    () => documentSetsAPI.getOne(Number(setId)).then((res) => res.data),
    { enabled: !!setId }
  );

  const { data: documents, isLoading: loadingDocs } = useQuery(
    ['documents', setId],
    () => documentsAPI.getByDocumentSet(Number(setId)).then((res) => res.data),
    { enabled: !!setId }
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const filteredDocuments = documents?.filter((doc: any) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.docCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = async (versionId: number) => {
    try {
      setLoadingPreview(true);
      const url = await versionsAPI.getViewUrl(versionId);
      setPreviewUrl(url);
      setPreviewOpen(true);
    } catch (error: any) {
      console.error('View error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load document preview';
      alert(errorMessage);
      setPreviewUrl(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    // Clean up blob URL to free memory
    if (previewUrl && previewUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewOpen(false);
  };

  const handleDownload = async (versionId: number) => {
    try {
      await versionsAPI.download(versionId);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(error.response?.data?.message || 'Failed to download document');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {loadingSet ? <CircularProgress size={24} /> : documentSet?.title}
            </Typography>
            {documentSet?.description && (
              <Typography variant="body2" color="text.secondary">
                {documentSet.description}
              </Typography>
            )}
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight="bold">
                {t('documents.title')}
              </Typography>
              <TextField
                size="small"
                placeholder={t('documents.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 300 }}
              />
            </Box>

            {loadingDocs ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('documents.documentName')}</TableCell>
                      <TableCell>{t('documents.documentCode')}</TableCell>
                      <TableCell>{t('documents.currentVersion')}</TableCell>
                      <TableCell>{t('documents.fileName')}</TableCell>
                      <TableCell>{t('documents.modifiedDate')}</TableCell>
                      <TableCell align="right">{t('documents.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredDocuments.map((doc: any) => (
                      <TableRow key={doc.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">{doc.title}</Typography>
                        </TableCell>
                        <TableCell>
                          {doc.docCode && (
                            <Chip label={doc.docCode} size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.currentVersion && (
                            <Chip
                              label={doc.currentVersion.versionLabel}
                              size="small"
                              color="primary"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.currentVersion ? (
                            <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                              {doc.currentVersion.originalFilename || '-'}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {t('documents.noFile')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.updatedAt &&
                            new Date(doc.updatedAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </TableCell>
                        <TableCell align="right">
                          {doc.currentVersion && (
                            <>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleView(doc.currentVersion.id)}
                                title={t('documents.view')}
                              >
                                <ViewIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => handleDownload(doc.currentVersion.id)}
                                title={t('documents.download')}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </>
                          )}
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

        {/* Preview Dialog */}
        <Dialog
          open={previewOpen}
          onClose={handleClosePreview}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{t('documents.view')}</Typography>
              <Button onClick={handleClosePreview}>{t('common.close')}</Button>
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingPreview ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
              </Box>
            ) : previewUrl ? (
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '80vh',
                  border: 'none',
                }}
                title="Document Preview"
                onError={() => {
                  alert('Failed to load document preview');
                  handleClosePreview();
                }}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </Box>
    </MainLayout>
  );
}
