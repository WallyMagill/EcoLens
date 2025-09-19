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

// CORS configuration with support for multiple frontend origins
const getCorsOrigins = (): string[] => {
  const origins: string[] = [
    // Development origins
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    
    // CloudFront distribution
    'https://dquykpffn9qx.cloudfront.net',
    
    // Legacy frontend URL (fallback)
    process.env.FRONTEND_URL || 'http://44.203.253.29:3000'
  ];

  // Add additional frontend URLs from environment variable
  if (process.env.FRONTEND_URLS) {
    const additionalUrls = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
    origins.push(...additionalUrls);
  }

  // Add ALB URL if configured
  if (process.env.ALB_URL) {
    origins.push(process.env.ALB_URL);
  }

  // Remove duplicates and filter out empty strings
  const finalOrigins = [...new Set(origins.filter(Boolean))];
  
  // Log CORS origins for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    logger.info('CORS Origins configured:', finalOrigins);
  }
  
  return finalOrigins;
};

app.use(
  cors({
    origin: getCorsOrigins(),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: ['Authorization'],
    optionsSuccessStatus: 200
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
