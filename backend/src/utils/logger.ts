import fs from 'fs';
import path from 'path';

// Enhanced log levels with numeric values
interface LogLevel {
  ERROR: 0;
  WARN: 1;
  INFO: 2;
  HTTP: 3;
  DEBUG: 4;
}

const LOG_LEVELS: LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  HTTP: 3,
  DEBUG: 4,
};

// Structured log entry interface
interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  service: string;
  version: string;
  environment: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  stack?: string;
  duration?: number;
}

// Log transport interface
interface LogTransport {
  log(entry: LogEntry): void;
}

// Console transport with colored output
class ConsoleTransport implements LogTransport {
  private colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m',  // Yellow
    INFO: '\x1b[36m',  // Cyan
    HTTP: '\x1b[35m',  // Magenta
    DEBUG: '\x1b[37m', // White
    RESET: '\x1b[0m'   // Reset
  };

  log(entry: LogEntry): void {
    const color = this.colors[entry.level] || this.colors.DEBUG;
    const reset = this.colors.RESET;
    
    const baseMessage = `${color}[${entry.timestamp}] ${entry.level}${reset}: ${entry.message}`;
    
    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      console.log(`${baseMessage}\n  ${JSON.stringify(entry.metadata, null, 2)}`);
    } else {
      console.log(baseMessage);
    }
    
    if (entry.stack && entry.level === 'ERROR') {
      console.log(`  Stack: ${entry.stack}`);
    }
  }
}

// File transport for persistent logging
class FileTransport implements LogTransport {
  private logDir: string;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB
  private maxFiles: number = 5;

  constructor(logDir: string = 'logs') {
    this.logDir = logDir;
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: keyof LogLevel): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
  }

  private rotateLogFile(filePath: string): void {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > this.maxFileSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
        fs.renameSync(filePath, rotatedPath);
        
        // Clean up old files
        this.cleanupOldFiles(path.dirname(filePath));
      }
    } catch (error) {
      // File doesn't exist yet, no need to rotate
    }
  }

  private cleanupOldFiles(dir: string): void {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(dir, file),
          mtime: fs.statSync(path.join(dir, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

      // Keep only the most recent files
      files.slice(this.maxFiles).forEach(file => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  log(entry: LogEntry): void {
    const logFile = this.getLogFileName(entry.level);
    this.rotateLogFile(logFile);
    
    const logLine = JSON.stringify(entry) + '\n';
    
    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      // Fallback to console if file writing fails
      console.error('Failed to write to log file:', error);
      console.log(logLine);
    }
  }
}

// Enhanced Logger class with structured logging
class Logger {
  private level: number;
  private transports: LogTransport[] = [];
  private service: string;
  private version: string;
  private environment: string;

  constructor() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    this.level = LOG_LEVELS[envLevel as keyof LogLevel] ?? LOG_LEVELS.INFO;
    
    this.service = process.env.SERVICE_NAME || 'mealmate-api';
    this.version = process.env.APP_VERSION || '1.0.0';
    this.environment = process.env.NODE_ENV || 'development';

    // Add default transports
    this.transports.push(new ConsoleTransport());
    
    // Add file transport in production
    if (this.environment === 'production') {
      this.transports.push(new FileTransport());
    }
  }

  private createLogEntry(
    level: keyof LogLevel,
    message: string,
    metadata?: Record<string, any>,
    requestId?: string,
    userId?: string,
    stack?: string,
    duration?: number
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      version: this.version,
      environment: this.environment,
      requestId,
      userId,
      metadata,
      stack,
      duration
    };
  }

  private log(
    level: keyof LogLevel,
    message: string,
    metadata?: Record<string, any>,
    requestId?: string,
    userId?: string,
    stack?: string,
    duration?: number
  ): void {
    if (LOG_LEVELS[level] <= this.level) {
      const entry = this.createLogEntry(level, message, metadata, requestId, userId, stack, duration);
      
      this.transports.forEach(transport => {
        try {
          transport.log(entry);
        } catch (error) {
          console.error('Transport error:', error);
        }
      });
    }
  }

  // Enhanced logging methods with backward compatibility
  error(message: string, metadataOrLegacy?: Record<string, any> | any, requestId?: string, userId?: string): void {
    const stack = new Error().stack;
    const metadata = this.normalizeMetadata(metadataOrLegacy);
    this.log('ERROR', message, metadata, requestId, userId, stack);
  }

  warn(message: string, metadataOrLegacy?: Record<string, any> | any, requestId?: string, userId?: string): void {
    const metadata = this.normalizeMetadata(metadataOrLegacy);
    this.log('WARN', message, metadata, requestId, userId);
  }

  info(message: string, metadataOrLegacy?: Record<string, any> | any, requestId?: string, userId?: string): void {
    const metadata = this.normalizeMetadata(metadataOrLegacy);
    this.log('INFO', message, metadata, requestId, userId);
  }

  http(message: string, metadataOrLegacy?: Record<string, any> | any, requestId?: string, userId?: string, duration?: number): void {
    const metadata = this.normalizeMetadata(metadataOrLegacy);
    this.log('HTTP', message, metadata, requestId, userId, undefined, duration);
  }

  debug(message: string, metadataOrLegacy?: Record<string, any> | any, requestId?: string, userId?: string): void {
    const metadata = this.normalizeMetadata(metadataOrLegacy);
    this.log('DEBUG', message, metadata, requestId, userId);
  }

  // Helper method to normalize metadata for backward compatibility
  private normalizeMetadata(metadataOrLegacy?: any): Record<string, any> | undefined {
    if (metadataOrLegacy === undefined || metadataOrLegacy === null) {
      return undefined;
    }
    
    // If it's already an object, return as-is
    if (typeof metadataOrLegacy === 'object' && !Array.isArray(metadataOrLegacy)) {
      return metadataOrLegacy;
    }
    
    // For backward compatibility, wrap non-objects in a metadata object
    return { details: metadataOrLegacy };
  }

  // Convenience methods for common logging patterns
  logRequest(method: string, url: string, statusCode: number, duration: number, requestId?: string, userId?: string): void {
    this.http(`${method} ${url} ${statusCode}`, {
      method,
      url,
      statusCode,
      responseTime: `${duration}ms`
    }, requestId, userId, duration);
  }

  logError(error: Error, context?: Record<string, any>, requestId?: string, userId?: string): void {
    this.error(error.message, {
      name: error.name,
      stack: error.stack,
      ...context
    }, requestId, userId);
  }

  logPerformance(operation: string, duration: number, metadata?: Record<string, any>, requestId?: string): void {
    this.info(`Performance: ${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...metadata
    }, requestId);
  }

  // Method to add custom transports
  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  // Method to set log level dynamically
  setLevel(level: keyof LogLevel): void {
    this.level = LOG_LEVELS[level];
  }

  // Method to get current log level
  getLevel(): string {
    return Object.keys(LOG_LEVELS).find(key => LOG_LEVELS[key as keyof LogLevel] === this.level) || 'INFO';
  }
}

// Create and export singleton logger instance
export const logger = new Logger();

// Export types for use in other modules
export type { LogEntry, LogTransport };
export { LOG_LEVELS };
