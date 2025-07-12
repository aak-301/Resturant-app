import { database } from './database_setup';
import { logger } from '../logger';
import * as fs from 'fs';
import * as path from 'path';

class SeedRunner {
  private seedsDir: string;

  constructor() {
    this.seedsDir = path.join(__dirname, '../../queries/seeds');
  }

  // Create seeds tracking table
  private async createSeedsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS seeds (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    try {
      await database.query(createTableQuery);
      logger.info('Seeds table created/verified');
    } catch (error) {
      logger.error('Error creating seeds table:', error);
      throw error;
    }
  }

  // Get executed seeds from database
  private async getExecutedSeeds(): Promise<string[]> {
    try {
      const result = await database.query('SELECT filename FROM seeds ORDER BY executed_at');
      return result.rows.map((row: any) => row.filename);
    } catch (error) {
      logger.error('Error fetching executed seeds:', error);
      throw error;
    }
  }

  // Get all seed files from directory
  private getSeedFiles(): string[] {
    try {
      if (!fs.existsSync(this.seedsDir)) {
        logger.warn(`Seeds directory not found: ${this.seedsDir}`);
        return [];
      }

      return fs.readdirSync(this.seedsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();
    } catch (error) {
      logger.error('Error reading seed files:', error);
      throw error;
    }
  }

  // Execute a single seed file
  private async executeSeed(filename: string): Promise<void> {
    const filePath = path.join(this.seedsDir, filename);
    
    try {
      const seedSQL = fs.readFileSync(filePath, 'utf8');
      
      // Start transaction
      const client = await database.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Execute seed SQL
        await client.query(seedSQL);
        
        // Record seed in seeds table
        await client.query(
          'INSERT INTO seeds (filename) VALUES ($1)',
          [filename]
        );
        
        await client.query('COMMIT');
        logger.info(`Seed executed successfully: ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error(`Error executing seed ${filename}:`, error);
      throw error;
    }
  }

  // Run all pending seeds
  public async runSeeds(force: boolean = false): Promise<void> {
    try {
      logger.info('Starting database seeding...');
      
      // Ensure seeds table exists
      await this.createSeedsTable();
      
      // Get executed and available seeds
      const executedSeeds = force ? [] : await this.getExecutedSeeds();
      const availableSeeds = this.getSeedFiles();
      
      // Find pending seeds
      const pendingSeeds = availableSeeds.filter(
        seed => !executedSeeds.includes(seed)
      );
      
      if (pendingSeeds.length === 0 && !force) {
        logger.info('No pending seeds found');
        return;
      }
      
      if (force) {
        logger.info('Force seeding - running all seeds');
        // Clear seeds table if force
        await database.query('DELETE FROM seeds');
      } else {
        logger.info(`Found ${pendingSeeds.length} pending seeds`);
      }
      
      // Execute seeds
      const seedsToRun = force ? availableSeeds : pendingSeeds;
      for (const seed of seedsToRun) {
        await this.executeSeed(seed);
      }
      
      logger.info('All seeds completed successfully');
    } catch (error) {
      logger.error('Seeding process failed:', error);
      throw error;
    }
  }

  // Clear all data (for development)
  public async clearAllData(): Promise<void> {
    try {
      logger.warn('Clearing all data from database...');
      
      // Get all tables
      const tablesResult = await database.query(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN ('migrations', 'seeds')
      `);
      
      const tables = tablesResult.rows.map((row: any) => row.tablename);
      
      if (tables.length === 0) {
        logger.info('No tables to clear');
        return;
      }
      
      // Disable foreign key checks and truncate tables
      const client = await database.getClient();
      try {
        await client.query('BEGIN');
        
        // Truncate all tables
        for (const table of tables) {
          await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        }
        
        // Clear seeds table
        await client.query('DELETE FROM seeds');
        
        await client.query('COMMIT');
        logger.info('All data cleared successfully');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error clearing data:', error);
      throw error;
    }
  }

  // Reset database (clear and reseed)
  public async resetDatabase(): Promise<void> {
    try {
      logger.info('Resetting database...');
      await this.clearAllData();
      await this.runSeeds(true);
      logger.info('Database reset completed');
    } catch (error) {
      logger.error('Database reset failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const seedRunner = new SeedRunner();

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'seed';
  
  (async () => {
    try {
      switch (command) {
        case 'seed':
          await seedRunner.runSeeds();
          break;
        case 'force-seed':
          await seedRunner.runSeeds(true);
          break;
        case 'clear':
          await seedRunner.clearAllData();
          break;
        case 'reset':
          await seedRunner.resetDatabase();
          break;
        default:
          logger.info('Available commands: seed, force-seed, clear, reset');
      }
      process.exit(0);
    } catch (error) {
      logger.error('Seed operation failed:', error);
      process.exit(1);
    }
  })();
}