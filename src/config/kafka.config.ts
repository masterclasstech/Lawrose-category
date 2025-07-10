/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class KafkaConfig {
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : value.split(',').map((broker: string) => broker.trim()))
  brokers: string[];

  @IsString()
  clientId: string;

  @IsString()
  groupId: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  ssl: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableSasl: boolean = false;

  @IsString()
  @IsOptional()
  saslMechanism: string = 'plain';

  @IsString()
  @IsOptional()
  saslUsername: string;

  @IsString()
  @IsOptional()
  saslPassword: string;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  connectionTimeout: number = 3000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  requestTimeout: number = 30000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  enforceRequestTimeout: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxRetries: number = 3;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  initialRetryTime: number = 300;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  retryMultiplier: number = 2;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxRetryTime: number = 30000;

  @IsString()
  @IsOptional()
  logLevel: string = 'info';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableLogging: boolean = false;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  sessionTimeout: number = 30000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  rebalanceTimeout: number = 60000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  heartbeatInterval: number = 3000;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxBytesPerPartition: number = 1048576; // 1MB

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  minBytes: number = 1;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxBytes: number = 10485760; // 10MB

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxWaitTimeInMs: number = 5000;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  allowAutoTopicCreation: boolean = true;

  @IsString()
  @IsOptional()
  autoOffsetReset: string = 'earliest';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableAutoCommit: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  autoCommitInterval: number = 5000;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enablePartitionMetadata: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  metadataMaxAge: number = 300000; // 5 minutes

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableIdempotence: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxInFlightRequests: number = 5;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  batchSize: number = 16384; // 16KB

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  lingerMs: number = 0;

  @IsString()
  @IsOptional()
  compression: string = 'gzip';

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  acks: number = -1; // all

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableMetrics: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  healthCheckInterval: number = 30000; // 30 seconds

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableHealthCheck: boolean = true;

  // Topic configurations
  @IsString()
  @IsOptional()
  categoryCreatedTopic: string = 'category.created';

  @IsString()
  @IsOptional()
  categoryUpdatedTopic: string = 'category.updated';

  @IsString()
  @IsOptional()
  categoryDeletedTopic: string = 'category.deleted';

  @IsString()
  @IsOptional()
  subcategoryCreatedTopic: string = 'subcategory.created';

  @IsString()
  @IsOptional()
  subcategoryUpdatedTopic: string = 'subcategory.updated';

  @IsString()
  @IsOptional()
  subcategoryDeletedTopic: string = 'subcategory.deleted';

  @IsString()
  @IsOptional()
  collectionCreatedTopic: string = 'collection.created';

  @IsString()
  @IsOptional()
  collectionUpdatedTopic: string = 'collection.updated';

  @IsString()
  @IsOptional()
  collectionDeletedTopic: string = 'collection.deleted';

  @IsString()
  @IsOptional()
  genderCreatedTopic: string = 'gender.created';

  @IsString()
  @IsOptional()
  genderUpdatedTopic: string = 'gender.updated';

  @IsString()
  @IsOptional()
  genderDeletedTopic: string = 'gender.deleted';
}

