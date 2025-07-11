/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class KafkaConfig {
  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : value.split(',').map((broker: string) => broker.trim()))
  brokers: string[];

  @IsString()
  clientId: string;

  @IsString()
  groupId: string;

  // All other settings with defaults - no validation needed
  ssl: boolean = false;
  enableSasl: boolean = false;
  saslMechanism: string = 'plain';
  saslUsername?: string;
  saslPassword?: string;
  connectionTimeout: number = 3000;
  requestTimeout: number = 30000;
  enforceRequestTimeout: boolean = true;
  maxRetries: number = 3;
  initialRetryTime: number = 300;
  retryMultiplier: number = 2;
  maxRetryTime: number = 30000;
  logLevel: string = 'info';
  enableLogging: boolean = false;
  sessionTimeout: number = 30000;
  rebalanceTimeout: number = 60000;
  heartbeatInterval: number = 3000;
  maxBytesPerPartition: number = 1048576;
  minBytes: number = 1;
  maxBytes: number = 10485760;
  maxWaitTimeInMs: number = 5000;
  allowAutoTopicCreation: boolean = true;
  autoOffsetReset: string = 'earliest';
  enableAutoCommit: boolean = true;
  autoCommitInterval: number = 5000;
  enablePartitionMetadata: boolean = true;
  metadataMaxAge: number = 300000;
  enableIdempotence: boolean = true;
  maxInFlightRequests: number = 5;
  batchSize: number = 16384;
  lingerMs: number = 0;
  compression: string = 'gzip';
  acks: number = -1;
  enableMetrics: boolean = true;
  healthCheckInterval: number = 30000;
  enableHealthCheck: boolean = true;

  // Topic configurations with defaults
  categoryCreatedTopic: string = 'category.created';
  categoryUpdatedTopic: string = 'category.updated';
  categoryDeletedTopic: string = 'category.deleted';
  subcategoryCreatedTopic: string = 'subcategory.created';
  subcategoryUpdatedTopic: string = 'subcategory.updated';
  subcategoryDeletedTopic: string = 'subcategory.deleted';
  collectionCreatedTopic: string = 'collection.created';
  collectionUpdatedTopic: string = 'collection.updated';
  collectionDeletedTopic: string = 'collection.deleted';
  genderCreatedTopic: string = 'gender.created';
  genderUpdatedTopic: string = 'gender.updated';
  genderDeletedTopic: string = 'gender.deleted';
}

export default registerAs('kafka', (): KafkaConfig => {
  const config = new KafkaConfig();
  
  // Required fields
  if (!process.env.KAFKA_BROKERS) {
    throw new Error('KAFKA_BROKERS is required');
  }
  config.brokers = process.env.KAFKA_BROKERS.split(',').map(broker => broker.trim());
  config.clientId = process.env.KAFKA_CLIENT_ID || 'LawCategory';
  config.groupId = process.env.KAFKA_GROUP_ID || 'LawCategory-group';
  
  // Override defaults only if provided
  if (process.env.KAFKA_SSL === 'true') {
    config.ssl = true;
  }
  if (process.env.KAFKA_ENABLE_SASL === 'true') {
    config.enableSasl = true;
    config.saslUsername = process.env.KAFKA_SASL_USERNAME;
    config.saslPassword = process.env.KAFKA_SASL_PASSWORD;
    config.saslMechanism = process.env.KAFKA_SASL_MECHANISM || 'plain';
  }
  if (process.env.KAFKA_ENABLE_LOGGING === 'true') {
    config.enableLogging = true;
  }
  if (process.env.KAFKA_LOG_LEVEL) {
    config.logLevel = process.env.KAFKA_LOG_LEVEL;
  }

  // Topic overrides
  if (process.env.KAFKA_CATEGORY_CREATED_TOPIC) {
    config.categoryCreatedTopic = process.env.KAFKA_CATEGORY_CREATED_TOPIC;
  }
  // Add other topic overrides as needed...

  return config;
});