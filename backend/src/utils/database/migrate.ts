import { database } from './database_setup';
import { logger } from '../logger';
import * as fs from 'fs';
import * as path from 'path';

interface Migration {
  id: string;
  filename: string;
  executed_at?: Date;
}

class MigrationRunner {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(__dirname, '../../queries/schema');
  }

  // Create migrations table if it doesn't exist
  private async createMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await database.query(createTableQuery);
      logger.info('Migrations table created/verified');
    } catch (error) {
      logger.error('Error creating migrations table:', error);
      throw error;
    }
  }

  // Get executed migrations from database
  private async getExecutedMigrations(): Promise<string[]> {
    try {
      const result = await database.query('SELECT filename FROM migrations ORDER BY executed_at');
      return result.rows.map((row: any) => row.filename);
    } catch (error) {
      logger.error('Error fetching executed migrations:', error);
      throw error;
    }
  }

  // Get all migration files from directory
  private getMigrationFiles(): string[] {
    try {
      if (!fs.existsSync(this.migrationsDir)) {
        logger.warn(`Migrations directory not found: ${this.migrationsDir}`);
        return [];
      }

      return fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    } catch (error) {
      logger.error('Error reading migration files:', error);
      throw error;
    }
  }

  // Execute a single migration file
  private async executeMigration(filename: string): Promise<void> {
    const filePath = path.join(this.migrationsDir, filename);
    
    try {
      const migrationSQL = fs.readFileSync(filePath, 'utf8');
      
      // Start transaction
      const client = await database.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Execute migration SQL
        await client.query(migrationSQL);
        
        // Record migration in migrations table
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        );
        
        await client.query('COMMIT');
        logger.info(`Migration executed successfully: ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error executing migration ${filename}:`, error);
      throw error;
    }
  }

  // Run all pending migrations
  public async runMigrations(): Promise<void> {
    try {
      logger.info('Starting database migrations...');
      
      // Ensure migrations table exists
      await this.createMigrationsTable();
      
      // Get executed and available migrations
      const executedMigrations = await this.getExecutedMigrations();
      const availableMigrations = this.getMigrationFiles();
      
      // Find pending migrations
      const pendingMigrations = availableMigrations.filter(
        migration => !executedMigrations.includes(migration)
      );
      
      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found');
        return;
      }
      
      logger.info(`Found ${pendingMigrations.length} pending migrations`);
      
      // Execute pending migrations
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      logger.info('All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    }
  }

  // Rollback last migration (basic implementation)
  public async rollbackLastMigration(): Promise<void> {
    try {
      const result = await database.query(
        'SELECT filename FROM migrations ORDER BY executed_at DESC LIMIT 1'
      );
      
      if (result.rows.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }
      
      const lastMigration = result.rows[0].filename;
      
      // Remove from migrations table
      await database.query(
        'DELETE FROM migrations WHERE filename = $1',
        [lastMigration]
      );
      
      logger.warn(`Rolled back migration: ${lastMigration}`);
      logger.warn('Note: You need to manually reverse the schema changes');
    } catch (error) {
      logger.error('Error rolling back migration:', error);
      throw error;
    }
  }

  // Get migration status
  public async getMigrationStatus(): Promise<Migration[]> {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const availableMigrations = this.getMigrationFiles();
      
      const result = await database.query(
        'SELECT filename, executed_at FROM migrations ORDER BY executed_at'
      );
      
      const executedDetails = new Map<string, Date>(
        result.rows.map((row: any) => [row.filename, new Date(row.executed_at)])
      );
      
      return availableMigrations.map(filename => ({
        id: filename,
        filename,
        executed_at: executedDetails.get(filename) || undefined
      }));
    } catch (error) {
      logger.error('Error getting migration status:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const migrationRunner = new MigrationRunner();

// CLI execution
if (require.main === module) {
  (async () => {
    try {
      await migrationRunner.runMigrations();
      process.exit(0);
    } catch (error) {
      logger.error('Migration failed:', error);
      process.exit(1);
    }
  })();
}