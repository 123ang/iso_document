import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Folder as FolderIcon } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { documentSetsAPI } from '@/lib/api';
import { uumColors } from '@/theme';

export default function MyDocumentsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { data: documentSets, isLoading } = useQuery('myDocumentSets', () =>
    documentSetsAPI.getMy().then((res) => res.data)
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          {t('nav.myDocuments')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {t('documentSets.title')}
        </Typography>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : documentSets && documentSets.length > 0 ? (
          <Grid container spacing={3}>
            {documentSets.map((set: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={set.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    height: '100%',
                    '&:hover': {
                      boxShadow: 6,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s',
                    },
                  }}
                  onClick={() => router.push(`/documents/${set.id}`)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FolderIcon
                        sx={{
                          fontSize: 40,
                          color: uumColors.yellow,
                          mr: 2,
                        }}
                      />
                      <Typography variant="h6" fontWeight="bold">
                        {set.title}
                      </Typography>
                    </Box>
                    {set.category && (
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor: uumColors.lightYellow,
                          color: uumColors.darkBlue,
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block',
                          mb: 1,
                        }}
                      >
                        {set.category}
                      </Typography>
                    )}
                    {set.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {set.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">{t('documentSets.noSets')}</Alert>
        )}
      </Box>
    </MainLayout>
  );
}
