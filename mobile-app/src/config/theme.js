import { MD3DarkTheme } from 'react-native-paper';

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8ab4f8',
    primaryContainer: '#1e3a5f',
    secondary: '#aecbfa',
    secondaryContainer: '#2d3e50',
    background: '#0f1419',
    surface: '#1a1f26',
    surfaceVariant: '#242b33',
    error: '#f28b82',
    errorContainer: '#601410',
    onPrimary: '#0f1419',
    onSecondary: '#0f1419',
    onBackground: '#e8eaed',
    onSurface: '#e8eaed',
    onSurfaceVariant: '#9aa0a6',
    outline: '#5f6368',
    success: '#81c995',
    warning: '#fdd663',
    card: '#1a1f26',
    border: '#2d3e50',
  },
  roundness: 16,
};

export const colors = {
  dark: {
    background: '#0f1419',
    surface: '#1a1f26',
    card: '#1a1f26',
    cardElevated: '#242b33',
    primary: '#8ab4f8',
    primaryDark: '#1e3a5f',
    secondary: '#aecbfa',
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    textTertiary: '#5f6368',
    border: '#2d3e50',
    success: '#81c995',
    error: '#f28b82',
    warning: '#fdd663',
    info: '#8ab4f8',
    divider: '#2d3e50',
    overlay: 'rgba(0, 0, 0, 0.5)',
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};
