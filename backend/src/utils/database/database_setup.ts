import { Pool, PoolConfig } from 'pg';
import { logger } from '../logger';
import { migrationRunner } from './migrate';
import { seedRunner } from './seed';

/**
 * Simple Database Configuration
 * Uses DATABASE_URL if available (Render), otherwise uses individual variables (local)
 */
const getDatabaseConfig = (): PoolConfig => {
  // If DATABASE_URL exists (Render), use it
  if (process.env.DATABASE_URL) {
    logger.info('Using Render PostgreSQL (DATABASE_URL)');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  // Otherwise use local pgAdmin config
  logger.info('Using Local PostgreSQL (pgAdmin)');
  return {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'restaurant_db',
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

// Create pool instance
export const pool = new Pool(getDatabaseConfig());

// Database initialization
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info('Starting database initialization...');
    
    // For local development, create database if it doesn't exist
    if (!process.env.DATABASE_URL) {
      await createLocalDatabaseIfNeeded();
    }
    
    // Test connection
    const testResult = await pool.query('SELECT NOW() as current_time, current_database() as db_name');
    logger.info('Database connected:', {
      database: testResult.rows[0].db_name,
      time: testResult.rows[0].current_time,
      type: process.env.DATABASE_URL ? 'Render' : 'Local'
    });

    // Initialize runners
    (migrationRunner as any).pool = pool;
    (seedRunner as any).pool = pool;

    logger.info('Database initialization completed');
  } catch (error: any) {
    logger.error('Database initialization failed:', error.message);
    throw error;
  }
}

// Create local database if needed (only for local development)
async function createLocalDatabaseIfNeeded(): Promise<void> {
  const dbName = process.env.DB_NAME || 'restaurant_db';
  
  const adminPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres', // Connect to default database
    password: process.env.DB_PASSWORD || 'password',
    port: parseInt(process.env.DB_PORT || '5432'),
  });

  try {
    const result = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (result.rows.length === 0) {
      logger.info(`Creating database '${dbName}'...`);
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`Database '${dbName}' created`);
    }
  } catch (error: any) {
    logger.error('Error creating database:', error.message);
  } finally {
    await adminPool.end();
  }
}

// Graceful shutdown
export async function gracefulShutdown(): Promise<void> {
  try {
    await pool.end();
    logger.info('Database connections closed');
  } catch (error: any) {
    logger.error('Error during shutdown:', error);
  }
}

// Handle pool errors
pool.on('error', (err: Error) => {
  logger.error('Database pool error:', err.message);
});

export { pool as database };