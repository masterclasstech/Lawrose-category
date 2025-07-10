/* eslint-disable prettier/prettier */
import { registerAs } from '@nestjs/config';
import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  termsOfService: string = 'https://lawrose.com/terms';

  @IsString()
  @IsOptional()
  contactName: string = 'LawRose Development Team';

  @IsString()
  @IsOptional()
  contactEmail: string = 'dev@lawrose.com';

  @IsString()
  @IsOptional()
  contactUrl: string = 'https://lawrose.com/contact';

  @IsString()
  @IsOptional()
  licenseName: string = 'MIT';

  @IsString()
  @IsOptional()
  licenseUrl: string = 'https://opensource.org/licenses/MIT';

  @IsString()
  @IsOptional()
  path: string = 'api/docs';

  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : value.split(',').map((tag: string) => tag.trim()))
  @IsOptional()
  tags: string[] = ['Categories', 'Subcategories', 'Collections', 'Gender', 'Health'];

  @IsString()
  @IsOptional()
  externalDocsDescription: string = 'Find more info here';

  @IsString()
  @IsOptional()
  externalDocsUrl: string = 'https://docs.lawrose.com';

  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : value.split(',').map((server: string) => server.trim()))
  @IsOptional()
  servers: string[] = [
    'http://localhost:5000',
    'http://localhost:8000',
    'https://api.lawrose.com'
  ];

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableApiKey: boolean = false;

  @IsString()
  @IsOptional()
  apiKeyName: string = 'X-API-Key';

  @IsString()
  @IsOptional()
  apiKeyLocation: string = 'header';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableBearerAuth: boolean = true;

  @IsString()
  @IsOptional()
  bearerFormat: string = 'JWT';

  @IsString()
  @IsOptional()
  bearerScheme: string = 'bearer';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableOAuth2: boolean = false;

  @IsString()
  @IsOptional()
  oauth2AuthorizationUrl: string = 'https://auth.lawrose.com/oauth2/authorize';

  @IsString()
  @IsOptional()
  oauth2TokenUrl: string = 'https://auth.lawrose.com/oauth2/token';

  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : value.split(',').map((scope: string) => scope.trim()))
  @IsOptional()
  oauth2Scopes: string[] = ['read', 'write', 'admin'];

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableCookieAuth: boolean = false;

  @IsString()
  @IsOptional()
  cookieName: string = 'sessionId';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableBasicAuth: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableExplorer: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableJsonEditor: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableFilter: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableDeepLinking: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableDisplayOperationId: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableDefaultModelsExpandDepth: boolean = true;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  defaultModelsExpandDepth: number = 1;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  defaultModelExpandDepth: number = 1;

  @IsString()
  @IsOptional()
  defaultModelRendering: string = 'example';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableDisplayRequestDuration: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableDocExpansion: boolean = true;

  @IsString()
  @IsOptional()
  docExpansion: string = 'list';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableOperationsSorter: boolean = true;

  @IsString()
  @IsOptional()
  operationsSorter: string = 'alpha';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableTagsSorter: boolean = true;

  @IsString()
  @IsOptional()
  tagsSorter: string = 'alpha';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableTryItOutEnabled: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableRequestSnippetsEnabled: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enablePersistAuthorization: boolean = true;

  @IsString()
  @IsOptional()
  customCss: string = '';

  @IsString()
  @IsOptional()
  customJs: string = '';

  @IsString()
  @IsOptional()
  customFavIcon: string = '';

  @IsString()
  @IsOptional()
  customSiteTitle: string = 'Category Service API Documentation';

  @IsString()
  @IsOptional()
  customfavIcon: string = '/favicon.ico';

  @IsString()
  @IsOptional()
  swaggerUrl: string = '';

  @IsString()
  @IsOptional()
  customCssUrl: string = '';

  @IsString()
  @IsOptional()
  customJsUrl: string = '';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableValidatorUrl: boolean = false;

  @IsString()
  @IsOptional()
  validatorUrl: string = '';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableSupportedSubmitMethods: boolean = true;

  @IsArray()
  @Transform(({ value }) => Array.isArray(value) ? value : value.split(',').map((method: string) => method.trim()))
  @IsOptional()
  supportedSubmitMethods: string[] = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableResponseInterceptor: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableRequestInterceptor: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableOnComplete: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableShowMutatedRequest: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableShowExtensions: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableShowCommonExtensions: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableMaxDisplayedTags: boolean = false;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  maxDisplayedTags: number = -1;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableUseUnsafeMarkdown: boolean = false;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableSyntaxHighlight: boolean = true;

  @IsString()
  @IsOptional()
  syntaxHighlightTheme: string = 'agate';

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enableQueryConfigEnabled: boolean = true;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  enablePresetEnv: boolean = true;

  @IsString()
  @IsOptional()
  presetEnv: string = 'browser';
}

