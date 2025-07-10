/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
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

    // Body parsing middleware
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));

    // Global prefix
    app.setGlobalPrefix(appConfig.apiPrefix);

    // API versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // CORS configuration
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

    // Kafka microservice setup
    const kafkaConfig = configService.get('kafka');
    if (kafkaConfig?.enabled) {
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
      
      logger.log(`Kafka microservice configured with brokers: ${kafkaConfig.brokers.join(', ')}`);
    }

    // Swagger/OpenAPI configuration
    if (swaggerConfig && (appConfig.nodeEnv === 'development' || appConfig.enableSwaggerInProduction)) {
      const documentBuilder = new DocumentBuilder()
        .setTitle(swaggerConfig.title)
        .setDescription(swaggerConfig.description)
        .setVersion(swaggerConfig.version)
        .setTermsOfService(swaggerConfig.termsOfService)
        .setContact(
          swaggerConfig.contactName,
          swaggerConfig.contactUrl,
          swaggerConfig.contactEmail,
        )
        .setLicense(swaggerConfig.licenseName, swaggerConfig.licenseUrl)
        .setExternalDoc(swaggerConfig.externalDocsDescription, swaggerConfig.externalDocsUrl);

      // Add servers
      swaggerConfig.servers.forEach(server => {
        documentBuilder.addServer(server);
      });

      // Add tags
      swaggerConfig.tags.forEach(tag => {
        documentBuilder.addTag(tag);
      });

      // Add security schemes
      if (swaggerConfig.enableApiKey) {
        documentBuilder.addApiKey(
          {
            type: 'apiKey',
            name: swaggerConfig.apiKeyName,
            in: swaggerConfig.apiKeyLocation as 'header' | 'query' | 'cookie',
            description: 'API Key for authentication',
          },
          'api-key',
        );
      }

      if (swaggerConfig.enableBearerAuth) {
        documentBuilder.addBearerAuth(
          {
            type: 'http',
            scheme: swaggerConfig.bearerScheme,
            bearerFormat: swaggerConfig.bearerFormat,
            description: 'JWT Bearer token for authentication',
          },
          'bearer-token',
        );
      }

      if (swaggerConfig.enableOAuth2) {
        documentBuilder.addOAuth2(
          {
            type: 'oauth2',
            flows: {
              authorizationCode: {
                authorizationUrl: swaggerConfig.oauth2AuthorizationUrl,
                tokenUrl: swaggerConfig.oauth2TokenUrl,
                scopes: swaggerConfig.oauth2Scopes.reduce((acc, scope) => {
                  acc[scope] = `${scope} access`;
                  return acc;
                }, {} as Record<string, string>),
              },
            },
            description: 'OAuth2 authentication',
          },
          'oauth2',
        );
      }

      if (swaggerConfig.enableCookieAuth) {
        documentBuilder.addCookieAuth(swaggerConfig.cookieName, {
          type: 'apiKey',
          in: 'cookie',
          name: swaggerConfig.cookieName,
          description: 'Cookie-based authentication',
        });
      }

      if (swaggerConfig.enableBasicAuth) {
        documentBuilder.addBasicAuth(
          {
            type: 'http',
            scheme: 'basic',
            description: 'Basic HTTP authentication',
          },
          'basic-auth',
        );
      }

      const document = SwaggerModule.createDocument(app, documentBuilder.build());

      // Swagger UI options
      const swaggerOptions = {
        explorer: swaggerConfig.enableExplorer,
        swaggerOptions: {
          docExpansion: swaggerConfig.docExpansion,
          filter: swaggerConfig.enableFilter,
          showRequestDuration: swaggerConfig.enableDisplayRequestDuration,
          showExtensions: swaggerConfig.enableShowExtensions,
          showCommonExtensions: swaggerConfig.enableShowCommonExtensions,
          deepLinking: swaggerConfig.enableDeepLinking,
          displayOperationId: swaggerConfig.enableDisplayOperationId,
          defaultModelsExpandDepth: swaggerConfig.defaultModelsExpandDepth,
          defaultModelExpandDepth: swaggerConfig.defaultModelExpandDepth,
          defaultModelRendering: swaggerConfig.defaultModelRendering,
          displayRequestDuration: swaggerConfig.enableDisplayRequestDuration,
          operationsSorter: swaggerConfig.operationsSorter,
          tagsSorter: swaggerConfig.tagsSorter,
          tryItOutEnabled: swaggerConfig.enableTryItOutEnabled,
          requestSnippetsEnabled: swaggerConfig.enableRequestSnippetsEnabled,
          persistAuthorization: swaggerConfig.enablePersistAuthorization,
          maxDisplayedTags: swaggerConfig.enableMaxDisplayedTags ? swaggerConfig.maxDisplayedTags : undefined,
          useUnsafeMarkdown: swaggerConfig.enableUseUnsafeMarkdown,
          syntaxHighlight: swaggerConfig.enableSyntaxHighlight ? {
            theme: swaggerConfig.syntaxHighlightTheme,
          } : false,
          supportedSubmitMethods: swaggerConfig.enableSupportedSubmitMethods 
            ? swaggerConfig.supportedSubmitMethods 
            : undefined,
          validatorUrl: swaggerConfig.enableValidatorUrl ? swaggerConfig.validatorUrl : null,
          queryConfigEnabled: swaggerConfig.enableQueryConfigEnabled,
          onComplete: swaggerConfig.enableOnComplete ? () => {
            logger.log('Swagger UI loaded successfully');
          } : undefined,
          presets: swaggerConfig.enablePresetEnv ? [swaggerConfig.presetEnv] : undefined,
        },
        customCss: swaggerConfig.customCss,
        customJs: swaggerConfig.customJs,
        customfavIcon: swaggerConfig.customfavIcon,
        customSiteTitle: swaggerConfig.customSiteTitle,
        swaggerUrl: swaggerConfig.swaggerUrl,
        customCssUrl: swaggerConfig.customCssUrl,
        customJsUrl: swaggerConfig.customJsUrl,
        jsonEditor: swaggerConfig.enableJsonEditor,
      };

      SwaggerModule.setup(swaggerConfig.path, app, document, swaggerOptions);
      
      logger.log(`Swagger documentation available at: http://localhost:${appConfig.port}/${swaggerConfig.path}`);
    }

    // Graceful shutdown handlers
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

    // Start microservices if enabled
    if (kafkaConfig?.enabled) {
      await app.startAllMicroservices();
      logger.log('Kafka microservices started successfully');
    }

    // Start HTTP server
    await app.listen(appConfig.port);
    
    logger.log(`Category Service is running on: http://localhost:${appConfig.port}${appConfig.apiPrefix}`);
    logger.log(`Environment: ${appConfig.nodeEnv}`);
    logger.log(`API Documentation: http://localhost:${appConfig.port}/${swaggerConfig?.path || 'api/docs'}`);
    logger.log(`Health Check: http://localhost:${appConfig.port}${appConfig.apiPrefix}/health`);
    
    if (kafkaConfig?.enabled) {
      logger.log(`📡 Kafka Client ID: ${kafkaConfig.clientId}`);
      logger.log(`🔌 Kafka Brokers: ${kafkaConfig.brokers.join(', ')}`);
    }

  } catch (error) {
    logger.error('Failed to start the application:', error);
    process.exit(1);
  }
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