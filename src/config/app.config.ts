/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
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

  @IsArray()
  @Transform(({ value }) => value ? value.split(',').map((origin: string) => origin.trim()) : [])
  @IsOptional()
  allowedOrigins: string[] = ['http://localhost:3000', 'http://localhost:5000'];

  // All other properties with defaults - no validation needed
  timezone: string = 'UTC';
  enableSwagger: boolean = true;
  enableSwaggerInProduction: boolean = false;
  enableKafka: boolean = false;
  enableCors: boolean = true;
  enableRateLimit: boolean = true;
  rateLimitMax: number = 100;
  rateLimitWindow: number = 900000;
  requestTimeout: number = 30000;
  maxFileSize: number = 10485760;
  logLevel: string = 'info';
  logDbConnection: boolean = false;
  logRedisConnection: boolean = false;
  logKafkaConnection: boolean = false;

  get shouldEnableSwagger(): boolean {
    if (this.nodeEnv === 'production') {
      return this.enableSwaggerInProduction;
    }
    return this.enableSwagger;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }
}

export default registerAs('app', (): AppConfig => {
  const config = new AppConfig();
  
  // Core settings
  if (process.env.NODE_ENV) {
    config.nodeEnv = process.env.NODE_ENV;
  }
  if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
    config.port = parseInt(process.env.PORT, 10);
  }
  if (process.env.APP_NAME) {
    config.appName = process.env.APP_NAME;
  }
  if (process.env.APP_VERSION) {
    config.appVersion = process.env.APP_VERSION;
  }
  if (process.env.API_PREFIX) {
    config.apiPrefix = process.env.API_PREFIX;
  }

  // Feature flags
  if (process.env.ENABLE_SWAGGER === 'false') {
    config.enableSwagger = false;
  }
  if (process.env.ENABLE_SWAGGER_IN_PRODUCTION === 'true') {
    config.enableSwaggerInProduction = true;
  }
  if (process.env.ENABLE_KAFKA === 'true') {
    config.enableKafka = true;
  }
  if (process.env.ENABLE_CORS === 'false') {
    config.enableCors = false;
  }

  // CORS origins
  if (process.env.ALLOWED_ORIGINS) {
    config.allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }

  // Rate limiting
  if (process.env.RATE_LIMIT_MAX && !isNaN(Number(process.env.RATE_LIMIT_MAX))) {
    config.rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX, 10);
  }
  if (process.env.RATE_LIMIT_WINDOW && !isNaN(Number(process.env.RATE_LIMIT_WINDOW))) {
    config.rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW, 10);
  }

  // Request settings
  if (process.env.REQUEST_TIMEOUT && !isNaN(Number(process.env.REQUEST_TIMEOUT))) {
    config.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT, 10);
  }
  if (process.env.MAX_FILE_SIZE && !isNaN(Number(process.env.MAX_FILE_SIZE))) {
    config.maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10);
  }

  // Logging
  if (process.env.LOG_LEVEL) {
    config.logLevel = process.env.LOG_LEVEL;
  }
  if (process.env.LOG_DB_CONNECTION === 'true') {
    config.logDbConnection = true;
  }
  if (process.env.LOG_REDIS_CONNECTION === 'true') {
    config.logRedisConnection = true;
  }
  if (process.env.LOG_KAFKA_CONNECTION === 'true') {
    config.logKafkaConnection = true;
  }

  return config;
});