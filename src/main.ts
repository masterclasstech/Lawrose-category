/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfig } from './config/app.config';
import { SwaggerConfig } from './config/swagger.config';
import * as compression from 'compression';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: process.env.NODE_ENV === 'development' 
        ? ['log', 'error', 'warn', 'debug', 'verbose'] 
        : ['log', 'error', 'warn'],
      cors: true,
    });

    // Get configuration services
    const configService = app.get(ConfigService);
    const appConfig = configService.get<AppConfig>('app');
    const swaggerConfig = configService.get<SwaggerConfig>('swagger');

    // Validate required config
    if (!appConfig) {
      throw new Error('App configuration is not available');
    }

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "https:"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // Compression middleware
    app.use(compression());

    // Body parsing middleware with configurable limits
    const maxFileSize = `${Math.round(appConfig.maxFileSize / 1024 / 1024)}mb`;
    app.use(json({ limit: maxFileSize }));
    app.use(urlencoded({ extended: true, limit: maxFileSize }));

    // CORS configuration (setup before global prefix)
    if (appConfig.enableCors) {
      app.enableCors({
        origin: appConfig.allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
        credentials: true,
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'X-API-Key',
          'Cache-Control',
          'Pragma',
          'Expires',
          'Last-Modified',
          'If-Modified-Since',
          'If-None-Match',
          'ETag',
          'X-Forwarded-For',
          'X-Real-IP',
          'User-Agent',
          'Referer',
        ],
        exposedHeaders: [
          'X-Total-Count',
          'X-Page-Count',
          'X-Current-Page',
          'X-Per-Page',
          'X-Rate-Limit-Remaining',
          'X-Rate-Limit-Reset',
          'X-Request-ID',
          'X-Response-Time',
          'ETag',
          'Last-Modified',
        ],
        maxAge: 86400, // 24 hours
      });
    }

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        validationError: {
          target: false,
          value: false,
        },
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
            value: error.value,
          }));
          return new Error(`Validation failed: ${JSON.stringify(messages)}`);
        },
      }),
    );

    // Global filters
    app.useGlobalFilters(
      new HttpExceptionFilter(configService),
      new MongoExceptionFilter(configService),
    );

    // Global interceptors
    const reflector = app.get('Reflector');
    app.useGlobalInterceptors(
      new LoggingInterceptor(reflector),
      new TransformInterceptor(reflector),
    );

    // Set global prefix for API routes - this should be applied to all controllers
    // Make sure the prefix doesn't have leading/trailing slashes
    const globalPrefix = appConfig.apiPrefix.replace(/^\/+|\/+$/g, '');
    app.setGlobalPrefix(globalPrefix);

    // Health check endpoints (these should be outside the global prefix)
    setupHealthEndpoints(app, appConfig, configService, logger);

    // Kafka microservice setup
    await setupKafkaMicroservice(app, configService, appConfig, logger);

    // Swagger/OpenAPI configuration
    setupSwaggerDocumentation(app, appConfig, swaggerConfig, logger);

    // Graceful shutdown handlers
    setupGracefulShutdown(app, logger);

    // Start microservices if enabled
    if (appConfig.enableKafka) {
      await app.startAllMicroservices();
      logger.log('Kafka microservices started successfully');
    }

    // Start HTTP server
    await app.listen(appConfig.port, '0.0.0.0'); // Listen on all interfaces for Docker
    
    logApplicationStartup(appConfig, swaggerConfig, logger, configService);

  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
}

