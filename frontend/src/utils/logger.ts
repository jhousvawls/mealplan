// Frontend logging utility with structured logging and error tracking

// Log levels for frontend
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
} as const;

export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];
export type LogLevelKey = keyof typeof LogLevel;

// Structured log entry for frontend
export interface FrontendLogEntry {
  timestamp: string;
  level: LogLevelKey;
  message: string;
  component?: string;
  userId?: string;
  sessionId: string;
  url: string;
  userAgent: string;
  metadata?: Record<string, any>;
  stack?: string;
  performance?: {
    memory?: number;
    timing?: Record<string, number>;
  };
}

// Log transport interface for frontend
interface FrontendLogTransport {
  log(entry: FrontendLogEntry): void;
}

// Console transport with enhanced formatting
class ConsoleTransport implements FrontendLogTransport {
  private colors = {
    ERROR: '#ff4444',
    WARN: '#ffaa00',
    INFO: '#0088cc',
    DEBUG: '#888888'
  };

  log(entry: FrontendLogEntry): void {
    const color = this.colors[entry.level];
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    const baseMessage = `%c[${timestamp}] ${entry.level}%c: ${entry.message}`;
    const componentInfo = entry.component ? ` (${entry.component})` : '';
    
    const args: any[] = [
      baseMessage + componentInfo,
      `color: ${color}; font-weight: bold`,
      'color: inherit'
    ];

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      args.push('\nMetadata:');
      args.push(entry.metadata);
    }

    if (entry.performance) {
      args.push('\nPerformance:');
      args.push(entry.performance);
    }

    if (entry.stack && entry.level === 'ERROR') {
      args.push('\nStack:');
      args.push(entry.stack);
    }

    switch (entry.level) {
      case 'ERROR':
        console.error(...args);
        break;
      case 'WARN':
        console.warn(...args);
        break;
      case 'INFO':
        console.info(...args);
        break;
      case 'DEBUG':
        console.debug(...args);
        break;
    }
  }
}

// Remote transport for sending logs to backend
class RemoteTransport implements FrontendLogTransport {
  private endpoint: string;
  private buffer: FrontendLogEntry[] = [];
  private bufferSize: number = 10;
  private flushInterval: number = 5000; // 5 seconds
  private timer: number | null = null;

  constructor(endpoint: string = '/api/logs') {
    this.endpoint = endpoint;
    this.startFlushTimer();
    
    // Flush logs before page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }

  log(entry: FrontendLogEntry): void {
    // Only send ERROR and WARN logs to backend in production
    if (import.meta.env.PROD && !['ERROR', 'WARN'].includes(entry.level)) {
      return;
    }

    this.buffer.push(entry);
    
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    this.timer = window.setInterval(() => {
      if (this.buffer.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush(sync: boolean = false): Promise<void> {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    try {
      if (sync && navigator.sendBeacon) {
        navigator.sendBeacon(
          this.endpoint,
          JSON.stringify({ logs })
        );
      } else {
        await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ logs }),
          keepalive: sync
        });
      }
    } catch (error) {
      // If remote logging fails, fall back to console
      console.error('Failed to send logs to backend:', error);
      logs.forEach(log => console.log('Unsent log:', log));
    }
  }

  destroy(): void {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.flush(true);
  }
}

// Local storage transport for offline persistence
class LocalStorageTransport implements FrontendLogTransport {
  private storageKey: string = 'mealmate_logs';
  private maxEntries: number = 100;

