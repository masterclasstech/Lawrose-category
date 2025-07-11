/* eslint-disable prettier/prettier */
import { registerAs as registerRedisConfig } from '@nestjs/config';
import { Logger } from '@nestjs/common';

export const redisConfig = registerRedisConfig('redis', () => {
  const logger = new Logger('RedisConfig');
  
  const config = {
    redisUrl: process.env.REDIS_URL || '',
    host: 'localhost',
    port: 6379,
    password: undefined as string | undefined,
    username: undefined as string | undefined,
    db: 0,
    connectTimeout: 10000,
    commandTimeout: 5000,
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: true,
    lazyConnect: true,
    keepAlive: true,
    family: 4,
    keyPrefix: 'category-service:',
    defaultTtl: 3600,
    enableAutoPipelining: true,
    enableOfflineQueue: false,
    enableHealthCheck: true,
    healthCheckInterval: 30000,
    enableMetrics: true,
    maxMemoryPolicy: 'allkeys-lru',
    maxMemoryMB: 256,
    enableCluster: false,
    clusterNodes: ''
  };
  
  // Log configuration loading
  logger.log('Loading Redis configuration...');
  
  // Set Redis URL from environment - no validation, let connection handle it
  config.redisUrl = process.env.REDIS_URL || '';
  
  // Parse Redis URL to extract connection details - only if URL is provided
  if (process.env.REDIS_URL) {
    try {
      const redisUrl = new URL(process.env.REDIS_URL);
      config.host = redisUrl.hostname;
      config.port = parseInt(redisUrl.port, 10) || 6379;
      config.password = redisUrl.password || undefined;
      config.username = redisUrl.username || undefined;
      config.db = parseInt(redisUrl.pathname.slice(1), 10) || 0;
      logger.log(`Redis URL parsed successfully - Host: ${config.host}, Port: ${config.port}, DB: ${config.db}`);
    } catch (error) {
      logger.error('Failed to parse REDIS_URL', error);
    }
  }

  // Override defaults only if provided and valid
  if (process.env.REDIS_CONNECT_TIMEOUT && !isNaN(Number(process.env.REDIS_CONNECT_TIMEOUT))) {
    config.connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10);
  }
  if (process.env.REDIS_COMMAND_TIMEOUT && !isNaN(Number(process.env.REDIS_COMMAND_TIMEOUT))) {
    config.commandTimeout = parseInt(process.env.REDIS_COMMAND_TIMEOUT, 10);
  }
  if (process.env.REDIS_KEY_PREFIX) {
    config.keyPrefix = process.env.REDIS_KEY_PREFIX;
  }
  if (process.env.REDIS_DEFAULT_TTL && !isNaN(Number(process.env.REDIS_DEFAULT_TTL))) {
    config.defaultTtl = parseInt(process.env.REDIS_DEFAULT_TTL, 10);
  }
  if (process.env.REDIS_ENABLE_HEALTH_CHECK === 'false') {
    config.enableHealthCheck = false;
  }

  // Log final configuration (without sensitive data)
  logger.log(`Redis configuration loaded successfully - Host: ${config.host}, Port: ${config.port}, DB: ${config.db}`);
  
  return config;
});

// Redis connection service for handling connection events
export class RedisConnectionService {
  private readonly logger = new Logger('RedisConnection');

  async testConnection(redisClient: any): Promise<boolean> {
    try {
      // Test Redis connection
      await redisClient.ping();
      this.logger.log('Redis connection successful');
      return true;
    } catch (error) {
      this.logger.error('Redis connection failed', error);
      return false;
    }
  }

  setupConnectionEvents(redisClient: any): void {
    redisClient.on('connect', () => {
      this.logger.log('Redis connecting...');
    });

    redisClient.on('ready', () => {
      this.logger.log('Redis connected and ready');
    });

    redisClient.on('error', (error: Error) => {
      this.logger.error('Redis connection error', error);
    });

    redisClient.on('close', () => {
      this.logger.warn('🔌 Redis connection closed');
    });

    redisClient.on('reconnecting', (delay: number) => {
      this.logger.log(`Redis reconnecting in ${delay}ms...`);
    });

    redisClient.on('end', () => {
      this.logger.warn('Redis connection ended');
    });

    redisClient.on('lazyConnect', () => {
      this.logger.log('Redis lazy connection established');
    });
  }

  async performHealthCheck(redisClient: any): Promise<void> {
    try {
      const start = Date.now();
      await redisClient.ping();
      const latency = Date.now() - start;
      this.logger.log(`Redis health check passed - Latency: ${latency}ms`);
    } catch (error) {
      this.logger.error('Redis health check failed', error);
    }
  }
}