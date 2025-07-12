import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";
import {
  initializeDatabase,
  gracefulShutdown,
} from "./utils/database/database_setup";
import { migrationRunner } from "./utils/database/migrate";
import { seedRunner } from "./utils/database/seed";
import { logger } from "./utils/logger";
import { ExternalApiController } from "./controllers/external.controller";
import apiRoutes from "./routes/api.routes";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS - automatically handles both local and production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      database: process.env.DATABASE_URL ? "Render" : "Local",
      version: "1.0.0",
    },
  });
});

// Routes
app.get("/food-list", ExternalApiController.getFoodList);
app.get("/food-details/:id", ExternalApiController.getFoodDetails);
app.use("/api", apiRoutes);

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Start server
async function startServer(): Promise<void> {
  try {
    logger.info("🚀 Starting Restaurant Backend...");

    // Initialize database
    await initializeDatabase();

    // Run migrations
    logger.info("Running migrations...");
    await migrationRunner.runMigrations();

    // Run seeds (only in development)
    if (process.env.NODE_ENV === "development") {
      try {
        logger.info("Running seeds...");
        await seedRunner.runSeeds();
      } catch (seedError: any) {
        logger.error("Seeding failed (continuing):", seedError.message);
      }
    }

    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `🗄️  Database: ${
          process.env.DATABASE_URL ? "Render PostgreSQL" : "Local PostgreSQL"
        }`
      );
      logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}, shutting down...`);
      server.close(async () => {
        try {
          await gracefulShutdown();
          process.exit(0);
        } catch (error: any) {
          logger.error("Shutdown error:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error: any) {
    logger.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

// Start the app
if (require.main === module) {
  startServer();
}

export default app;
