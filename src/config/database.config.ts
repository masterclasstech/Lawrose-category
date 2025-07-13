/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export interface DatabaseConfig {
  mongoUrl: string;
  mongoDbName?: string;
  mongoMaxPoolSize: number;
  mongoMinPoolSize: number;
  mongoMaxIdleTimeMS: number;
  mongoServerSelectionTimeoutMS: number;
  mongoSocketTimeoutMS: number;
  mongoConnectTimeoutMS: number;
  mongoRetryWrites: boolean;
  mongoWriteConcern: string;
  mongoReadPreference: string;
  mongoBufferCommands: boolean;
  mongoBufferMaxEntries: number;
  mongoUseNewUrlParser: boolean;
  mongoUseUnifiedTopology: boolean;
  mongoAutoIndex: boolean;
  mongoAutoCreate: boolean;
  mongoAppName: string;
  mongoHeartbeatFrequencyMS: number;
  mongoMaxStalenessSeconds: number;
  enableLogging: boolean;
  logLevel: string;
  enableMetrics: boolean;
  maxRetries: number;
  retryDelayMs: number;
}

export default registerAs('database', (): DatabaseConfig => {
  const logger = new Logger('DatabaseConfig');
  
  const config: DatabaseConfig = {
    mongoUrl: process.env.MONGO_URL || '',
    mongoDbName: undefined,
    mongoMaxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
    mongoMinPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '5', 10),
    mongoMaxIdleTimeMS: parseInt(process.env.MONGO_MAX_IDLE_TIME_MS || '30000', 10),
    mongoServerSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
    mongoSocketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || '45000', 10),
    mongoConnectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS || '10000', 10),
    mongoRetryWrites: process.env.MONGO_RETRY_WRITES !== 'false',
    mongoWriteConcern: process.env.MONGO_WRITE_CONCERN || 'majority',
    mongoReadPreference: process.env.MONGO_READ_PREFERENCE || 'primary',
    mongoBufferCommands: process.env.MONGO_BUFFER_COMMANDS !== 'false',
    mongoBufferMaxEntries: parseInt(process.env.MONGO_BUFFER_MAX_ENTRIES || '0', 10),
    mongoUseNewUrlParser: true,
    mongoUseUnifiedTopology: true,
    mongoAutoIndex: process.env.MONGO_AUTO_INDEX !== 'false',
    mongoAutoCreate: process.env.MONGO_AUTO_CREATE !== 'false',
    mongoAppName: process.env.MONGO_APP_NAME || 'category-service',
    mongoHeartbeatFrequencyMS: parseInt(process.env.MONGO_HEARTBEAT_FREQUENCY_MS || '10000', 10),
    mongoMaxStalenessSeconds: parseInt(process.env.MONGO_MAX_STALENESS_SECONDS || '90', 10),
    enableLogging: process.env.MONGO_ENABLE_LOGGING === 'true',
    logLevel: process.env.MONGO_LOG_LEVEL || 'info',
    enableMetrics: process.env.MONGO_ENABLE_METRICS !== 'false',
    maxRetries: parseInt(process.env.MONGO_MAX_RETRIES || '3', 10),
    retryDelayMs: parseInt(process.env.MONGO_RETRY_DELAY_MS || '1000', 10)
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
  } else if (process.env.MONGO_DB_NAME) {
    config.mongoDbName = process.env.MONGO_DB_NAME;
    logger.log(`Database name set from environment: ${config.mongoDbName}`);
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
      this.logger.warn('Database disconnected');
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