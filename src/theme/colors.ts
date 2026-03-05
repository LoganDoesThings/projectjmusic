// ============================================================================
// Theme Configuration
// ============================================================================
// Centralized color palette for the application.
// We support Light and Dark modes.

export const getColors = (isDarkMode: boolean) => ({
  // Main background
  bg: isDarkMode ? '#121212' : '#F5F5F7',
  
  // Cards, Modals, Bottom Bar
  surface: isDarkMode ? '#1E1E1E' : '#FFFFFF',
  
  // Primary Text
  text: isDarkMode ? '#FFFFFF' : '#000000',
  
  // Secondary Text (Metadata, labels)
  subtext: isDarkMode ? '#AAAAAA' : '#666666',
  
  // Brand / Action Color (Green like Spotify, or customizable)
  primary: '#1DB954',
  
  // Borders and Dividers
  border: isDarkMode ? '#333333' : '#E0E0E0',
  
  // (Optional) Alternative card color
  card: isDarkMode ? '#282828' : '#FFFFFF',
  
  // Modal background dimming
  overlay: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
});

// Helper type for use in components
export type Colors = ReturnType<typeof getColors>;
