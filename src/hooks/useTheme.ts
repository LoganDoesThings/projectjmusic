import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getColors } from '../theme/colors';
import { logWarn } from '../utils/logger';

/**
 * Custom hook to manage the application theme (dark/light mode)
 * @returns Object containing isDarkMode, toggleTheme function, and color palette
 */
export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  /**
   * Load saved theme preference from AsyncStorage
   */
  const loadTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        setIsDarkMode(storedTheme === 'dark');
      }
    } catch (e) {
      logWarn('useTheme', 'Failed to load theme', e);
    }
  };

  /**
   * Toggle between dark and light mode and persist preference
   */
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (e) {
      logWarn('useTheme', 'Failed to save theme', e);
    }
  };

  const colors = getColors(isDarkMode);

  return { isDarkMode, toggleTheme, colors };
};
