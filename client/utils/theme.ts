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
  background: '#FAF6F0',
  backgroundSecondary: '#FFFDF8',
  
  text: '#3D3222',
  textSecondary: '#7A6E5E',
  textMuted: '#A89B8C',
  
  cardBg: 'rgba(255,255,255,0.90)',
  cardBorder: 'rgba(0,0,0,0.05)',
  
  primary: '#8D9B6A',
  primaryLight: 'rgba(141,155,106,0.12)',
  
  success: '#6B8E5A',
  danger: '#D9684B',
  warning: '#C4A86C',
  
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E8E2D4',
  
  modalBg: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  background: '#1A1814',
  backgroundSecondary: '#242118',
  
  text: '#EDE8DC',
  textSecondary: 'rgba(237,232,220,0.7)',
  textMuted: 'rgba(237,232,220,0.4)',
  
  cardBg: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.08)',
  
  primary: '#9CAD78',
  primaryLight: 'rgba(156,173,120,0.15)',
  
  success: '#8D9B6A',
  danger: '#D9684B',
  warning: '#C4A86C',
  
  tabBarBg: '#1A1814',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  
  modalBg: '#28251C',
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