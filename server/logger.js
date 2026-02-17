/**
 * Structured logging utility
 */

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m'
};

/**
 * Format timestamp
 * @returns {string} ISO timestamp
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  DEBUG: 'DEBUG',
  TRACE: 'TRACE'
};

/**
 * Get color for log level
 * @param {string} level - Log level
 * @returns {string} ANSI color code
 */
function getColorForLevel(level) {
  switch (level) {
    case LogLevel.ERROR: return colors.red;
    case LogLevel.WARN: return colors.yellow;
    case LogLevel.INFO: return colors.blue;
    case LogLevel.SUCCESS: return colors.green;
    case LogLevel.DEBUG: return colors.cyan;
    case LogLevel.TRACE: return colors.gray;
    default: return colors.reset;
  }
}

/**
 * Format log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {object} data - Additional data
 * @returns {string} Formatted message
 */
function formatMessage(level, message, data = null) {
  const color = getColorForLevel(level);
  const timestamp = getTimestamp();
  const levelStr = `[${level.padEnd(7)}]`;

  let output = `${color}${timestamp} ${levelStr} ${message}${colors.reset}`;

  if (data && typeof data === 'object') {
    output += `\n  ${JSON.stringify(data, null, 2).split('\n').join('\n  ')}`;
  }

  return output;
}

/**
 * Logger instance
 */
const logger = {
  /**
   * Log error
   */
  error: (message, data = null) => {
    console.error(formatMessage(LogLevel.ERROR, message, data));
  },

  /**
   * Log warning
   */
  warn: (message, data = null) => {
    console.warn(formatMessage(LogLevel.WARN, message, data));
  },

  /**
   * Log info
   */
  info: (message, data = null) => {
    console.log(formatMessage(LogLevel.INFO, message, data));
  },

  /**
   * Log success
   */
  success: (message, data = null) => {
    console.log(formatMessage(LogLevel.SUCCESS, message, data));
  },

  /**
   * Log debug (only in development)
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage(LogLevel.DEBUG, message, data));
    }
  },

  /**
   * Log API endpoint call with details
   */
  endpoint: (method, path, statusCode, details = {}) => {
    const status = statusCode >= 400 ? '❌' : '✅';
    const timestamp = getTimestamp();
    const output = `${timestamp} ${status} ${method.padEnd(6)} ${path}${statusCode ? ` -> ${statusCode}` : ''}`;

    if (Object.keys(details).length > 0) {
      console.log(output);
      console.log('   Details:', JSON.stringify(details));
    } else {
      console.log(output);
    }
  },

  /**
   * Log validation error with field details
   */
  validationError: (message, errors = {}) => {
    console.error(`${colors.red}❌ Validation Error: ${message}${colors.reset}`);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, error]) => {
        console.error(`   ${colors.yellow}• ${field}: ${error}${colors.reset}`);
      });
    }
  },

  /**
   * Log database operation
   */
  db: (operation, table, success = true, error = null) => {
    const symbol = success ? '✅' : '❌';
    const color = success ? colors.green : colors.red;
    console.log(`${color}${symbol} DB: ${operation.padEnd(10)} ${table}${colors.reset}`);
    if (error) {
      console.error(`   Error: ${error}`);
    }
  },

  /**
   * Log performance metrics
   */
  perf: (operation, durationMs) => {
    const threshold = 100; // 100ms
    let symbol = '⚡';
    let color = colors.green;

    if (durationMs > threshold) {
      symbol = '🐢';
      color = colors.yellow;
    }

    console.log(`${color}${symbol} ${operation}: ${durationMs}ms${colors.reset}`);
  },

  /**
   * Log server startup
   */
  startup: (message, details = {}) => {
    console.log(`\n${colors.green}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.green}🚀 ${message}${colors.reset}`);
    if (Object.keys(details).length > 0) {
      Object.entries(details).forEach(([key, value]) => {
        console.log(`${colors.blue}   ${key}: ${value}${colors.reset}`);
      });
    }
    console.log(`${colors.green}${'='.repeat(50)}${colors.reset}\n`);
  }
};

/**
 * Request logger middleware
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log incoming request
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Hook response.send to log outgoing response
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    logger.request(req.method, req.path, res.statusCode, duration);

    // Call original send
    return originalSend.call(this, data);
  };

  next();
}

export default logger;