export default registerAs('kafka', (): KafkaConfig => {
  const config = new KafkaConfig();
  
  if (!process.env.KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS is required');
  }

  config.brokers = process.env.KAFKA_BROKERS.split(',').map(broker => broker.trim());
  config.clientId = process.env.KAFKA_CLIENT_ID || 'LawCategory';
  config.groupId = process.env.KAFKA_GROUP_ID || 'LawCategory-group';
  config.ssl = process.env.KAFKA_SSL === 'true';
  config.enableSasl = process.env.KAFKA_ENABLE_SASL === 'true';
  config.saslMechanism = process.env.KAFKA_SASL_MECHANISM || 'plain';
  config.saslUsername = process.env.KAFKA_SASL_USERNAME;
  config.saslPassword = process.env.KAFKA_SASL_PASSWORD;
  config.connectionTimeout = parseInt(process.env.KAFKA_CONNECTION_TIMEOUT, 10) || 3000;
  config.requestTimeout = parseInt(process.env.KAFKA_REQUEST_TIMEOUT, 10) || 30000;
  config.enforceRequestTimeout = process.env.KAFKA_ENFORCE_REQUEST_TIMEOUT !== 'false';
  config.maxRetries = parseInt(process.env.KAFKA_MAX_RETRIES, 10) || 3;
  config.initialRetryTime = parseInt(process.env.KAFKA_INITIAL_RETRY_TIME, 10) || 300;
  config.retryMultiplier = parseInt(process.env.KAFKA_RETRY_MULTIPLIER, 10) || 2;
  config.maxRetryTime = parseInt(process.env.KAFKA_MAX_RETRY_TIME, 10) || 30000;
  config.logLevel = process.env.KAFKA_LOG_LEVEL || 'info';
  config.enableLogging = process.env.KAFKA_ENABLE_LOGGING === 'true';
  config.sessionTimeout = parseInt(process.env.KAFKA_SESSION_TIMEOUT, 10) || 30000;
  config.rebalanceTimeout = parseInt(process.env.KAFKA_REBALANCE_TIMEOUT, 10) || 60000;
  config.heartbeatInterval = parseInt(process.env.KAFKA_HEARTBEAT_INTERVAL, 10) || 3000;
  config.maxBytesPerPartition = parseInt(process.env.KAFKA_MAX_BYTES_PER_PARTITION, 10) || 1048576;
  config.minBytes = parseInt(process.env.KAFKA_MIN_BYTES, 10) || 1;
  config.maxBytes = parseInt(process.env.KAFKA_MAX_BYTES, 10) || 10485760;
  config.maxWaitTimeInMs = parseInt(process.env.KAFKA_MAX_WAIT_TIME_MS, 10) || 5000;
  config.allowAutoTopicCreation = process.env.KAFKA_ALLOW_AUTO_TOPIC_CREATION !== 'false';
  config.autoOffsetReset = process.env.KAFKA_AUTO_OFFSET_RESET || 'earliest';
  config.enableAutoCommit = process.env.KAFKA_ENABLE_AUTO_COMMIT !== 'false';
  config.autoCommitInterval = parseInt(process.env.KAFKA_AUTO_COMMIT_INTERVAL, 10) || 5000;
  config.enablePartitionMetadata = process.env.KAFKA_ENABLE_PARTITION_METADATA !== 'false';
  config.metadataMaxAge = parseInt(process.env.KAFKA_METADATA_MAX_AGE, 10) || 300000;
  config.enableIdempotence = process.env.KAFKA_ENABLE_IDEMPOTENCE !== 'false';
  config.maxInFlightRequests = parseInt(process.env.KAFKA_MAX_IN_FLIGHT_REQUESTS, 10) || 5;
  config.batchSize = parseInt(process.env.KAFKA_BATCH_SIZE, 10) || 16384;
  config.lingerMs = parseInt(process.env.KAFKA_LINGER_MS, 10) || 0;
  config.compression = process.env.KAFKA_COMPRESSION || 'gzip';
  config.acks = parseInt(process.env.KAFKA_ACKS, 10) || -1;
  config.enableMetrics = process.env.KAFKA_ENABLE_METRICS !== 'false';
  config.healthCheckInterval = parseInt(process.env.KAFKA_HEALTH_CHECK_INTERVAL, 10) || 30000;
  config.enableHealthCheck = process.env.KAFKA_ENABLE_HEALTH_CHECK !== 'false';
  
  // Topic configurations
  config.categoryCreatedTopic = process.env.KAFKA_CATEGORY_CREATED_TOPIC || 'category.created';
  config.categoryUpdatedTopic = process.env.KAFKA_CATEGORY_UPDATED_TOPIC || 'category.updated';
  config.categoryDeletedTopic = process.env.KAFKA_CATEGORY_DELETED_TOPIC || 'category.deleted';
  config.subcategoryCreatedTopic = process.env.KAFKA_SUBCATEGORY_CREATED_TOPIC || 'subcategory.created';
  config.subcategoryUpdatedTopic = process.env.KAFKA_SUBCATEGORY_UPDATED_TOPIC || 'subcategory.updated';
  config.subcategoryDeletedTopic = process.env.KAFKA_SUBCATEGORY_DELETED_TOPIC || 'subcategory.deleted';
  config.collectionCreatedTopic = process.env.KAFKA_COLLECTION_CREATED_TOPIC || 'collection.created';
  config.collectionUpdatedTopic = process.env.KAFKA_COLLECTION_UPDATED_TOPIC || 'collection.updated';
  config.collectionDeletedTopic = process.env.KAFKA_COLLECTION_DELETED_TOPIC || 'collection.deleted';
  config.genderCreatedTopic = process.env.KAFKA_GENDER_CREATED_TOPIC || 'gender.created';
  config.genderUpdatedTopic = process.env.KAFKA_GENDER_UPDATED_TOPIC || 'gender.updated';
  config.genderDeletedTopic = process.env.KAFKA_GENDER_DELETED_TOPIC || 'gender.deleted';

  return config;
});