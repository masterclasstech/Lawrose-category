/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CloudinaryService } from './modules/cloudinary/cloudinary.service';

// Import all your configuration files
import appConfig, { AppConfig } from './config/app.config';
import databaseConfig from './config/database.config';
import kafkaConfig, { KafkaConfig } from './config/kafka.config';
import { redisConfig } from './config/redis.config';
import swaggerConfig, { SwaggerConfig } from './config/swagger.config';
import { CategoriesModule } from './modules/categories/categories.module';
import { CacheService } from './modules/cache/cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available globally
      cache: true, // Cache configuration for better performance
      expandVariables: true, // Allow variable expansion in .env files
      envFilePath: ['.env.local', '.env'], // Load multiple env files
      load: [
        appConfig,
        databaseConfig,
        kafkaConfig,
        redisConfig,
        swaggerConfig,
      ],

      validate: async (config: Record<string, any>) => {
        // Validate only configurations that still have class definitions
        const validationErrors: string[] = [];

        // Helper function to handle validation errors
        const processValidationErrors = (errors: any[], prefix: string) => {
          if (errors.length > 0) {
            validationErrors.push(...errors.map(err => 
              `${prefix}: ${Object.values(err.constraints || {}).join(', ')}`
            ));
          }
        };

        // Validate App Config
        try {
          const appConfigObj = plainToClass(AppConfig, {
            nodeEnv: config.NODE_ENV,
            port: config.PORT,
            appName: config.APP_NAME,
            appVersion: config.APP_VERSION,
            apiPrefix: config.API_PREFIX,
            enableSwagger: config.ENABLE_SWAGGER,
            enableSwaggerInProduction: config.ENABLE_SWAGGER_IN_PRODUCTION,
            enableKafka: config.ENABLE_KAFKA,
            allowedOrigins: config.ALLOWED_ORIGINS,
            logDbConnection: config.LOG_DB_CONNECTION,
            logRedisConnection: config.LOG_REDIS_CONNECTION,
            logKafkaConnection: config.LOG_KAFKA_CONNECTION,
            timezone: config.TIMEZONE,
            requestTimeout: config.REQUEST_TIMEOUT,
            maxFileSize: config.MAX_FILE_SIZE,
            logLevel: config.LOG_LEVEL,
            enableCors: config.ENABLE_CORS,
            enableRateLimit: config.ENABLE_RATE_LIMIT,
            rateLimitMax: config.RATE_LIMIT_MAX,
            rateLimitWindow: config.RATE_LIMIT_WINDOW,
          });

          const appValidationErrors = await validate(appConfigObj);
          processValidationErrors(appValidationErrors, 'App Config');
        } catch (error) {
          validationErrors.push(`App Config: ${error.message}`);
        }

        // Skip Database Config validation since it's now a plain object
        // Database connection validation will be handled by the actual MongoDB client
        
        // Validate Kafka Config
        try {
          const kafkaConfigObj = plainToClass(KafkaConfig, {
            brokers: config.KAFKA_BROKERS,
            clientId: config.KAFKA_CLIENT_ID,
            groupId: config.KAFKA_GROUP_ID,
            ssl: config.KAFKA_SSL,
            enableSasl: config.KAFKA_ENABLE_SASL,
            saslMechanism: config.KAFKA_SASL_MECHANISM,
            saslUsername: config.KAFKA_SASL_USERNAME,
            saslPassword: config.KAFKA_SASL_PASSWORD,
            connectionTimeout: config.KAFKA_CONNECTION_TIMEOUT,
            requestTimeout: config.KAFKA_REQUEST_TIMEOUT,
            enforceRequestTimeout: config.KAFKA_ENFORCE_REQUEST_TIMEOUT,
            maxRetries: config.KAFKA_MAX_RETRIES,
            initialRetryTime: config.KAFKA_INITIAL_RETRY_TIME,
            retryMultiplier: config.KAFKA_RETRY_MULTIPLIER,
            maxRetryTime: config.KAFKA_MAX_RETRY_TIME,
            logLevel: config.KAFKA_LOG_LEVEL,
            enableLogging: config.KAFKA_ENABLE_LOGGING,
            sessionTimeout: config.KAFKA_SESSION_TIMEOUT,
            rebalanceTimeout: config.KAFKA_REBALANCE_TIMEOUT,
            heartbeatInterval: config.KAFKA_HEARTBEAT_INTERVAL,
            maxBytesPerPartition: config.KAFKA_MAX_BYTES_PER_PARTITION,
            minBytes: config.KAFKA_MIN_BYTES,
            maxBytes: config.KAFKA_MAX_BYTES,
            maxWaitTimeInMs: config.KAFKA_MAX_WAIT_TIME_MS,
            allowAutoTopicCreation: config.KAFKA_ALLOW_AUTO_TOPIC_CREATION,
            autoOffsetReset: config.KAFKA_AUTO_OFFSET_RESET,
            enableAutoCommit: config.KAFKA_ENABLE_AUTO_COMMIT,
            autoCommitInterval: config.KAFKA_AUTO_COMMIT_INTERVAL,
            enablePartitionMetadata: config.KAFKA_ENABLE_PARTITION_METADATA,
            metadataMaxAge: config.KAFKA_METADATA_MAX_AGE,
            enableIdempotence: config.KAFKA_ENABLE_IDEMPOTENCE,
            maxInFlightRequests: config.KAFKA_MAX_IN_FLIGHT_REQUESTS,
            batchSize: config.KAFKA_BATCH_SIZE,
            lingerMs: config.KAFKA_LINGER_MS,
            compression: config.KAFKA_COMPRESSION,
            acks: config.KAFKA_ACKS,
            enableMetrics: config.KAFKA_ENABLE_METRICS,
            healthCheckInterval: config.KAFKA_HEALTH_CHECK_INTERVAL,
            enableHealthCheck: config.KAFKA_ENABLE_HEALTH_CHECK,
            categoryCreatedTopic: config.KAFKA_CATEGORY_CREATED_TOPIC,
            categoryUpdatedTopic: config.KAFKA_CATEGORY_UPDATED_TOPIC,
            categoryDeletedTopic: config.KAFKA_CATEGORY_DELETED_TOPIC,
            subcategoryCreatedTopic: config.KAFKA_SUBCATEGORY_CREATED_TOPIC,
            subcategoryUpdatedTopic: config.KAFKA_SUBCATEGORY_UPDATED_TOPIC,
            subcategoryDeletedTopic: config.KAFKA_SUBCATEGORY_DELETED_TOPIC,
            collectionCreatedTopic: config.KAFKA_COLLECTION_CREATED_TOPIC,
            collectionUpdatedTopic: config.KAFKA_COLLECTION_UPDATED_TOPIC,
            collectionDeletedTopic: config.KAFKA_COLLECTION_DELETED_TOPIC,
            genderCreatedTopic: config.KAFKA_GENDER_CREATED_TOPIC,
            genderUpdatedTopic: config.KAFKA_GENDER_UPDATED_TOPIC,
            genderDeletedTopic: config.KAFKA_GENDER_DELETED_TOPIC,
          });

          const kafkaValidationErrors = await validate(kafkaConfigObj);
          processValidationErrors(kafkaValidationErrors, 'Kafka Config');
        } catch (error) {
          validationErrors.push(`Kafka Config: ${error.message}`);
        }

        // Skip Redis Config validation since it's now a plain object
        // Redis connection validation will be handled by the actual Redis client

        // Validate Swagger Config
        try {
          const swaggerConfigObj = plainToClass(SwaggerConfig, {
            title: config.SWAGGER_TITLE,
            description: config.SWAGGER_DESCRIPTION,
            version: config.SWAGGER_VERSION,
            termsOfService: config.SWAGGER_TERMS_OF_SERVICE,
            contactName: config.SWAGGER_CONTACT_NAME,
            contactEmail: config.SWAGGER_CONTACT_EMAIL,
            contactUrl: config.SWAGGER_CONTACT_URL,
            licenseName: config.SWAGGER_LICENSE_NAME,
            licenseUrl: config.SWAGGER_LICENSE_URL,
            path: config.SWAGGER_PATH,
            tags: config.SWAGGER_TAGS,
            externalDocsDescription: config.SWAGGER_EXTERNAL_DOCS_DESCRIPTION,
            externalDocsUrl: config.SWAGGER_EXTERNAL_DOCS_URL,
            servers: config.SWAGGER_SERVERS,
            enableApiKey: config.SWAGGER_ENABLE_API_KEY,
            apiKeyName: config.SWAGGER_API_KEY_NAME,
            apiKeyLocation: config.SWAGGER_API_KEY_LOCATION,
            enableBearerAuth: config.SWAGGER_ENABLE_BEARER_AUTH,
            bearerFormat: config.SWAGGER_BEARER_FORMAT,
            bearerScheme: config.SWAGGER_BEARER_SCHEME,
            enableOAuth2: config.SWAGGER_ENABLE_OAUTH2,
            oauth2AuthorizationUrl: config.SWAGGER_OAUTH2_AUTHORIZATION_URL,
            oauth2TokenUrl: config.SWAGGER_OAUTH2_TOKEN_URL,
            oauth2Scopes: config.SWAGGER_OAUTH2_SCOPES,
            enableCookieAuth: config.SWAGGER_ENABLE_COOKIE_AUTH,
            cookieName: config.SWAGGER_COOKIE_NAME,
            enableBasicAuth: config.SWAGGER_ENABLE_BASIC_AUTH,
            enableExplorer: config.SWAGGER_ENABLE_EXPLORER,
            enableJsonEditor: config.SWAGGER_ENABLE_JSON_EDITOR,
            enableFilter: config.SWAGGER_ENABLE_FILTER,
            enableDeepLinking: config.SWAGGER_ENABLE_DEEP_LINKING,
            enableDisplayOperationId: config.SWAGGER_ENABLE_DISPLAY_OPERATION_ID,
            enableDefaultModelsExpandDepth: config.SWAGGER_ENABLE_DEFAULT_MODELS_EXPAND_DEPTH,
            defaultModelsExpandDepth: config.SWAGGER_DEFAULT_MODELS_EXPAND_DEPTH,
            defaultModelExpandDepth: config.SWAGGER_DEFAULT_MODEL_EXPAND_DEPTH,
            defaultModelRendering: config.SWAGGER_DEFAULT_MODEL_RENDERING,
            enableDisplayRequestDuration: config.SWAGGER_ENABLE_DISPLAY_REQUEST_DURATION,
            enableDocExpansion: config.SWAGGER_ENABLE_DOC_EXPANSION,
            docExpansion: config.SWAGGER_DOC_EXPANSION,
            enableOperationsSorter: config.SWAGGER_ENABLE_OPERATIONS_SORTER,
            operationsSorter: config.SWAGGER_OPERATIONS_SORTER,
            enableTagsSorter: config.SWAGGER_ENABLE_TAGS_SORTER,
            tagsSorter: config.SWAGGER_TAGS_SORTER,
            enableTryItOutEnabled: config.SWAGGER_ENABLE_TRY_IT_OUT_ENABLED,
            enableRequestSnippetsEnabled: config.SWAGGER_ENABLE_REQUEST_SNIPPETS_ENABLED,
            enablePersistAuthorization: config.SWAGGER_ENABLE_PERSIST_AUTHORIZATION,
            customCss: config.SWAGGER_CUSTOM_CSS,
            customJs: config.SWAGGER_CUSTOM_JS,
            customFavIcon: config.SWAGGER_CUSTOM_FAV_ICON,
            customSiteTitle: config.SWAGGER_CUSTOM_SITE_TITLE,
            customfavIcon: config.SWAGGER_CUSTOM_FAVICON,
            swaggerUrl: config.SWAGGER_URL,
            customCssUrl: config.SWAGGER_CUSTOM_CSS_URL,
            customJsUrl: config.SWAGGER_CUSTOM_JS_URL,
            enableValidatorUrl: config.SWAGGER_ENABLE_VALIDATOR_URL,
            validatorUrl: config.SWAGGER_VALIDATOR_URL,
            enableSupportedSubmitMethods: config.SWAGGER_ENABLE_SUPPORTED_SUBMIT_METHODS,
            supportedSubmitMethods: config.SWAGGER_SUPPORTED_SUBMIT_METHODS,
            enableResponseInterceptor: config.SWAGGER_ENABLE_RESPONSE_INTERCEPTOR,
            enableRequestInterceptor: config.SWAGGER_ENABLE_REQUEST_INTERCEPTOR,
            enableOnComplete: config.SWAGGER_ENABLE_ON_COMPLETE,
            enableShowMutatedRequest: config.SWAGGER_ENABLE_SHOW_MUTATED_REQUEST,
            enableShowExtensions: config.SWAGGER_ENABLE_SHOW_EXTENSIONS,
            enableShowCommonExtensions: config.SWAGGER_ENABLE_SHOW_COMMON_EXTENSIONS,
            enableMaxDisplayedTags: config.SWAGGER_ENABLE_MAX_DISPLAYED_TAGS,
            maxDisplayedTags: config.SWAGGER_MAX_DISPLAYED_TAGS,
            enableUseUnsafeMarkdown: config.SWAGGER_ENABLE_USE_UNSAFE_MARKDOWN,
            enableSyntaxHighlight: config.SWAGGER_ENABLE_SYNTAX_HIGHLIGHT,
            syntaxHighlightTheme: config.SWAGGER_SYNTAX_HIGHLIGHT_THEME,
            enableQueryConfigEnabled: config.SWAGGER_ENABLE_QUERY_CONFIG_ENABLED,
            enablePresetEnv: config.SWAGGER_ENABLE_PRESET_ENV,
            presetEnv: config.SWAGGER_PRESET_ENV,
          });

          const swaggerValidationErrors = await validate(swaggerConfigObj);
          processValidationErrors(swaggerValidationErrors, 'Swagger Config');
        } catch (error) {
          validationErrors.push(`Swagger Config: ${error.message}`);
        }

        // Basic validation for Database and Redis configs (just check if URLs are provided)
        const basicValidationErrors: string[] = [];
        
        // Check if required database URL is provided
        if (!config.MONGO_URL) {
          basicValidationErrors.push('Database Config: MONGO_URL is required');
        }
        
        // Check if required Redis URL is provided
        if (!config.REDIS_URL) {
          basicValidationErrors.push('Redis Config: REDIS_URL is required');
        }
        
        // Add basic validation errors to the main validation errors
        validationErrors.push(...basicValidationErrors);

        // Throw error if any validation failed
        if (validationErrors.length > 0) {
          throw new Error(`Configuration validation failed:\n${validationErrors.join('\n')}`);
        }

        return config;
      },
    }),

    // MongoDB connection setup - FIXED
    // In your app.module.ts - Update the MongooseModule.forRootAsync section:

    // Minimal MongooseModule configuration for Atlas
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const databaseConfig = configService.get('database');
    
        return {
          uri: databaseConfig.mongoUrl,
          dbName: databaseConfig.mongoDbName,
          maxPoolSize: databaseConfig.maxPoolSize,
          serverSelectionTimeoutMS: databaseConfig.serverSelectionTimeoutMS,
          socketTimeoutMS: databaseConfig.socketTimeoutMS,
          connectTimeoutMS: databaseConfig.connectTimeoutMS,
          retryWrites: databaseConfig.retryWrites,
          appName: databaseConfig.appName,
          autoIndex: databaseConfig.autoIndex,
          autoCreate: databaseConfig.autoCreate,
        };
      },
    }),
    
    // Add your other modules here
    CategoriesModule,
    // SubcategoryModule,
    // ... other modules
  ],
  controllers: [
    
  ],
  providers: [
   CloudinaryService,
   CacheService,
  ],
})
export class AppModule {}