import { Pool, Client } from 'pg';
import * as dotenv from 'dotenv';
import { logger } from '../logger';

dotenv.config();

// Database configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Database configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'restaurant_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
};

// Create PostgreSQL connection pool
export const pool = new Pool(dbConfig);

// Database connection class
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool;
  private isConnected: boolean = false;

  private constructor() {
    this.pool = pool;
    this.setupEventListeners();
  }

  // Singleton pattern - ensures only one instance
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // Setup event listeners for pool
  private setupEventListeners(): void {
    this.pool.on('connect', (client) => {
      logger.info('New client connected to the database');
    });

    this.pool.on('error', (err) => {
      logger.error('Database connection error:', err);
      this.isConnected = false;
    });

    this.pool.on('acquire', (client) => {
      logger.debug('Client acquired from pool');
    });

    this.pool.on('release', (client) => {
      logger.debug('Client released back to pool');
    });
  }

  // Test database connection
  public async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      logger.info('Database connection successful:', result.rows[0].now);
      return true;
    } catch (error) {
      this.isConnected = false;
      logger.error('Database connection failed:', error);
      return false;
    }
  }

  // Create database if it doesn't exist
  public async createDatabase(): Promise<void> {
    const client = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: 'postgres', // Connect to default postgres database
    });

    try {
      await client.connect();
      
      // Check if database exists
      const checkDbQuery = `
        SELECT 1 FROM pg_database WHERE datname = $1
      `;
      const result = await client.query(checkDbQuery, [dbConfig.database]);
      
      if (result.rows.length === 0) {
        // Create database if it doesn't exist
        await client.query(`CREATE DATABASE ${dbConfig.database}`);
        logger.info(`Database '${dbConfig.database}' created successfully`);
      } else {
        logger.info(`Database '${dbConfig.database}' already exists`);
      }
    } catch (error) {
      logger.error('Error creating database:', error);
      throw error;
    } finally {
      await client.end();
    }
  }

  // Execute query with connection from pool
  public async query(text: string, params?: any[]): Promise<any> {
    if (!this.isConnected) {
      await this.testConnection();
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      logger.error('Query execution error:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get a client from the pool (for transactions)
  public async getClient() {
    return await this.pool.connect();
  }

  // Close all connections
  public async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database connection pool:', error);
      throw error;
    }
  }

  // Get connection status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get pool stats
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}

// Export singleton instance
export const database = DatabaseConnection.getInstance();

// Helper function to initialize database
export async function initializeDatabase(): Promise<void> {
  try {
    logger.info('Starting database initialization...');
    
    // Create database if it doesn't exist
    await database.createDatabase();
    
    // Test connection
    const isConnected = await database.testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    logger.info('Database initialization completed successfully');
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

// Graceful shutdown
export async function gracefulShutdown(): Promise<void> {
  logger.info('Starting graceful database shutdown...');
  try {
    await database.close();
    logger.info('Database shutdown completed');
  } catch (error) {
    logger.error('Error during database shutdown:', error);
  }
}