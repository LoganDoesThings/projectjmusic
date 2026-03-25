/**
 * Centralized error handling utility for consistent error messaging throughout the app
 */

/**
 * Handle errors consistently across the application
 * @param error - The error object (could be Error, string, or unknown)
 * @param context - Description of where the error occurred (e.g., "Playing track 'Song Title'")
 * @returns User-friendly error message
 */
export const handleError = (error: unknown, context: string): string => {
  const errorMessage = extractErrorMessage(error);
  logError(context, errorMessage);
  return formatErrorMessage(context, errorMessage);
};

/**
 * Extract a readable message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  return 'Unknown error occurred';
}

/**
 * Log error with context for debugging
 */
function logError(context: string, message: string): void {
  console.error(`[${context}] ${message}`);
}

/**
 * Format a user-friendly error message
 */
function formatErrorMessage(context: string, message: string): string {
  return `${context} failed. ${message}`;
}

/**
 * Handle storage-related errors
 */
export const handleStorageError = (error: unknown, operation: string): string => {
  return handleError(error, `Storage operation (${operation})`);
};

/**
 * Handle playback-related errors
 */
export const handlePlaybackError = (error: unknown, trackName?: string): string => {
  const context = trackName ? `Playing track "${trackName}"` : 'Playback';
  return handleError(error, context);
};

/**
 * Handle file operation errors
 */
export const handleFileError = (error: unknown, fileName?: string): string => {
  const context = fileName ? `Loading file "${fileName}"` : 'File operation';
  return handleError(error, context);
};

/**
 * Handle network/URL errors
 */
export const handleNetworkError = (error: unknown, url?: string): string => {
  const context = url ? `Fetching ${url}` : 'Network request';
  return handleError(error, context);
};

/**
 * Handle metadata extraction errors
 */
export const handleMetadataError = (error: unknown, fileName?: string): string => {
  const context = fileName ? `Extracting metadata from "${fileName}"` : 'Metadata extraction';
  return handleError(error, context);
};
