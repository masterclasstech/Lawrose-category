/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class AppConfig {
  @IsString()
  @IsOptional()
  nodeEnv: string = 'development';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  port: number = 8000; // Changed from 5000 to 8000 to match your usage

  @IsString()
  @IsOptional()
  appName: string = 'Category Service';

  @IsString()
  @IsOptional()
  appVersion: string = '1.0.0';

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value ? value.replace(/^\/+|\/+$/g, '') : 'api') // Clean prefix
  apiPrefix: string = 'api'; // Changed from 'api/v1' to 'api' to match your endpoint

  @IsArray()
  @Transform(({ value }) => value ? value.split(',').map((origin: string) => origin.trim()) : [])
  @IsOptional()
  allowedOrigins: string[] = [
    'http://localhost:3000', 
    'http://localhost:5000',
    'http://localhost:8000',
    'http://localhost:3001',
    'http://localhost:4200',
    '*' // Allow all origins in development - remove in production
  ];

  @IsString()
  @IsOptional()
  timezone: string = 'UTC';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableSwagger: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableSwaggerInProduction: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableKafka: boolean = false;

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
  rateLimitMax: number = 100;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  rateLimitWindow: number = 900000; // 15 minutes

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  requestTimeout: number = 30000;

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
  logDbConnection: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  logRedisConnection: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  logKafkaConnection: boolean = false;

  // Microservice specific settings
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableMicroservice: boolean = true;

  @IsString()
  @IsOptional()
  serviceId: string = 'category-service';

  @IsString()
  @IsOptional()
  serviceName: string = 'Category Management Service';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  microservicePort: number = 8001; // Separate port for microservice communication

  // Health check settings
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  healthCheckInterval: number = 30000; // 30 seconds

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  healthCheckTimeout: number = 5000; // 5 seconds

  // Computed properties and getters
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

  get isMicroservice(): boolean {
    return this.enableMicroservice;
  }

  get cleanApiPrefix(): string {
    return this.apiPrefix.replace(/^\/+|\/+$/g, '');
  }

  get fullApiUrl(): string {
    return `http://localhost:${this.port}/${this.cleanApiPrefix}`;
  }

  get baseUrl(): string {
    return `http://localhost:${this.port}`;
  }

  // Get all available endpoints for this microservice
  get availableEndpoints(): Record<string, string> {
    const prefix = this.cleanApiPrefix;
    return {
      root: '/',
      health: '/health',
      apiHealth: `/${prefix}/health`,
      categories: `/${prefix}/categories`,
      subcategories: `/${prefix}/subcategories`,
      collections: `/${prefix}/collections`,
      gender: `/${prefix}/gender`,
      swagger: this.shouldEnableSwagger ? '/api-docs' : null,
    };
  }

  // Get service information
  get serviceInfo(): Record<string, any> {
    return {
      id: this.serviceId,
      name: this.serviceName,
      appName: this.appName,
      version: this.appVersion,
      environment: this.nodeEnv,
      port: this.port,
      microservicePort: this.microservicePort,
      apiPrefix: this.apiPrefix,
      timezone: this.timezone,
    };
  }

  // Get security configuration
  get securityConfig(): Record<string, any> {
    return {
      cors: this.enableCors,
      allowedOrigins: this.allowedOrigins,
      rateLimit: this.enableRateLimit,
      rateLimitMax: this.rateLimitMax,
      rateLimitWindow: this.rateLimitWindow,
      requestTimeout: this.requestTimeout,
      maxFileSize: this.maxFileSize,
    };
  }

  // Get logging configuration
  get loggingConfig(): Record<string, any> {
    return {
      level: this.logLevel,
      dbConnection: this.logDbConnection,
      redisConnection: this.logRedisConnection,
      kafkaConnection: this.logKafkaConnection,
    };
  }

  // Get microservice configuration
  get microserviceConfig(): Record<string, any> {
    return {
      enabled: this.enableMicroservice,
      serviceId: this.serviceId,
      serviceName: this.serviceName,
      port: this.microservicePort,
      kafka: this.enableKafka,
      healthCheckInterval: this.healthCheckInterval,
      healthCheckTimeout: this.healthCheckTimeout,
    };
  }

  // Get feature flags
  get featureFlags(): Record<string, boolean> {
    return {
      swagger: this.shouldEnableSwagger,
      cors: this.enableCors,
      kafka: this.enableKafka,
      rateLimit: this.enableRateLimit,
      microservice: this.enableMicroservice,
    };
  }

  // Utility method to get formatted file size
  get formattedMaxFileSize(): string {
    return `${Math.round(this.maxFileSize / 1024 / 1024)}MB`;
  }

  // Utility method to get formatted timeout
  get formattedRequestTimeout(): string {
    return `${this.requestTimeout}ms`;
  }

  // Utility method to get formatted rate limit window
  get formattedRateLimitWindow(): string {
    return `${this.rateLimitWindow / 1000 / 60} minutes`;
  }

  // Method to validate configuration
  validateConfig(): boolean {
    const errors: string[] = [];

    if (this.port < 1 || this.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    if (this.microservicePort < 1 || this.microservicePort > 65535) {
      errors.push('Microservice port must be between 1 and 65535');
    }

    if (this.port === this.microservicePort) {
      errors.push('Port and microservice port cannot be the same');
    }

    if (this.rateLimitMax < 1) {
      errors.push('Rate limit max must be greater than 0');
    }

    if (this.rateLimitWindow < 1000) {
      errors.push('Rate limit window must be at least 1000ms');
    }

    if (this.requestTimeout < 1000) {
      errors.push('Request timeout must be at least 1000ms');
    }

    if (this.maxFileSize < 1024) {
      errors.push('Max file size must be at least 1024 bytes');
    }

    if (this.healthCheckInterval < 1000) {
      errors.push('Health check interval must be at least 1000ms');
    }

    if (this.healthCheckTimeout < 1000) {
      errors.push('Health check timeout must be at least 1000ms');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

// Export the configuration factory
export default registerAs('app', () => {
  const config = new AppConfig();
  
  // Override with environment variables
  config.nodeEnv = process.env.NODE_ENV || config.nodeEnv;
  config.port = parseInt(process.env.PORT, 10) || config.port;
  config.appName = process.env.APP_NAME || config.appName;
  config.appVersion = process.env.APP_VERSION || config.appVersion;
  config.apiPrefix = process.env.API_PREFIX || config.apiPrefix;
  config.allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : config.allowedOrigins;
  config.timezone = process.env.TIMEZONE || config.timezone;
  config.enableSwagger = process.env.ENABLE_SWAGGER === 'true' || config.enableSwagger;
  config.enableSwaggerInProduction = process.env.ENABLE_SWAGGER_IN_PRODUCTION === 'true' || config.enableSwaggerInProduction;
  config.enableKafka = process.env.ENABLE_KAFKA === 'true' || config.enableKafka;
  config.enableCors = process.env.ENABLE_CORS === 'true' || config.enableCors;
  config.enableRateLimit = process.env.ENABLE_RATE_LIMIT === 'true' || config.enableRateLimit;
  config.rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX, 10) || config.rateLimitMax;
  config.rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW, 10) || config.rateLimitWindow;
  config.requestTimeout = parseInt(process.env.REQUEST_TIMEOUT, 10) || config.requestTimeout;
  config.maxFileSize = parseInt(process.env.MAX_FILE_SIZE, 10) || config.maxFileSize;
  config.logLevel = process.env.LOG_LEVEL || config.logLevel;
  config.logDbConnection = process.env.LOG_DB_CONNECTION === 'true' || config.logDbConnection;
  config.logRedisConnection = process.env.LOG_REDIS_CONNECTION === 'true' || config.logRedisConnection;
  config.logKafkaConnection = process.env.LOG_KAFKA_CONNECTION === 'true' || config.logKafkaConnection;
  config.enableMicroservice = process.env.ENABLE_MICROSERVICE === 'true' || config.enableMicroservice;
  config.serviceId = process.env.SERVICE_ID || config.serviceId;
  config.serviceName = process.env.SERVICE_NAME || config.serviceName;
  config.microservicePort = parseInt(process.env.MICROSERVICE_PORT, 10) || config.microservicePort;
  config.healthCheckInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL, 10) || config.healthCheckInterval;
  config.healthCheckTimeout = parseInt(process.env.HEALTH_CHECK_TIMEOUT, 10) || config.healthCheckTimeout;

  // Validate configuration
  config.validateConfig();

  return config;
});