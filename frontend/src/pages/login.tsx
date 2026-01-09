import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  IconButton,
  MenuItem,
  Select,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { uumColors } from '@/theme';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;
      login(user, access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${uumColors.blue} 0%, ${uumColors.darkBlue} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Select
            value={i18n.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            size="small"
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ms">Bahasa Melayu</MenuItem>
          </Select>
        </Box>

        <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                {t('app.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('auth.welcomeBack')}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label={t('auth.email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                required
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label={t('auth.password')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                sx={{ mb: 3 }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
              >
                {loading ? t('auth.loggingIn') : t('auth.loginButton')}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'rgba(0, 51, 102, 0.05)', borderRadius: 2 }}>
                <Typography variant="caption" fontWeight="bold" color="primary" display="block" sx={{ mb: 1 }}>
                  {t('auth.demoAccounts')}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>{t('auth.adminAccount')}</strong> admin@example.com / Admin@123
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  <strong>{t('auth.userAccount')}</strong> demo@example.com / Demo@123
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
