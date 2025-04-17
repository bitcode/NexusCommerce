/**
 * LoggingService.ts
 * 
 * This service handles logging events to the terminal via the server API.
 * It sends log messages to the server which then displays them in the terminal.
 */

// Log types for different kinds of events
export type LogType = 'info' | 'error' | 'warning' | 'navigation' | 'click';

// Interface for log data
interface LogData {
  type: LogType;
  message: string;
  details?: any;
}

/**
 * Send a log message to the server to be displayed in the terminal
 */
export const logToTerminal = async (type: LogType, message: string, details?: any): Promise<void> => {
  try {
    // Create the log data object
    const logData: LogData = {
      type,
      message,
      details: details ? JSON.stringify(details, null, 2) : undefined
    };

    // Send the log data to the server
    const response = await fetch('http://localhost:3001/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    });

    // Check if the request was successful
    if (!response.ok) {
      // If we can't log to the terminal, fall back to console
      console.error('Failed to send log to terminal:', response.statusText);
    }
  } catch (error) {
    // If there's an error sending the log, fall back to console
    console.error('Error sending log to terminal:', error);
  }
};

/**
 * Log navigation events
 */
export const logNavigation = (from: string, to: string, details?: any): void => {
  logToTerminal('navigation', `Navigation from "${from}" to "${to}"`, details);
};

/**
 * Log button clicks
 */
export const logClick = (elementId: string, elementType: string, details?: any): void => {
  logToTerminal('click', `Click on ${elementType}: "${elementId}"`, details);
};

/**
 * Log errors
 */
export const logError = (message: string, error?: any): void => {
  logToTerminal('error', message, error);
};

/**
 * Log warnings
 */
export const logWarning = (message: string, details?: any): void => {
  logToTerminal('warning', message, details);
};

/**
 * Log general information
 */
export const logInfo = (message: string, details?: any): void => {
  logToTerminal('info', message, details);
};

// Export a default object with all logging functions
const LoggingService = {
  logToTerminal,
  logNavigation,
  logClick,
  logError,
  logWarning,
  logInfo
};

export default LoggingService;