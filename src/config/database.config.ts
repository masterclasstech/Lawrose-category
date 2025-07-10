/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class DatabaseConfig {
  @IsUrl()
  @IsString()
  mongoUrl: string;

  @IsString()
  @IsOptional()
  mongoDbName: string = 'category';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoMaxPoolSize: number = 10;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoMinPoolSize: number = 5;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoMaxIdleTimeMS: number = 30000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoServerSelectionTimeoutMS: number = 5000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoSocketTimeoutMS: number = 45000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoConnectTimeoutMS: number = 10000;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  mongoRetryWrites: boolean = true;

  @IsString()
  @IsOptional()
  mongoWriteConcern: string = 'majority';

  @IsString()
  @IsOptional()
  mongoReadPreference: string = 'primary';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  mongoBufferCommands: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoBufferMaxEntries: number = 0;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  mongoUseNewUrlParser: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  mongoUseUnifiedTopology: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  mongoAutoIndex: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  mongoAutoCreate: boolean = true;

  @IsString()
  @IsOptional()
  mongoAppName: string = 'category-service';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoHeartbeatFrequencyMS: number = 10000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  mongoMaxStalenessSeconds: number = 90;

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
  maxRetries: number = 3;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  retryDelayMs: number = 1000;
}

export default registerAs('database', (): DatabaseConfig => {
  const config = new DatabaseConfig();
  
  if (!process.env.MONGO_URL) {
    throw new Error('MONGO_URL is required');
  }

  config.mongoUrl = process.env.MONGO_URL;
  config.mongoDbName = process.env.MONGO_DB_NAME || 'category';
  config.mongoMaxPoolSize = parseInt(process.env.MONGO_MAX_POOL_SIZE, 10) || 10;
  config.mongoMinPoolSize = parseInt(process.env.MONGO_MIN_POOL_SIZE, 10) || 5;
  config.mongoMaxIdleTimeMS = parseInt(process.env.MONGO_MAX_IDLE_TIME_MS, 10) || 30000;
  config.mongoServerSelectionTimeoutMS = parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS, 10) || 5000;
  config.mongoSocketTimeoutMS = parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS, 10) || 45000;
  config.mongoConnectTimeoutMS = parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS, 10) || 10000;
  config.mongoRetryWrites = process.env.MONGO_RETRY_WRITES !== 'false';
  config.mongoWriteConcern = process.env.MONGO_WRITE_CONCERN || 'majority';
  config.mongoReadPreference = process.env.MONGO_READ_PREFERENCE || 'primary';
  config.mongoBufferCommands = process.env.MONGO_BUFFER_COMMANDS !== 'false';
  config.mongoBufferMaxEntries = parseInt(process.env.MONGO_BUFFER_MAX_ENTRIES, 10) || 0;
  config.mongoUseNewUrlParser = process.env.MONGO_USE_NEW_URL_PARSER !== 'false';
  config.mongoUseUnifiedTopology = process.env.MONGO_USE_UNIFIED_TOPOLOGY !== 'false';
  config.mongoAutoIndex = process.env.MONGO_AUTO_INDEX !== 'false';
  config.mongoAutoCreate = process.env.MONGO_AUTO_CREATE !== 'false';
  config.mongoAppName = process.env.MONGO_APP_NAME || 'category-service';
  config.mongoHeartbeatFrequencyMS = parseInt(process.env.MONGO_HEARTBEAT_FREQUENCY_MS, 10) || 10000;
  config.mongoMaxStalenessSeconds = parseInt(process.env.MONGO_MAX_STALENESS_SECONDS, 10) || 90;
  config.enableLogging = process.env.MONGO_ENABLE_LOGGING === 'true';
  config.logLevel = process.env.MONGO_LOG_LEVEL || 'info';
  config.enableMetrics = process.env.MONGO_ENABLE_METRICS !== 'false';
  config.maxRetries = parseInt(process.env.MONGO_MAX_RETRIES, 10) || 3;
  config.retryDelayMs = parseInt(process.env.MONGO_RETRY_DELAY_MS, 10) || 1000;

  return config;
});