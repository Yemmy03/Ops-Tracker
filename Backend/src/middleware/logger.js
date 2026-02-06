import morgan from 'morgan';
import logger from '../utils/logger.js';

/**
 * Create a stream object with a write function that will be used by Morgan
 */
const stream = {
  write: (message) => {
    // Remove trailing newline
    logger.info(message.trim());
  },
};

/**
 * Custom token for response time
 */
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '-';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;

  return ms.toFixed(3);
});

/**
 * Custom format for structured logging
 */
const logFormat = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :method :url :status :response-time-ms ms - :res[content-length]'
  : ':method :url :status :response-time ms - :res[content-length]';

/**
 * Morgan middleware configured with Winston
 */
export const requestLogger = morgan(logFormat, {
  stream,
  skip: (req, res) => {
    // Skip health check logs in production
    return process.env.NODE_ENV === 'production' && req.url === '/health';
  },
});

/**
 * Detailed request logger for debugging
 */
export const detailedLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.debug('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body,
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.debug('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
