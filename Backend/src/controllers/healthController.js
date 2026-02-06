import mongoose from 'mongoose';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Health check endpoint
 * @route   GET /health
 * @access  Public
 */
export const healthCheck = asyncHandler(async (req, res, next) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    database: {
      status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      name: mongoose.connection.name,
    },
    memory: {
      used: `${Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100} MB`,
      total: `${Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100} MB`,
    },
  };

  res.status(200).json(healthCheck);
});