function setupHealthEndpoints(app: any, appConfig: AppConfig, configService: any, logger: Logger) {
  const httpAdapter = app.getHttpAdapter();
  
  // Health check endpoint with global prefix
  const healthEndpoint = `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/health`;
  
  // Comprehensive health check endpoint
  httpAdapter.get(healthEndpoint, async (req, res) => {
    try {
      const startTime = Date.now();
      const healthData = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: appConfig.appName,
        version: appConfig.appVersion,
        environment: appConfig.nodeEnv,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
        endpoints: {
          categories: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/categories`,
          subcategories: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/subcategories`,
          collections: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/collections`,
          gender: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/gender`,
        },
        dependencies: {
          database: 'unknown',
          redis: 'unknown',
          kafka: 'unknown',
        },
        configuration: {
          cors: appConfig.enableCors,
          kafka: appConfig.enableKafka,
          swagger: appConfig.shouldEnableSwagger,
          microservice: true,
        },
      };

      // Check database connection
      if (appConfig.logDbConnection) {
        try {
          const connection = app.get('DatabaseConnection', { strict: false });
          healthData.dependencies.database = connection?.readyState === 1 ? 'ok' : 'disconnected';
        } catch {
          healthData.dependencies.database = 'error';
        }
      }

      // Check Redis connection
      if (appConfig.logRedisConnection) {
        try {
          const redisService = app.get('RedisService', { strict: false });
          healthData.dependencies.redis = redisService?.status === 'ready' ? 'ok' : 'disconnected';
        } catch {
          healthData.dependencies.redis = 'error';
        }
      }

      // Check Kafka connection
      if (appConfig.enableKafka && appConfig.logKafkaConnection) {
        try {
          const kafkaService = app.get('KafkaService', { strict: false });
          healthData.dependencies.kafka = kafkaService?.isConnected() ? 'ok' : 'disconnected';
        } catch {
          healthData.dependencies.kafka = 'error';
        }
      } else {
        healthData.dependencies.kafka = appConfig.enableKafka ? 'enabled' : 'disabled';
      }

      const responseTime = Date.now() - startTime;
      
      res.status(200).json({
        ...healthData,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: appConfig.appName,
        version: appConfig.appVersion,
        environment: appConfig.nodeEnv,
        error: error.message,
      });
    }
  });

  // Simple health check endpoint (without global prefix for load balancers)
  httpAdapter.get('/health', async (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: appConfig.appName,
      version: appConfig.appVersion,
      microservice: true,
    });
  });

  // Root endpoint to show available routes
  httpAdapter.get('/', async (req, res) => {
    res.status(200).json({
      service: appConfig.appName,
      version: appConfig.appVersion,
      environment: appConfig.nodeEnv,
      apiPrefix: appConfig.apiPrefix,
      availableEndpoints: {
        health: '/health',
        apiHealth: healthEndpoint,
        categories: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/categories`,
        subcategories: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/subcategories`,
        collections: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/collections`,
        gender: `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/gender`,
        swagger: appConfig.shouldEnableSwagger ? '/api-docs' : null,
      },
      timestamp: new Date().toISOString(),
    });
  });
}

async function setupKafkaMicroservice(app: any, configService: any, appConfig: AppConfig, logger: Logger) {
  if (!appConfig.enableKafka) {
    return;
  }

  const kafkaConfig = configService.get('kafka');
  if (!kafkaConfig?.enabled) {
    logger.warn('Kafka is enabled in app config but Kafka configuration is missing or disabled');
    return;
  }

  const microserviceOptions: MicroserviceOptions = {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: kafkaConfig.clientId,
        brokers: kafkaConfig.brokers,
        ssl: kafkaConfig.ssl,
        sasl: kafkaConfig.sasl,
        connectionTimeout: kafkaConfig.connectionTimeout,
        requestTimeout: kafkaConfig.requestTimeout,
        retry: kafkaConfig.retry,
      },
      consumer: {
        groupId: kafkaConfig.consumer.groupId,
        allowAutoTopicCreation: kafkaConfig.consumer.allowAutoTopicCreation,
        sessionTimeout: kafkaConfig.consumer.sessionTimeout,
        heartbeatInterval: kafkaConfig.consumer.heartbeatInterval,
        maxBytesPerPartition: kafkaConfig.consumer.maxBytesPerPartition,
        maxBytes: kafkaConfig.consumer.maxBytes,
        maxWaitTimeInMs: kafkaConfig.consumer.maxWaitTimeInMs,
      },
      producer: {
        allowAutoTopicCreation: kafkaConfig.producer.allowAutoTopicCreation,
        maxInFlightRequests: kafkaConfig.producer.maxInFlightRequests,
        idempotent: kafkaConfig.producer.idempotent,
        transactionTimeout: kafkaConfig.producer.transactionTimeout,
      },
    },
  };

  app.connectMicroservice(microserviceOptions);
  
  if (appConfig.logKafkaConnection) {
    logger.log(`Kafka microservice configured with brokers: ${kafkaConfig.brokers.join(', ')}`);
  }
}

function setupSwaggerDocumentation(app: any, appConfig: AppConfig, swaggerConfig: any, logger: Logger) {
  if (!appConfig.shouldEnableSwagger || !swaggerConfig) {
    return;
  }

  const documentBuilder = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .setContact(
      swaggerConfig.contactName,
      swaggerConfig.contactUrl,
      swaggerConfig.contactEmail,
    )
    .setLicense(swaggerConfig.licenseName, swaggerConfig.licenseUrl)
    .setExternalDoc(swaggerConfig.externalDocsDescription, swaggerConfig.externalDocsUrl);

  // Add servers
  swaggerConfig.servers?.forEach(server => {
    documentBuilder.addServer(server);
  });

  // Add tags for microservice endpoints
  const microserviceTags = [
    { name: 'Categories', description: 'Category management endpoints' },
    { name: 'Subcategories', description: 'Subcategory management endpoints' },
    { name: 'Collections', description: 'Collection management endpoints' },
    { name: 'Gender', description: 'Gender management endpoints' },
    { name: 'Health', description: 'Health check endpoints' },
  ];

  microserviceTags.forEach(tag => {
    documentBuilder.addTag(tag.name, tag.description);
  });

  // Add existing tags
  swaggerConfig.tags?.forEach(tag => {
    documentBuilder.addTag(tag);
  });

  // Add security schemes
  if (swaggerConfig.enableApiKey) {
    documentBuilder.addApiKey(
      {
        type: 'apiKey',
        name: swaggerConfig.apiKeyName,
        in: 'header' as 'header' | 'query' | 'cookie',
        description: 'API Key for authentication',
      },
      'api-key',
    );
  }

  if (swaggerConfig.enableBearerAuth) {
    documentBuilder.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: swaggerConfig.bearerFormat,
        description: 'JWT Bearer token for authentication',
      },
      'bearer-token',
    );
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  // Add health check endpoint to Swagger
  addHealthCheckToSwagger(document, appConfig);

  const swaggerOptions = {
    explorer: swaggerConfig.enableExplorer,
    swaggerOptions: {
      docExpansion: swaggerConfig.docExpansion,
      filter: swaggerConfig.enableFilter,
      defaultModelsExpandDepth: swaggerConfig.defaultModelsExpandDepth,
      defaultModelRendering: swaggerConfig.defaultModelRendering,
      operationsSorter: swaggerConfig.operationsSorter,
      tagsSorter: swaggerConfig.tagsSorter,
      tryItOutEnabled: swaggerConfig.enableTryItOut,
    },
    customCss: swaggerConfig.customCss,
    customSiteTitle: swaggerConfig.customSiteTitle,
    customfavIcon: swaggerConfig.customFavIcon,
  };

  SwaggerModule.setup(swaggerConfig.path, app, document, swaggerOptions);
  
  logger.log(`Swagger documentation available at: http://localhost:${appConfig.port}/${swaggerConfig.path}`);
}

function addHealthCheckToSwagger(document: any, appConfig: AppConfig) {
  // Add health check endpoints to Swagger documentation
  const healthEndpoint = `/${appConfig.apiPrefix.replace(/^\/+|\/+$/g, '')}/health`;
  
  document.paths[healthEndpoint] = {
    get: {
      tags: ['Health'],
      summary: 'Comprehensive Health Check',
      description: 'Check the health status of the microservice with detailed information',
      responses: {
        '200': {
          description: 'Service is healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  timestamp: { type: 'string', format: 'date-time' },
                  service: { type: 'string', example: appConfig.appName },
                  version: { type: 'string', example: appConfig.appVersion },
                  environment: { type: 'string', example: appConfig.nodeEnv },
                  uptime: { type: 'number', example: 3600 },
                  memory: {
                    type: 'object',
                    properties: {
                      used: { type: 'number', example: 50 },
                      total: { type: 'number', example: 100 },
                      external: { type: 'number', example: 10 },
                    },
                  },
                  endpoints: {
                    type: 'object',
                    properties: {
                      categories: { type: 'string', example: '/api/categories' },
                      subcategories: { type: 'string', example: '/api/subcategories' },
                      collections: { type: 'string', example: '/api/collections' },
                      gender: { type: 'string', example: '/api/gender' },
                    },
                  },
                  dependencies: {
                    type: 'object',
                    properties: {
                      database: { type: 'string', example: 'ok' },
                      redis: { type: 'string', example: 'ok' },
                      kafka: { type: 'string', example: 'ok' },
                    },
                  },
                  configuration: {
                    type: 'object',
                    properties: {
                      cors: { type: 'boolean', example: appConfig.enableCors },
                      kafka: { type: 'boolean', example: appConfig.enableKafka },
                      swagger: { type: 'boolean', example: appConfig.shouldEnableSwagger },
                      microservice: { type: 'boolean', example: true },
                    },
                  },
                  responseTime: { type: 'string', example: '5ms' },
                },
              },
            },
          },
        },
        '503': {
          description: 'Service is unhealthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'error' },
                  timestamp: { type: 'string', format: 'date-time' },
                  service: { type: 'string', example: appConfig.appName },
                  version: { type: 'string', example: appConfig.appVersion },
                  environment: { type: 'string', example: appConfig.nodeEnv },
                  error: { type: 'string', example: 'Database connection failed' },
                },
              },
            },
          },
        },
      },
    },
  };
}

