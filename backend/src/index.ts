import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { initializeDatabase, gracefulShutdown } from './utils/database/database_setup';
import { migrationRunner } from './utils/database/migrate';
import { seedRunner } from './utils/database/seed';
import { logger } from './utils/logger';
import { ExternalApiController } from './controllers/external.controller';
import apiRoutes from './routes/api.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers

// CORS configuration - allow all origins for now
app.use(
  cors({
    origin: "*", // This will allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    }
  });
});

// ===== EXISTING ROUTES (Your original food API routes) =====
// Keeping your original endpoints for backward compatibility
app.get("/food-list", ExternalApiController.getFoodList);
app.get("/food-details/:id", ExternalApiController.getFoodDetails);

// ===== NEW API ROUTES =====
app.use('/api', apiRoutes);

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific database errors
  if (err.code === '23505') { // Unique constraint violation
    statusCode = 409;
    message = 'Duplicate entry';
  } else if (err.code === '23503') { // Foreign key constraint violation
    statusCode = 400;
    message = 'Invalid reference';
  } else if (err.code === '23502') { // Not null constraint violation
    statusCode = 400;
    message = 'Missing required field';
  } else if (err.code === '22P02') { // Invalid input syntax
    statusCode = 400;
    message = 'Invalid input format';
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Database initialization and server startup
async function startServer(): Promise<void> {
  try {
    logger.info('Starting Restaurant Backend Server...');
    
    // Initialize database connection
    await initializeDatabase();
    
    // Run migrations
    logger.info('Running database migrations...');
    await migrationRunner.runMigrations();
    
    // Run seeds if in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.info('Running database seeds...');
      await seedRunner.runSeeds();
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('🚀 API Endpoints Available:');
      logger.info('');
      logger.info('📋 System:');
      logger.info('  GET /health - Health check');
      logger.info('');
      logger.info('🥘 External API (TheMealDB):');
      logger.info('  GET /food-list - Seafood list (legacy)');
      logger.info('  GET /food-details/:id - Food details (legacy)');
      logger.info('  GET /api/external/food-list - Seafood list');
      logger.info('  GET /api/external/food-details/:id - Food details');
      logger.info('  GET /api/external/food-category/:category - Food by category');
      logger.info('  GET /api/external/search?q=query - Search meals');
      logger.info('');
      logger.info('🏪 Restaurant Database API:');
      logger.info('  GET /api/restaurants - All restaurants');
      logger.info('  GET /api/restaurants/:id - Specific restaurant');
      logger.info('  GET /api/restaurants/:id/menu - Restaurant menu');
      logger.info('  GET /api/restaurants/city/:city - Restaurants by city');
      logger.info('  GET /api/restaurants/cuisine/:cuisine - Restaurants by cuisine');
      logger.info('');
      logger.info('🍽️ Food & Menu:');
      logger.info('  GET /api/categories - Food categories');
      logger.info('  GET /api/categories/:id/items - Items by category');
      logger.info('  GET /api/food-items/:id - Specific food item');
      logger.info('');
      logger.info('🔍 Search & Discovery:');
      logger.info('  GET /api/search - Advanced search');
      logger.info('  GET /api/featured?limit=20 - Featured items');
      logger.info('  GET /api/trending?limit=20 - Trending items');
      logger.info('');
      logger.info('✨ Server ready for React frontend integration!');
    });
    
    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await gracefulShutdown();
          logger.info('Database connections closed');
          process.exit(0);
        } catch (shutdownError: any) {
          logger.error('Error during shutdown:', shutdownError);
          process.exit(1);
        }
      });
    };
    
    // Handle shutdown signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (startupError: any) {
    logger.error('Failed to start server:', startupError);
    process.exit(1);
  }
}

// Start the application
startServer().catch((error: any) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});