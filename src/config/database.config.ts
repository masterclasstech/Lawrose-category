/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export interface DatabaseConfig {
  mongoUrl: string;
  mongoDbName?: string;
  // Only essential options for Atlas
  maxPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
  connectTimeoutMS?: number;
  retryWrites?: boolean;
  appName?: string;
  autoIndex?: boolean;
  autoCreate?: boolean;
}

export default registerAs('database', (): DatabaseConfig => {
  const logger = new Logger('DatabaseConfig');
  
  const config: DatabaseConfig = {
    mongoUrl: process.env.MONGO_URL || '',
    mongoDbName: process.env.MONGO_DB_NAME,
    
    // Only essential configuration for Atlas
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
    serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '5000', 10),
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || '45000', 10),
    connectTimeoutMS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS || '10000', 10),
    retryWrites: process.env.MONGO_RETRY_WRITES !== 'false',
    appName: process.env.MONGO_APP_NAME || 'category-service',
    autoIndex: process.env.NODE_ENV !== 'production', // Only in development
    autoCreate: process.env.MONGO_AUTO_CREATE !== 'false',
  };
  
  // Extract database name from URL if not provided separately
  if (!config.mongoDbName && config.mongoUrl) {
    try {
      const url = new URL(config.mongoUrl);
      const pathName = url.pathname.slice(1);
      if (pathName && pathName !== '') {
        config.mongoDbName = pathName.split('?')[0];
        logger.log(`Database name extracted from URL: ${config.mongoDbName}`);
      }
    } catch (error) {
      logger.error('Failed to parse MONGO_URL for database name extraction', error);
    }
  }

  logger.log(`Database configuration loaded - DB: ${config.mongoDbName || '[NOT SET]'}`);
  
  return config;
});

// Simplified connection service
export class DatabaseConnectionService {
  private readonly logger = new Logger('DatabaseConnection');

  setupConnectionEvents(mongooseConnection: any): void {
    mongooseConnection.on('connected', () => {
      this.logger.log('Database connected successfully');
    });

    mongooseConnection.on('disconnected', () => {
      this.logger.warn('Database disconnected');
    });

    mongooseConnection.on('error', (error: Error) => {
      this.logger.error('Database connection error:', error.message);
    });

    mongooseConnection.on('reconnected', () => {
      this.logger.log('Database reconnected successfully');
    });
  }
}