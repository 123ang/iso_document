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
import {
  Folder as FolderIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Assessment as AuditIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { documentSetsAPI, documentsAPI, usersAPI, auditAPI } from '@/lib/api';
import { uumColors } from '@/theme';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: 2,
              p: 2,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const { data: documentSets, isLoading: loadingSets } = useQuery(
    'myDocumentSets',
    () => documentSetsAPI.getMy().then((res) => res.data)
  );

  const { data: allDocuments, isLoading: loadingDocs } = useQuery(
    'allDocuments',
    () => documentsAPI.getAll().then((res) => res.data),
    { enabled: user?.role === 'admin' }
  );

  const { data: allUsers, isLoading: loadingUsers } = useQuery(
    'allUsers',
    () => usersAPI.getAll().then((res) => res.data),
    { enabled: user?.role === 'admin' }
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
          {t('nav.dashboard')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('auth.welcomeBack')}, {user?.name}
        </Typography>

        <Grid container spacing={3}>
          {loadingSets ? (
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={6} lg={3}>
                <StatCard
                  title={t('documentSets.title')}
                  value={documentSets?.length || 0}
                  icon={<FolderIcon fontSize="large" />}
                  color={uumColors.blue}
                />
              </Grid>

              {user?.role === 'admin' && (
                <>
                  <Grid item xs={12} md={6} lg={3}>
                    <StatCard
                      title={t('documents.title')}
                      value={allDocuments?.length || 0}
                      icon={<DocumentIcon fontSize="large" />}
                      color={uumColors.yellow}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={3}>
                    <StatCard
                      title={t('users.title')}
                      value={allUsers?.length || 0}
                      icon={<PeopleIcon fontSize="large" />}
                      color={uumColors.info}
                    />
                  </Grid>

                  <Grid item xs={12} md={6} lg={3}>
                    <StatCard
                      title={t('audit.title')}
                      value={0}
                      icon={<AuditIcon fontSize="large" />}
                      color={uumColors.success}
                    />
                  </Grid>
                </>
              )}
            </>
          )}

          {/* My Document Sets */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {t('nav.myDocuments')}
                </Typography>
                {loadingSets ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : documentSets && documentSets.length > 0 ? (
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    {documentSets.map((set: any) => (
                      <Grid item xs={12} sm={6} md={4} key={set.id}>
                        <Card
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              boxShadow: 4,
                              transform: 'translateY(-2px)',
                              transition: 'all 0.2s',
                            },
                          }}
                          onClick={() => router.push(`/documents/${set.id}`)}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                              <FolderIcon sx={{ color: uumColors.yellow, mr: 1 }} />
                              <Typography variant="h6" fontWeight="bold">
                                {set.title}
                              </Typography>
                            </Box>
                            {set.category && (
                              <Typography variant="caption" color="text.secondary" display="block">
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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainLayout>
  );
}
