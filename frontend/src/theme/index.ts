import { createTheme } from '@mui/material/styles';

// UUM (Universiti Utara Malaysia) Color Palette
// Based on official UUM branding: https://www.uum.edu.my/
export const uumColors = {
  blue: '#003366',        // Primary UUM Blue
  darkBlue: '#001F3F',    // Dark Blue
  lightBlue: '#0056B3',   // Light Blue
  yellow: '#FFD700',      // UUM Gold/Yellow
  lightYellow: '#FFF8DC', // Light Yellow
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#FFFFFF', // Changed from #F5F5F5 to white
  error: '#D32F2F',
  success: '#2E7D32',
  warning: '#ED6C02',
  info: '#0288D1',
};

export const theme = createTheme({
  palette: {
    primary: {
      main: uumColors.blue,
      dark: uumColors.darkBlue,
      light: uumColors.lightBlue,
      contrastText: uumColors.white,
    },
    secondary: {
      main: uumColors.yellow,
      dark: '#CCAA00',
      light: uumColors.lightYellow,
      contrastText: uumColors.darkGray,
    },
    error: {
      main: uumColors.error,
    },
    success: {
      main: uumColors.success,
    },
    warning: {
      main: uumColors.warning,
    },
    info: {
      main: uumColors.info,
    },
    background: {
      default: uumColors.white,
      paper: uumColors.white,
    },
    text: {
      primary: uumColors.darkGray,
      secondary: uumColors.mediumGray,
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      color: uumColors.blue,
    },
    h2: {
      fontWeight: 700,
      color: uumColors.blue,
    },
    h3: {
      fontWeight: 600,
      color: uumColors.blue,
    },
    h4: {
      fontWeight: 600,
      color: uumColors.darkGray,
    },
    h5: {
      fontWeight: 600,
      color: uumColors.darkGray,
    },
    h6: {
      fontWeight: 600,
      color: uumColors.darkGray,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 51, 102, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 51, 102, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: uumColors.white,
          borderRight: `1px solid ${uumColors.white}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          marginBottom: 4,
          '&.Mui-selected': {
            backgroundColor: uumColors.lightYellow,
            color: uumColors.blue,
            '&:hover': {
              backgroundColor: uumColors.yellow,
            },
          },
        },
      },
    },
  },
});

export default theme;
