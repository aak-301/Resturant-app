#!/usr/bin/env ts-node

/**
 * Standalone database setup script
 * Run with: npx ts-node setup-database.ts
 */

import { Pool } from "pg";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "restaurant_db",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432"),
};

const pool = new Pool(dbConfig);

const log = (message: string) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

const logError = (message: string, error?: any) => {
  console.error(
    `[${new Date().toISOString()}] ERROR: ${message}`,
    error?.message || ""
  );
};

async function createDatabase() {
  const adminPool = new Pool({
    ...dbConfig,
    database: "postgres",
  });

  try {
    const dbCheckResult = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database]
    );

    if (dbCheckResult.rows.length === 0) {
      log(`Creating database '${dbConfig.database}'...`);
      await adminPool.query(`CREATE DATABASE "${dbConfig.database}"`);
      log(`Database '${dbConfig.database}' created successfully`);
    } else {
      log(`Database '${dbConfig.database}' already exists`);
    }
  } finally {
    await adminPool.end();
  }
}

async function runMigration() {
  try {
    log("Running database migration...");

    // Read migration file
    const migrationPath = join(
      __dirname,
      "src",
      "database",
      "migrations",
      "001_initial_schema.sql"
    );
    const migrationSQL = readFileSync(migrationPath, "utf8");

    // Execute migration
    await pool.query(migrationSQL);
    log("Migration completed successfully");
  } catch (error: any) {
    logError("Migration failed", error);
    throw error;
  }
}

async function runSeed() {
  try {
    log("Running database seed...");

    // Read seed file
    const seedPath = join(
      __dirname,
      "src",
      "database",
      "seeds",
      "001_seed_data.sql"
    );
    const seedSQL = readFileSync(seedPath, "utf8");

    // Execute seed
    await pool.query(seedSQL);
    log("Seed completed successfully");
  } catch (error: any) {
    logError("Seed failed", error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    log("Starting database setup...");

    // Create database if it doesn't exist
    await createDatabase();

    // Test connection
    const testResult = await pool.query("SELECT NOW() as current_time");
    log(`Connected to database at ${testResult.rows[0].current_time}`);

    // Run migration
    await runMigration();

    // Run seed
    await runSeed();

    log("Database setup completed successfully!");
    log("");
    log("🎉 Your restaurant database is ready!");
    log("📊 Sample data has been loaded");
    log("🚀 You can now start your application");
  } catch (error: any) {
    logError("Database setup failed", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  setupDatabase().catch((error) => {
    logError("Setup script failed", error);
    process.exit(1);
  });
}

export { setupDatabase };