  log(entry: FrontendLogEntry): void {
    try {
      const stored = this.getStoredLogs();
      stored.push(entry);
      
      // Keep only the most recent entries
      if (stored.length > this.maxEntries) {
        stored.splice(0, stored.length - this.maxEntries);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (error) {
      // Storage might be full or unavailable
      console.warn('Failed to store log entry:', error);
    }
  }

  getStoredLogs(): FrontendLogEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  clearStoredLogs(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Main frontend logger class
class FrontendLogger {
  private level: LogLevelType;
  private transports: FrontendLogTransport[] = [];
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.level = this.getLogLevel();
    this.sessionId = this.generateSessionId();
    
    // Add default transports
    this.transports.push(new ConsoleTransport());
    
    // Add remote transport in production
    if (import.meta.env.PROD) {
      this.transports.push(new RemoteTransport());
    }
    
    // Add local storage transport for offline support
    this.transports.push(new LocalStorageTransport());
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private getLogLevel(): LogLevelType {
    const envLevel = import.meta.env.VITE_LOG_LEVEL?.toUpperCase() || 'INFO';
    return LogLevel[envLevel as keyof typeof LogLevel] ?? LogLevel.INFO;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
  }

  private createLogEntry(
    level: LogLevelKey,
    message: string,
    component?: string,
    metadata?: Record<string, any>,
    stack?: string
  ): FrontendLogEntry {
    const performance = this.getPerformanceInfo();
    
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      component,
      userId: this.userId,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata,
      stack,
      performance
    };
  }

  private getPerformanceInfo(): FrontendLogEntry['performance'] {
    const perf: FrontendLogEntry['performance'] = {};
    
    // Memory usage (if available)
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      perf.memory = memory.usedJSHeapSize;
    }
    
    // Navigation timing
    if (performance.timing) {
      perf.timing = {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    }
    
    return Object.keys(perf).length > 0 ? perf : undefined;
  }

  private log(
    level: LogLevelKey,
    message: string,
    component?: string,
    metadata?: Record<string, any>,
    stack?: string
  ): void {
    if (LogLevel[level] <= this.level) {
      const entry = this.createLogEntry(level, message, component, metadata, stack);
      
      this.transports.forEach(transport => {
        try {
          transport.log(entry);
        } catch (error) {
          console.error('Transport error:', error);
        }
      });
    }
  }

  // Public logging methods
  error(message: string, metadata?: Record<string, any>, component?: string): void {
    const stack = new Error().stack;
    this.log('ERROR', message, component, metadata, stack);
  }

  warn(message: string, metadata?: Record<string, any>, component?: string): void {
    this.log('WARN', message, component, metadata);
  }

  info(message: string, metadata?: Record<string, any>, component?: string): void {
    this.log('INFO', message, component, metadata);
  }

  debug(message: string, metadata?: Record<string, any>, component?: string): void {
    this.log('DEBUG', message, component, metadata);
  }

  // Convenience methods for common patterns
  logUserAction(action: string, metadata?: Record<string, any>, component?: string): void {
    this.info(`User action: ${action}`, {
      action,
      ...metadata
    }, component);
  }

  logApiCall(method: string, url: string, status: number, duration: number, component?: string): void {
    const level: LogLevelKey = status >= 400 ? 'ERROR' : status >= 300 ? 'WARN' : 'INFO';
    this.log(level, `API ${method} ${url} ${status}`, component, {
      method,
      url,
      status,
      duration: `${duration}ms`
    });
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, any>, component?: string): void {
    this.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...metadata
    }, component);
  }

  logNavigation(from: string, to: string, component?: string): void {
    this.info(`Navigation: ${from} → ${to}`, {
      from,
      to,
      timestamp: Date.now()
    }, component);
  }

  // User management
  setUserId(userId: string): void {
    this.userId = userId;
  }

  clearUserId(): void {
    this.userId = undefined;
  }

  // Level management
  setLevel(level: LogLevelKey): void {
    this.level = LogLevel[level];
  }

  getLevel(): string {
    return Object.keys(LogLevel).find(key => LogLevel[key as keyof typeof LogLevel] === this.level) || 'INFO';
  }

  // Transport management
  addTransport(transport: FrontendLogTransport): void {
    this.transports.push(transport);
  }

  // Get stored logs for debugging
  getStoredLogs(): FrontendLogEntry[] {
    const localStorageTransport = this.transports.find(t => t instanceof LocalStorageTransport) as LocalStorageTransport;
    return localStorageTransport?.getStoredLogs() || [];
  }

  // Clear stored logs
  clearStoredLogs(): void {
    const localStorageTransport = this.transports.find(t => t instanceof LocalStorageTransport) as LocalStorageTransport;
    localStorageTransport?.clearStoredLogs();
  }
}

// Create and export singleton logger instance
export const logger = new FrontendLogger();

// React hook for component-specific logging
export const useLogger = (componentName: string) => {
  return {
    error: (message: string, metadata?: Record<string, any>) => 
      logger.error(message, metadata, componentName),
    warn: (message: string, metadata?: Record<string, any>) => 
      logger.warn(message, metadata, componentName),
    info: (message: string, metadata?: Record<string, any>) => 
      logger.info(message, metadata, componentName),
    debug: (message: string, metadata?: Record<string, any>) => 
      logger.debug(message, metadata, componentName),
    logUserAction: (action: string, metadata?: Record<string, any>) => 
      logger.logUserAction(action, metadata, componentName),
    logPerformance: (operation: string, duration: number, metadata?: Record<string, any>) => 
      logger.logPerformance(operation, duration, metadata, componentName)
  };
};

// Export types for use in other modules
export type { FrontendLogTransport };
