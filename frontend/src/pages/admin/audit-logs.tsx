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
  CircularProgress,
  Alert,
  Chip,
  TextField,
  MenuItem,
  TablePagination,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/store/authStore';
import { auditAPI } from '@/lib/api';

const actionColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning'> = {
  LOGIN: 'success',
  LOGOUT: 'default',
  CREATE_DOCUMENT_SET: 'primary',
  UPDATE_DOCUMENT_SET: 'info',
  DELETE_DOCUMENT_SET: 'error',
  CREATE_DOCUMENT: 'primary',
  UPDATE_DOCUMENT: 'info',
  DELETE_DOCUMENT: 'error',
  UPLOAD_VERSION: 'success',
  DOWNLOAD_DOCUMENT: 'default',
  VIEW_DOCUMENT: 'info',
  CREATE_USER: 'primary',
  UPDATE_USER: 'info',
  DELETE_USER: 'error',
  CREATE_GROUP: 'primary',
  UPDATE_GROUP: 'info',
  DELETE_GROUP: 'error',
};

function AuditLogRow({ log }: { log: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {new Date(log.createdAt).toLocaleString()}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{log.user?.name || 'System'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {log.user?.email || '-'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={log.action}
            size="small"
            color={actionColors[log.action] || 'default'}
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">{log.entityType}</Typography>
          {log.entityId && (
            <Typography variant="caption" color="text.secondary">
              ID: {log.entityId}
            </Typography>
          )}
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">
            {log.ipAddress || '-'}
          </Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Details
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
                <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </Box>
              {log.userAgent && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    User Agent: {log.userAgent}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function AuditLogsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntityType, setFilterEntityType] = useState('');

  const { data: auditLogs, isLoading } = useQuery(['auditLogs', page, rowsPerPage], () =>
    auditAPI.getAll({ limit: rowsPerPage, offset: page * rowsPerPage }).then((res) => res.data)
  );

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Filter logs locally (in production, this should be done server-side)
  const filteredLogs = auditLogs?.filter((log: any) => {
    if (filterAction && log.action !== filterAction) return false;
    if (filterEntityType && log.entityType !== filterEntityType) return false;
    return true;
  }) || [];

  // Get unique actions and entity types for filters
  const uniqueActions = Array.from(new Set(auditLogs?.map((log: any) => log.action) || []));
  const uniqueEntityTypes = Array.from(new Set(auditLogs?.map((log: any) => log.entityType) || []));

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <MainLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('audit.title')}
          </Typography>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" gap={2}>
              <TextField
                select
                label={t('audit.filterAction')}
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                sx={{ minWidth: 200 }}
                size="small"
              >
                <MenuItem value="">{t('audit.allActions')}</MenuItem>
                {uniqueActions.map((action: any) => (
                  <MenuItem key={action} value={action}>
                    {action}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={t('audit.filterEntityType')}
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
                sx={{ minWidth: 200 }}
                size="small"
              >
                <MenuItem value="">{t('audit.allEntityTypes')}</MenuItem>
                {uniqueEntityTypes.map((type: any) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : filteredLogs.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width={50} />
                        <TableCell>{t('audit.timestamp')}</TableCell>
                        <TableCell>{t('audit.user')}</TableCell>
                        <TableCell>{t('audit.action')}</TableCell>
                        <TableCell>{t('audit.entity')}</TableCell>
                        <TableCell>{t('audit.ipAddress')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLogs.map((log: any) => (
                        <AuditLogRow key={log.id} log={log} />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={filteredLogs.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            ) : (
              <Alert severity="info">{t('audit.noLogs')}</Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
}
