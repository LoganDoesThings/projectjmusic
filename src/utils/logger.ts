/**
 * Structured logging utility for the application
 * Replaces console.log/error/warn with contextual, formatted messages
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Logger class for structured logging
 */
class Logger {
  private isDevelopment = __DEV__;

  private log(level: LogLevel, context: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      level,
      context,
      message,
      timestamp,
      ...(data && { data }),
    };

    // Format the log message
    const logMessage = `[${timestamp}] [${level}] [${context}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.log(logMessage, data || '');
        }
        break;
      case LogLevel.INFO:
        console.log(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
    }
  }

  debug(context: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, context, message, data);
  }

  info(context: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, context, message, data);
  }

  warn(context: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, context, message, data);
  }

  error(context: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, context, message, data);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience methods
export const logDebug = (context: string, message: string, data?: any) =>
  logger.debug(context, message, data);

export const logInfo = (context: string, message: string, data?: any) =>
  logger.info(context, message, data);

export const logWarn = (context: string, message: string, data?: any) =>
  logger.warn(context, message, data);

export const logError = (context: string, message: string, data?: any) =>
  logger.error(context, message, data);
