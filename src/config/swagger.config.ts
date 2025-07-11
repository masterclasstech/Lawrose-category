/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class SwaggerConfig {
  @IsString()
  @IsOptional()
  title: string = 'Category Service API';

  @IsString()
  @IsOptional()
  description: string = 'API documentation for Category Service - A microservice for managing categories, subcategories, collections, and gender classifications';

  @IsString()
  @IsOptional()
  version: string = '1.0.0';

  @IsString()
  @IsOptional()
  path: string = 'api/docs';

  @IsArray()
  @Transform(({ value }) => {
    if (!value) return ['http://localhost:5000'];
    return Array.isArray(value) ? value : value.split(',').map((server: string) => server.trim());
  })
  @IsOptional()
  servers: string[] = ['http://localhost:5000'];

  // All other properties with defaults - no validation needed
  contactName: string = 'LawRose Development Team';
  contactEmail: string = 'dev@lawrose.com';
  contactUrl: string = 'https://lawrose.com/contact';
  licenseName: string = 'MIT';
  licenseUrl: string = 'https://opensource.org/licenses/MIT';
  enableBearerAuth: boolean = true;
  bearerFormat: string = 'JWT';
  enableApiKey: boolean = false;
  apiKeyName: string = 'X-API-Key';
  enableExplorer: boolean = true;
  enableFilter: boolean = true;
  enableTryItOut: boolean = true;
  docExpansion: string = 'list';
  operationsSorter: string = 'alpha';
  tagsSorter: string = 'alpha';
  customSiteTitle: string = 'Category Service API Documentation';
  customFavIcon: string = '/favicon.ico';
  customCss: string = '';
  tags: string[] = ['Categories', 'Subcategories', 'Collections', 'Gender', 'Health'];
  externalDocsDescription: string = 'Find more info here';
  externalDocsUrl: string = 'https://docs.lawrose.com';
  syntaxHighlightTheme: string = 'agate';
  defaultModelsExpandDepth: number = 1;
  defaultModelRendering: string = 'example';
}

export default registerAs('swagger', (): SwaggerConfig => {
  const config = new SwaggerConfig();
  
  // Override defaults only if provided
  if (process.env.SWAGGER_TITLE) {
    config.title = process.env.SWAGGER_TITLE;
  }
  if (process.env.SWAGGER_DESCRIPTION) {
    config.description = process.env.SWAGGER_DESCRIPTION;
  }
  if (process.env.SWAGGER_VERSION || process.env.APP_VERSION) {
    config.version = process.env.SWAGGER_VERSION || process.env.APP_VERSION || '1.0.0';
  }
  if (process.env.SWAGGER_PATH) {
    config.path = process.env.SWAGGER_PATH;
  }
  if (process.env.SWAGGER_SERVERS) {
    config.servers = process.env.SWAGGER_SERVERS.split(',').map(server => server.trim());
  }
  if (process.env.SWAGGER_CONTACT_NAME) {
    config.contactName = process.env.SWAGGER_CONTACT_NAME;
  }
  if (process.env.SWAGGER_CONTACT_EMAIL) {
    config.contactEmail = process.env.SWAGGER_CONTACT_EMAIL;
  }
  if (process.env.SWAGGER_ENABLE_BEARER_AUTH === 'false') {
    config.enableBearerAuth = false;
  }
  if (process.env.SWAGGER_TAGS) {
    config.tags = process.env.SWAGGER_TAGS.split(',').map(tag => tag.trim());
  }

  return config;
});