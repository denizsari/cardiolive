const winston = require('winston');
const path = require('path');

/**
 * Logger Configuration
 * Provides structured logging with multiple transports
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for console output
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create transports array
const transports = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: consoleFormat
    })
  );
}

// File transports for all environments
transports.push(
  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Combined log file
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

// HTTP requests log file
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/http.log'),
      level: 'http',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info'),
  levels,
  format: fileFormat,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      format: fileFormat
    })
  ],
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      format: fileFormat
    })
  ]
});

/**
 * Create child logger with additional metadata
 * @param {Object} metadata - Additional metadata to include in all logs
 * @returns {Object} Child logger instance
 */
const createChildLogger = (metadata) => {
  return logger.child(metadata);
};

/**
 * Log HTTP request information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} responseTime - Response time in milliseconds
 */
const logHttpRequest = (req, res, responseTime) => {
  const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
  
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  };

  if (res.statusCode >= 400) {
    logger.error(message, logData);
  } else {
    logger.http(message, logData);
  }
};

/**
 * Log authentication events
 * @param {string} event - Authentication event type
 * @param {Object} data - Event data
 */
const logAuthEvent = (event, data) => {
  logger.info(`Auth: ${event}`, {
    event,
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log security events
 * @param {string} event - Security event type
 * @param {Object} data - Event data
 */
const logSecurityEvent = (event, data) => {
  logger.warn(`Security: ${event}`, {
    event,
    severity: 'security',
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log database operations
 * @param {string} operation - Database operation
 * @param {Object} data - Operation data
 */
const logDatabaseOperation = (operation, data) => {
  logger.debug(`Database: ${operation}`, {
    operation,
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log business events
 * @param {string} event - Business event type
 * @param {Object} data - Event data
 */
const logBusinessEvent = (event, data) => {
  logger.info(`Business: ${event}`, {
    event,
    category: 'business',
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Generic log event function that routes to specific event loggers
 * @param {string} type - Event type (business, security, auth, error, etc.)
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
const logEvent = (type, event, data) => {
  switch (type) {
    case 'business':
      logBusinessEvent(event, data);
      break;
    case 'security':
      logSecurityEvent(event, data);
      break;
    case 'auth':
      logAuthEvent(event, data);
      break;
    case 'database':
      logDatabaseOperation(event, data);
      break;
    case 'error':
      logger.error(`Error: ${event}`, {
        event,
        ...data,
        timestamp: new Date().toISOString()
      });
      break;
    default:
      logger.info(`${type}: ${event}`, {
        event,
        type,
        ...data,
        timestamp: new Date().toISOString()
      });
  }
};

// Add methods directly to logger instance for backwards compatibility
logger.logEvent = logEvent;
logger.logAuthEvent = logAuthEvent;
logger.logSecurityEvent = logSecurityEvent;
logger.logBusinessEvent = logBusinessEvent;
logger.logDatabaseOperation = logDatabaseOperation;
logger.logHttpRequest = logHttpRequest;
logger.createChildLogger = createChildLogger;

module.exports = {
  logger,
  createChildLogger,
  logHttpRequest,
  logAuthEvent,
  logSecurityEvent,
  logDatabaseOperation,
  logBusinessEvent,
  logEvent
};
