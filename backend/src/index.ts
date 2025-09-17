import compression from 'compression';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { authRouter } from './functions/auth';
import { portfolioRouter } from './functions/portfolio';
import { scenarioRouter } from './functions/scenarios';
import { errorHandler } from './shared/middleware/errorHandler';
import { logger } from './shared/utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'econlens-backend',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/portfolios', portfolioRouter);
app.use('/api/scenarios', scenarioRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`EconLens Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(
    `Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`
  );
});

export { app };
