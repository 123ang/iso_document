import { useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Select,
  Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Assessment as AuditIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Language as LanguageIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { uumColors } from '@/theme';
import { documentSetsAPI } from '@/lib/api';

const DRAWER_WIDTH = 260;

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [documentSetsOpen, setDocumentSetsOpen] = useState(true);

  const isAdmin = user?.role === 'admin';

  // Fetch document sets for sidebar
  const { data: documentSets } = useQuery(
    'myDocumentSets',
    () => documentSetsAPI.getMy().then((res) => res.data),
    { enabled: !!user }
  );

  const menuItems = [
    { key: 'dashboard', label: t('nav.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { key: 'myDocuments', label: t('nav.myDocuments'), icon: <FolderIcon />, path: '/my-documents' },
  ];

  const adminMenuItems = isAdmin
    ? [
        { key: 'documentSets', label: t('nav.documentSets'), icon: <FolderIcon />, path: '/admin/document-sets' },
        { key: 'documents', label: t('nav.documents'), icon: <DocumentIcon />, path: '/admin/documents' },
        { key: 'users', label: t('nav.users'), icon: <PeopleIcon />, path: '/admin/users' },
        { key: 'groups', label: t('nav.groups'), icon: <GroupIcon />, path: '/admin/groups' },
        { key: 'audit', label: t('nav.auditLogs'), icon: <AuditIcon />, path: '/admin/audit-logs' },
      ]
    : [];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: uumColors.blue,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(!drawerOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'white' }}>
            {t('app.title')}
          </Typography>

          <Select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            size="small"
            sx={{
              color: 'white',
              mr: 2,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' },
              '& .MuiSvgIcon-root': { color: 'white' },
            }}
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="ms">MS</MenuItem>
          </Select>

          <IconButton color="inherit" onClick={handleMenuClick}>
            <AccountIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2">{user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" display="block" color="primary">
                {user?.role === 'admin' ? t('users.admin') : t('users.user')}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('auth.logout')}</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="persistent"
        open={drawerOpen}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItemButton
                key={item.key}
                selected={router.pathname === item.path}
                onClick={() => router.push(item.path)}
                sx={{ mb: 0.5 }}
              >
                <ListItemIcon sx={{ color: router.pathname === item.path ? uumColors.blue : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}

            {/* Document Sets in Sidebar */}
            {documentSets && documentSets.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <ListItemButton onClick={() => setDocumentSetsOpen(!documentSetsOpen)}>
                  <ListItemIcon>
                    <FolderIcon />
                  </ListItemIcon>
                  <ListItemText primary={t('nav.documentSets')} />
                  {documentSetsOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={documentSetsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {documentSets.map((set: any) => (
                      <ListItemButton
                        key={set.id}
                        selected={router.pathname === `/documents/${set.id}`}
                        onClick={() => router.push(`/documents/${set.id}`)}
                        sx={{ pl: 4, mb: 0.5 }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <FolderIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={set.title}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </>
            )}
          </List>

          {isAdmin && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" color="text.secondary" sx={{ px: 2, fontWeight: 'bold' }}>
                {t('nav.admin')}
              </Typography>
              <List>
                {adminMenuItems.map((item) => (
                  <ListItemButton
                    key={item.key}
                    selected={router.pathname === item.path}
                    onClick={() => router.push(item.path)}
                    sx={{ mb: 0.5 }}
                  >
                    <ListItemIcon sx={{ color: router.pathname === item.path ? uumColors.blue : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                ))}
              </List>
            </>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { sm: drawerOpen ? 0 : `-${DRAWER_WIDTH}px` },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
