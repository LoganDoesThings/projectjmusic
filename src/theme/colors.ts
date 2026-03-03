export const getColors = (isDarkMode: boolean) => ({
  bg: isDarkMode ? '#121212' : '#F5F5F7',
  surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  text: isDarkMode ? '#FFFFFF' : '#000000',
  subtext: isDarkMode ? '#AAAAAA' : '#666666',
  primary: '#1DB954',
  border: isDarkMode ? '#333333' : '#E0E0E0',
  card: isDarkMode ? '#282828' : '#FFFFFF',
  overlay: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
});

export type Colors = ReturnType<typeof getColors>;
