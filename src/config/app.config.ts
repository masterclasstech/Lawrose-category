/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AppConfig {
  @IsString()
  @IsOptional()
  nodeEnv: string = 'development';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  port: number = 5000;

  @IsString()
  @IsOptional()
  appName: string = 'Category Service';

  @IsString()
  @IsOptional()
  appVersion: string = '1.0.0';

  @IsString()
  @IsOptional()
  apiPrefix: string = 'api/v1';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableSwagger: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableKafka: boolean = true;

  @IsArray()
  @Transform(({ value }) => value ? value.split(',').map((origin: string) => origin.trim()) : [])
  @IsOptional()
  allowedOrigins: string[] = ['http://localhost:5000', 'http://localhost:8000'];

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  logDbConnection: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  logRedisConnection: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  logKafkaConnection: boolean = true;

  @IsString()
  @IsOptional()
  timezone: string = 'UTC';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  requestTimeout: number = 30000; // 30 seconds

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxFileSize: number = 10485760; // 10MB

  @IsString()
  @IsOptional()
  logLevel: string = 'info';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableCors: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableRateLimit: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  rateLimitMax: number = 100; // requests per window

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  rateLimitWindow: number = 900000; // 15 minutes in milliseconds
}

export default registerAs('app', (): AppConfig => {
  const config = new AppConfig();
  
  config.nodeEnv = process.env.NODE_ENV || 'development';
  config.port = parseInt(process.env.PORT, 10) || 5000;
  config.appName = process.env.APP_NAME || 'Category Service';
  config.appVersion = process.env.APP_VERSION || '1.0.0';
  config.apiPrefix = process.env.API_PREFIX || 'api/v1';
  config.enableSwagger = process.env.ENABLE_SWAGGER === 'true' || config.nodeEnv === 'development';
  config.enableKafka = process.env.ENABLE_KAFKA === 'true';
  config.allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5000', 'http://localhost:8000'];
  config.logDbConnection = process.env.LOG_DB_CONNECTION === 'true';
  config.logRedisConnection = process.env.LOG_REDIS_CONNECTION === 'true';
  config.logKafkaConnection = process.env.LOG_KAFKA_CONNECTION === 'true';
  config.timezone = process.env.TIMEZONE || 'UTC';
  config.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT, 10) || 30000;
  config.maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760;
  config.logLevel = process.env.LOG_LEVEL || 'info';
  config.enableCors = process.env.ENABLE_CORS !== 'false';
  config.enableRateLimit = process.env.ENABLE_RATE_LIMIT !== 'false';
  config.rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;
  config.rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000;

  return config;
});