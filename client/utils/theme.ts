// 主题配色方案

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  primary: string;
  primaryLight: string;
  success: string;
  danger: string;
  warning: string;
  tabBarBg: string;
  tabBarBorder: string;
  modalBg: string;
}

export const darkTheme: ThemeColors = {
  background: '#080B1A',
  backgroundSecondary: '#0F1330',

  text: '#E4E8F6',
  textSecondary: 'rgba(228,232,246,0.60)',
  textMuted: 'rgba(228,232,246,0.30)',

  cardBg: 'rgba(20,25,60,0.75)',
  cardBorder: 'rgba(0,229,255,0.15)',

  primary: '#00E5FF',
  primaryLight: 'rgba(0,229,255,0.12)',

  success: '#00E676',
  danger: '#FF5252',
  warning: '#FFD740',

  tabBarBg: 'rgba(8,11,26,0.96)',
  tabBarBorder: 'rgba(0,229,255,0.06)',

  modalBg: '#141830',
};

export const lightTheme: ThemeColors = {
  background: '#F4F6FB',
  backgroundSecondary: '#FFFFFF',

  text: '#1A1D2E',
  textSecondary: '#5A5E72',
  textMuted: '#999DB5',

  cardBg: 'rgba(255,255,255,0.88)',
  cardBorder: 'rgba(0,102,255,0.10)',

  primary: '#2266FF',
  primaryLight: 'rgba(34,102,255,0.08)',

  success: '#00C853',
  danger: '#FF3D50',
  warning: '#FF9100',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E4E8F0',

  modalBg: '#FFFFFF',
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme';

export const ThemeService = {
  async getTheme(): Promise<ThemeMode> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as ThemeMode) || 'dark';
    } catch {
      return 'dark';
    }
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  },
};