export default registerAs('swagger', (): SwaggerConfig => {
  const config = new SwaggerConfig();
  
  config.title = process.env.SWAGGER_TITLE || 'Category Service API';
  config.description = process.env.SWAGGER_DESCRIPTION || 'API documentation for Category Service - A microservice for managing categories, subcategories, collections, and gender classifications';
  config.version = process.env.SWAGGER_VERSION || process.env.APP_VERSION || '1.0.0';
  config.termsOfService = process.env.SWAGGER_TERMS_OF_SERVICE || 'https://lawrose.com/terms';
  config.contactName = process.env.SWAGGER_CONTACT_NAME || 'LawRose Development Team';
  config.contactEmail = process.env.SWAGGER_CONTACT_EMAIL || 'dev@lawrose.com';
  config.contactUrl = process.env.SWAGGER_CONTACT_URL || 'https://lawrose.com/contact';
  config.licenseName = process.env.SWAGGER_LICENSE_NAME || 'MIT';
  config.licenseUrl = process.env.SWAGGER_LICENSE_URL || 'https://opensource.org/licenses/MIT';
  config.path = process.env.SWAGGER_PATH || 'api/docs';
  config.tags = process.env.SWAGGER_TAGS 
    ? process.env.SWAGGER_TAGS.split(',').map(tag => tag.trim())
    : ['Categories', 'Subcategories', 'Collections', 'Gender', 'Health'];
  config.externalDocsDescription = process.env.SWAGGER_EXTERNAL_DOCS_DESCRIPTION || 'Find more info here';
  config.externalDocsUrl = process.env.SWAGGER_EXTERNAL_DOCS_URL || 'https://docs.lawrose.com';
  config.servers = process.env.SWAGGER_SERVERS
    ? process.env.SWAGGER_SERVERS.split(',').map(server => server.trim())
    : ['http://localhost:5000', 'http://localhost:8000', 'https://api.lawrose.com'];
  config.enableApiKey = process.env.SWAGGER_ENABLE_API_KEY === 'true';
  config.apiKeyName = process.env.SWAGGER_API_KEY_NAME || 'X-API-Key';
  config.apiKeyLocation = process.env.SWAGGER_API_KEY_LOCATION || 'header';
  config.enableBearerAuth = process.env.SWAGGER_ENABLE_BEARER_AUTH !== 'false';
  config.bearerFormat = process.env.SWAGGER_BEARER_FORMAT || 'JWT';
  config.bearerScheme = process.env.SWAGGER_BEARER_SCHEME || 'bearer';
  config.enableOAuth2 = process.env.SWAGGER_ENABLE_OAUTH2 === 'true';
  config.oauth2AuthorizationUrl = process.env.SWAGGER_OAUTH2_AUTHORIZATION_URL || 'https://auth.lawrose.com/oauth2/authorize';
  config.oauth2TokenUrl = process.env.SWAGGER_OAUTH2_TOKEN_URL || 'https://auth.lawrose.com/oauth2/token';
  config.oauth2Scopes = process.env.SWAGGER_OAUTH2_SCOPES
    ? process.env.SWAGGER_OAUTH2_SCOPES.split(',').map(scope => scope.trim())
    : ['read', 'write', 'admin'];
  config.enableCookieAuth = process.env.SWAGGER_ENABLE_COOKIE_AUTH === 'true';
  config.cookieName = process.env.SWAGGER_COOKIE_NAME || 'sessionId';
  config.enableBasicAuth = process.env.SWAGGER_ENABLE_BASIC_AUTH === 'true';
  config.enableExplorer = process.env.SWAGGER_ENABLE_EXPLORER !== 'false';
  config.enableJsonEditor = process.env.SWAGGER_ENABLE_JSON_EDITOR !== 'false';
  config.enableFilter = process.env.SWAGGER_ENABLE_FILTER !== 'false';
  config.enableDeepLinking = process.env.SWAGGER_ENABLE_DEEP_LINKING !== 'false';
  config.enableDisplayOperationId = process.env.SWAGGER_ENABLE_DISPLAY_OPERATION_ID === 'true';
  config.enableDefaultModelsExpandDepth = process.env.SWAGGER_ENABLE_DEFAULT_MODELS_EXPAND_DEPTH !== 'false';
  config.defaultModelsExpandDepth = parseInt(process.env.SWAGGER_DEFAULT_MODELS_EXPAND_DEPTH, 10) || 1;
  config.defaultModelExpandDepth = parseInt(process.env.SWAGGER_DEFAULT_MODEL_EXPAND_DEPTH, 10) || 1;
  config.defaultModelRendering = process.env.SWAGGER_DEFAULT_MODEL_RENDERING || 'example';
  config.enableDisplayRequestDuration = process.env.SWAGGER_ENABLE_DISPLAY_REQUEST_DURATION !== 'false';
  config.enableDocExpansion = process.env.SWAGGER_ENABLE_DOC_EXPANSION !== 'false';
  config.docExpansion = process.env.SWAGGER_DOC_EXPANSION || 'list';
  config.enableOperationsSorter = process.env.SWAGGER_ENABLE_OPERATIONS_SORTER !== 'false';
  config.operationsSorter = process.env.SWAGGER_OPERATIONS_SORTER || 'alpha';
  config.enableTagsSorter = process.env.SWAGGER_ENABLE_TAGS_SORTER !== 'false';
  config.tagsSorter = process.env.SWAGGER_TAGS_SORTER || 'alpha';
  config.enableTryItOutEnabled = process.env.SWAGGER_ENABLE_TRY_IT_OUT_ENABLED !== 'false';
  config.enableRequestSnippetsEnabled = process.env.SWAGGER_ENABLE_REQUEST_SNIPPETS_ENABLED !== 'false';
  config.enablePersistAuthorization = process.env.SWAGGER_ENABLE_PERSIST_AUTHORIZATION !== 'false';
  config.customCss = process.env.SWAGGER_CUSTOM_CSS || '';
  config.customJs = process.env.SWAGGER_CUSTOM_JS || '';
  config.customFavIcon = process.env.SWAGGER_CUSTOM_FAV_ICON || '';
  config.customSiteTitle = process.env.SWAGGER_CUSTOM_SITE_TITLE || 'Category Service API Documentation';
  config.customfavIcon = process.env.SWAGGER_CUSTOM_FAVICON || '/favicon.ico';
  config.swaggerUrl = process.env.SWAGGER_URL || '';
  config.customCssUrl = process.env.SWAGGER_CUSTOM_CSS_URL || '';
  config.customJsUrl = process.env.SWAGGER_CUSTOM_JS_URL || '';
  config.enableValidatorUrl = process.env.SWAGGER_ENABLE_VALIDATOR_URL === 'true';
  config.validatorUrl = process.env.SWAGGER_VALIDATOR_URL || '';
  config.enableSupportedSubmitMethods = process.env.SWAGGER_ENABLE_SUPPORTED_SUBMIT_METHODS !== 'false';
  config.supportedSubmitMethods = process.env.SWAGGER_SUPPORTED_SUBMIT_METHODS
    ? process.env.SWAGGER_SUPPORTED_SUBMIT_METHODS.split(',').map(method => method.trim())
    : ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
  config.enableResponseInterceptor = process.env.SWAGGER_ENABLE_RESPONSE_INTERCEPTOR === 'true';
  config.enableRequestInterceptor = process.env.SWAGGER_ENABLE_REQUEST_INTERCEPTOR === 'true';
  config.enableOnComplete = process.env.SWAGGER_ENABLE_ON_COMPLETE === 'true';
  config.enableShowMutatedRequest = process.env.SWAGGER_ENABLE_SHOW_MUTATED_REQUEST !== 'false';
  config.enableShowExtensions = process.env.SWAGGER_ENABLE_SHOW_EXTENSIONS !== 'false';
  config.enableShowCommonExtensions = process.env.SWAGGER_ENABLE_SHOW_COMMON_EXTENSIONS !== 'false';
  config.enableMaxDisplayedTags = process.env.SWAGGER_ENABLE_MAX_DISPLAYED_TAGS === 'true';
  config.maxDisplayedTags = parseInt(process.env.SWAGGER_MAX_DISPLAYED_TAGS, 10) || -1;
  config.enableUseUnsafeMarkdown = process.env.SWAGGER_ENABLE_USE_UNSAFE_MARKDOWN === 'true';
  config.enableSyntaxHighlight = process.env.SWAGGER_ENABLE_SYNTAX_HIGHLIGHT !== 'false';
  config.syntaxHighlightTheme = process.env.SWAGGER_SYNTAX_HIGHLIGHT_THEME || 'agate';
  config.enableQueryConfigEnabled = process.env.SWAGGER_ENABLE_QUERY_CONFIG_ENABLED !== 'false';
  config.enablePresetEnv = process.env.SWAGGER_ENABLE_PRESET_ENV !== 'false';
  config.presetEnv = process.env.SWAGGER_PRESET_ENV || 'browser';

  return config;
});