function setupGracefulShutdown(app: any, logger: Logger) {
  const gracefulShutdown = (signal: string) => {
    logger.log(`Received ${signal}, shutting down gracefully...`);
    
    app.close().then(() => {
      logger.log('Application closed successfully');
      process.exit(0);
    }).catch((error) => {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    });
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

function logApplicationStartup(appConfig: AppConfig, swaggerConfig: any, logger: Logger, configService: ConfigService) {
  const cleanPrefix = appConfig.apiPrefix.replace(/^\/+|\/+$/g, '');
  
  logger.log(`${appConfig.appName} v${appConfig.appVersion} is running on: http://localhost:${appConfig.port}`);
  logger.log(`Microservice Mode: ENABLED`);
  logger.log(`Environment: ${appConfig.nodeEnv}`);
  logger.log(`Available Endpoints:`);
  logger.log(`  - Root: http://localhost:${appConfig.port}/`);
  logger.log(`  - Health: http://localhost:${appConfig.port}/health`);
  logger.log(`  - API Health: http://localhost:${appConfig.port}/${cleanPrefix}/health`);
  logger.log(`  - Categories: http://localhost:${appConfig.port}/${cleanPrefix}/categories`);
  logger.log(`  - Subcategories: http://localhost:${appConfig.port}/${cleanPrefix}/subcategories`);
  logger.log(`  - Collections: http://localhost:${appConfig.port}/${cleanPrefix}/collections`);
  logger.log(`  - Gender: http://localhost:${appConfig.port}/${cleanPrefix}/gender`);
  
  if (appConfig.shouldEnableSwagger && swaggerConfig) {
    logger.log(`API Documentation: http://localhost:${appConfig.port}/${swaggerConfig.path}`);
  }
  
  if (appConfig.enableKafka) {
    const kafkaConfig = configService.get('kafka');
    if (kafkaConfig?.enabled && appConfig.logKafkaConnection) {
      logger.log(`Kafka Client ID: ${kafkaConfig.clientId}`);
      logger.log(`Kafka Brokers: ${kafkaConfig.brokers.join(', ')}`);
    }
  }

  // Configuration summary
  logger.log(`Configuration Summary:`);
  logger.log(`  - API Prefix: /${cleanPrefix}`);
  logger.log(`  - CORS: ${appConfig.enableCors ? 'Enabled' : 'Disabled'}`);
  logger.log(`  - Kafka: ${appConfig.enableKafka ? 'Enabled' : 'Disabled'}`);
  logger.log(`  - Swagger: ${appConfig.shouldEnableSwagger ? 'Enabled' : 'Disabled'}`);
  logger.log(`  - Max File Size: ${Math.round(appConfig.maxFileSize / 1024 / 1024)}MB`);
  logger.log(`  - Request Timeout: ${appConfig.requestTimeout}ms`);
  logger.log(`  - Microservice: Ready for inter-service communication`);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const logger = new Logger('UncaughtException');
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  const logger = new Logger('UnhandledRejection');
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();