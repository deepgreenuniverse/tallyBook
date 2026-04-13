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
}

export const lightTheme: ThemeColors = {
  background: '#F5F6FA',
  backgroundSecondary: '#FFFFFF',
  
  text: '#1A1A2E',
  textSecondary: '#666666',
  textMuted: '#999999',
  
  cardBg: 'rgba(255,255,255,0.9)',
  cardBorder: 'rgba(0,0,0,0.08)',
  
  primary: '#E94560',
  primaryLight: 'rgba(233,69,96,0.15)',
  
  success: '#4CAF50',
  danger: '#FF5252',
  warning: '#FFA726',
  
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
};

export const darkTheme: ThemeColors = {
  background: '#1A1A2E',
  backgroundSecondary: '#16213E',
  
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textMuted: 'rgba(255,255,255,0.4)',
  
  cardBg: 'rgba(255,255,255,0.08)',
  cardBorder: 'rgba(255,255,255,0.12)',
  
  primary: '#FF6B6B',
  primaryLight: 'rgba(255,107,107,0.15)',
  
  success: '#6BCB77',
  danger: '#FF6B6B',
  warning: '#FFA94D',
  
  tabBarBg: '#1A1A2E',
  tabBarBorder: 'rgba(255,255,255,0.08)',
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
