import { Pool, PoolClient } from 'pg';
import { logger } from '../shared/utils/logger';

let pool: Pool | null = null;

export const getDatabasePool = (): Pool => {
  if (!pool) {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    pool = new Pool({
      connectionString,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    pool.on('error', err => {
      logger.error('Unexpected error on idle client', err);
    });

    logger.info('Database connection pool created');
  }

  return pool;
};

export const getDatabaseClient = async (): Promise<PoolClient> => {
  const pool = getDatabasePool();
  return await pool.connect();
};

export const closeDatabasePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing database connections...');
  await closeDatabasePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing database connections...');
  await closeDatabasePool();
  process.exit(0);
});
