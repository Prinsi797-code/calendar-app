import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  colors: {
    primary: string;
    primaryLight: string;
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    success: string;
    warning: string;
    diary: string;
    white: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setThemeState(savedTheme as Theme);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  const lightColors = {
    primary: '#FF5252',
    primaryLight: '#FF8A80',
    background: '#FFFFFF',
    cardBackground: '#F5F5F5',
    textPrimary: '#333333',
    textSecondary: '#666666',
    textTertiary: '#999999',
    border: '#e1e1e1ff',
    success: '#4CAF50',
    warning: '#FFF9C4',
    diary: '#9C27B0',
    white: '#FFFFFF',
  };

  const darkColors = {
    primary: '#FF5252',
    primaryLight: '#FF8A80',
    background: '#121212',
    cardBackground: '#1E1E1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#808080',
    border: '#2C2C2C',
    success: '#4CAF50',
    warning: '#FFF9C4',
    diary: '#9C27B0',
    white: '#FFFFFF',
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, currentYear, setCurrentYear }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
