// 主题配色方案

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  // 背景
  background: string;
  backgroundSecondary: string;
  
  // 文字
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // 卡片
  cardBg: string;
  cardBorder: string;
  
  // 主题色
  primary: string;
  primaryLight: string;
  
  // 状态色
  success: string;
  danger: string;
  warning: string;
  
  // Tab Bar
  tabBarBg: string;
  tabBarBorder: string;
  
  // 弹窗
  modalBg: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8F6F0',
  backgroundSecondary: '#FFFFFF',
  
  text: '#2D2D2D',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  cardBg: 'rgba(255,255,255,0.95)',
  cardBorder: 'rgba(0,0,0,0.06)',
  
  primary: '#C8963E',
  primaryLight: 'rgba(200,150,62,0.12)',
  
  success: '#4CAF50',
  danger: '#E8553D',
  warning: '#E8A840',
  
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E8E4DA',
  
  modalBg: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  background: '#121212',
  backgroundSecondary: '#1C1C1E',
  
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  
  cardBg: 'rgba(255,255,255,0.08)',
  cardBorder: 'rgba(255,255,255,0.12)',
  
  primary: '#D4A853',
  primaryLight: 'rgba(212,168,83,0.15)',
  
  success: '#6BCB77',
  danger: '#E8553D',
  warning: '#E8A840',
  
  tabBarBg: '#121212',
  tabBarBorder: 'rgba(255,255,255,0.08)',
  
  modalBg: '#2C2C2E',
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@app_theme';

export const ThemeService = {
  async getTheme(): Promise<ThemeMode> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as ThemeMode) || 'light';
    } catch {
      return 'light';
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