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
  background: '#F5F8F0',
  backgroundSecondary: '#FFFFFF',
  
  text: '#2D3A1F',
  textSecondary: '#5C6B4A',
  textMuted: '#8B9A7A',
  
  cardBg: 'rgba(255,255,255,0.92)',
  cardBorder: 'rgba(0,0,0,0.06)',
  
  primary: '#7CB342',
  primaryLight: 'rgba(124,179,66,0.12)',
  
  success: '#558B2F',
  danger: '#E8553D',
  warning: '#E8A840',
  
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#DCE4D0',
  
  modalBg: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  background: '#121A0F',
  backgroundSecondary: '#1C2418',
  
  text: '#E8F0DC',
  textSecondary: 'rgba(232,240,220,0.7)',
  textMuted: 'rgba(232,240,220,0.4)',
  
  cardBg: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.10)',
  
  primary: '#8BC34A',
  primaryLight: 'rgba(139,195,74,0.15)',
  
  success: '#7CB342',
  danger: '#E8553D',
  warning: '#E8A840',
  
  tabBarBg: '#121A0F',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  
  modalBg: '#222A1C',
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