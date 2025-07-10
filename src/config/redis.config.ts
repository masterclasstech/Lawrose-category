/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RedisConfig {
  @IsUrl()
  @IsString()
  redisUrl: string;

  @IsString()
  @IsOptional()
  host: string = 'localhost';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  port: number = 6379;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  username: string;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  db: number = 0;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  connectTimeout: number = 10000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  commandTimeout: number = 5000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  retryDelayOnFailover: number = 100;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableReadyCheck: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxRetriesPerRequest: number = 3;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  lazyConnect: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  keepAlive: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  family: number = 4;

  @IsString()
  @IsOptional()
  keyPrefix: string = 'category-service:';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  defaultTtl: number = 3600; // 1 hour in seconds

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxMemoryPolicy: string = 'allkeys-lru';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableOfflineQueue: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableAutoPipelining: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableLogging: boolean = false;

  @IsString()
  @IsOptional()
  logLevel: string = 'info';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableMetrics: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxMemoryMB: number = 256;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  healthCheckInterval: number = 30000; // 30 seconds

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableHealthCheck: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxConcurrentConnections: number = 10;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  idleTimeout: number = 30000; // 30 seconds

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableCluster: boolean = false;

  @IsString()
  @IsOptional()
  clusterNodes: string = '';
}

export default registerAs('redis', (): RedisConfig => {
  const config = new RedisConfig();
  
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is required');
  }

  config.redisUrl = process.env.REDIS_URL;
  
  // Parse Redis URL to extract components
  try {
    const redisUrl = new URL(process.env.REDIS_URL);
    config.host = redisUrl.hostname;
    config.port = parseInt(redisUrl.port, 10) || 6379;
    config.password = redisUrl.password || undefined;
    config.username = redisUrl.username || undefined;
    config.db = parseInt(redisUrl.pathname.slice(1), 10) || 0;
  } catch  {
    throw new Error('Invalid REDIS_URL format');
  }

  config.connectTimeout = parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) || 10000;
  config.commandTimeout = parseInt(process.env.REDIS_COMMAND_TIMEOUT, 10) || 5000;
  config.retryDelayOnFailover = parseInt(process.env.REDIS_RETRY_DELAY_FAILOVER, 10) || 100;
  config.enableReadyCheck = process.env.REDIS_ENABLE_READY_CHECK !== 'false';
  config.maxRetriesPerRequest = parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST, 10) || 3;
  config.lazyConnect = process.env.REDIS_LAZY_CONNECT !== 'false';
  config.keepAlive = process.env.REDIS_KEEP_ALIVE !== 'false';
  config.family = parseInt(process.env.REDIS_FAMILY, 10) || 4;
  config.keyPrefix = process.env.REDIS_KEY_PREFIX || 'category-service:';
  config.defaultTtl = parseInt(process.env.REDIS_DEFAULT_TTL, 10) || 3600;
  config.maxMemoryPolicy = process.env.REDIS_MAX_MEMORY_POLICY || 'allkeys-lru';
  config.enableOfflineQueue = process.env.REDIS_ENABLE_OFFLINE_QUEUE === 'true';
  config.enableAutoPipelining = process.env.REDIS_ENABLE_AUTO_PIPELINING !== 'false';
  config.enableLogging = process.env.REDIS_ENABLE_LOGGING === 'true';
  config.logLevel = process.env.REDIS_LOG_LEVEL || 'info';
  config.enableMetrics = process.env.REDIS_ENABLE_METRICS !== 'false';
  config.maxMemoryMB = parseInt(process.env.REDIS_MAX_MEMORY_MB, 10) || 256;
  config.healthCheckInterval = parseInt(process.env.REDIS_HEALTH_CHECK_INTERVAL, 10) || 30000;
  config.enableHealthCheck = process.env.REDIS_ENABLE_HEALTH_CHECK !== 'false';
  config.maxConcurrentConnections = parseInt(process.env.REDIS_MAX_CONCURRENT_CONNECTIONS, 10) || 10;
  config.idleTimeout = parseInt(process.env.REDIS_IDLE_TIMEOUT, 10) || 30000;
  config.enableCluster = process.env.REDIS_ENABLE_CLUSTER === 'true';
  config.clusterNodes = process.env.REDIS_CLUSTER_NODES || '';

  return config;
});