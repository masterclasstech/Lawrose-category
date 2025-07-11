/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export default registerAs('database', () => {
  const logger = new Logger('DatabaseConfig');
  
  const config = {
    mongoUrl: process.env.MONGO_URL || '',
    mongoDbName: undefined as string | undefined,
    mongoMaxPoolSize: 10,
    mongoMinPoolSize: 5,
    mongoMaxIdleTimeMS: 30000,
    mongoServerSelectionTimeoutMS: 5000,
    mongoSocketTimeoutMS: 45000,
    mongoConnectTimeoutMS: 10000,
    mongoRetryWrites: true,
    mongoWriteConcern: 'majority',
    mongoReadPreference: 'primary',
    mongoBufferCommands: true,
    mongoBufferMaxEntries: 0,
    mongoUseNewUrlParser: true,
    mongoUseUnifiedTopology: true,
    mongoAutoIndex: true,
    mongoAutoCreate: true,
    mongoAppName: 'category-service',
    mongoHeartbeatFrequencyMS: 10000,
    mongoMaxStalenessSeconds: 90,
    enableLogging: false,
    logLevel: 'info',
    enableMetrics: true,
    maxRetries: 3,
    retryDelayMs: 1000
  };
  
  // Log configuration loading
  logger.log('Loading database configuration...');
  
  // Extract database name from URL if not provided separately
  if (!process.env.MONGO_DB_NAME && process.env.MONGO_URL) {
    try {
      const url = new URL(process.env.MONGO_URL);
      const pathName = url.pathname.slice(1);
      if (pathName && pathName !== '') {
        config.mongoDbName = pathName.split('?')[0];
        logger.log(`Database name extracted from URL: ${config.mongoDbName}`);
      }
    } catch (error) {
      logger.error('Failed to parse MONGO_URL for database name extraction', error);
    }
  } else {
    config.mongoDbName = process.env.MONGO_DB_NAME;
    if (config.mongoDbName) {
      logger.log(`Database name set from environment: ${config.mongoDbName}`);
    }
  }

  // Override defaults only if provided and valid
  if (process.env.MONGO_MAX_POOL_SIZE && !isNaN(Number(process.env.MONGO_MAX_POOL_SIZE))) {
    config.mongoMaxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10);
  }
  if (process.env.MONGO_MIN_POOL_SIZE && !isNaN(Number(process.env.MONGO_MIN_POOL_SIZE))) {
    config.mongoMinPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE, 10);
  }
  if (process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS && !isNaN(Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS))) {
    config.mongoServerSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10);
  }
  if (process.env.MONGO_ENABLE_LOGGING === 'true') {
    config.enableLogging = true;
  }
  if (process.env.MONGO_LOG_LEVEL) {
    config.logLevel = process.env.MONGO_LOG_LEVEL;
  }
  if (process.env.MONGO_MAX_RETRIES && !isNaN(Number(process.env.MONGO_MAX_RETRIES))) {
    config.maxRetries = parseInt(process.env.MONGO_MAX_RETRIES, 10);
  }

  // Log final configuration (without sensitive data)
  logger.log(`Database configuration loaded successfully - Host: ${config.mongoUrl ? '[SET]' : '[NOT SET]'}, DB: ${config.mongoDbName || '[NOT SET]'}`);
  
  return config;
});

// Database connection service for handling connection events
export class DatabaseConnectionService {
  private readonly logger = new Logger('DatabaseConnection');

  async testConnection(mongooseConnection: any): Promise<boolean> {
    try {
      // Test database connection
      await mongooseConnection.db.admin().ping();
      this.logger.log('Database connection successful');
      return true;
    } catch (error) {
      this.logger.error('Database connection failed', error);
      return false;
    }
  }

  setupConnectionEvents(mongooseConnection: any): void {
    mongooseConnection.on('connected', () => {
      this.logger.log('Database connected successfully');
    });

    mongooseConnection.on('disconnected', () => {
      this.logger.warn('🔌 Database disconnected');
    });

    mongooseConnection.on('error', (error: Error) => {
      this.logger.error('Database connection error', error);
    });

    mongooseConnection.on('reconnected', () => {
      this.logger.log('Database reconnected successfully');
    });

    mongooseConnection.on('reconnectFailed', () => {
      this.logger.error('Database reconnection failed');
    });
  }
}