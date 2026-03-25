/**
 * URL validation and sanitization utilities
 */

/**
 * Check if a string is a valid HTTP(S) URL
 * @param str - String to validate
 * @returns true if string is a valid URL with http/https protocol
 */
export const isValidUrl = (str: string): boolean => {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

/**
 * Check if a URL points to a supported audio file
 * @param urlString - URL string to check
 * @returns true if URL likely points to an audio file
 */
export const isAudioUrl = (urlString: string): boolean => {
  const audioExtensions = ['.mp3', '.m4a', '.wav', '.ogg', '.aac', '.flac', '.wma'];
  const lowerUrl = urlString.toLowerCase();
  return audioExtensions.some(ext => lowerUrl.includes(ext));
};

/**
 * Validate and sanitize an audio URL
 * @param urlString - URL to validate
 * @returns validated URL string or null if invalid
 */
export const validateAudioUrl = (urlString: string): string | null => {
  // Check if URL is provided and not just whitespace
  if (!urlString || !urlString.trim()) {
    return null;
  }

  // Check if it's a valid URL
  if (!isValidUrl(urlString)) {
    return null;
  }

  // Return the trimmed URL
  return urlString.trim();
};
