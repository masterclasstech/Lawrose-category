/* eslint-disable prettier/prettier */
/**
 * Cache keys constants for the category microservice
 * Centralized cache key definitions to ensure consistency
 */

export const CACHE_KEYS = {
  // Category cache keys
   CATEGORIES: {
    ALL: 'categories:all',
    BY_ID: 'categories:id',
    BY_SLUG: 'categories:slug',
    BY_STATUS: 'categories:status',
    BY_GENDER: 'categories:gender',
    BY_PARENT: 'categories:parent',
    BY_LEVEL: 'categories:level',
    BY_SORT_ORDER: 'categories:sort-order',
    ACTIVE: 'categories:active',
    INACTIVE: 'categories:inactive',
    DELETED: 'categories:deleted',
    TRENDING: 'categories:trending',
    POPULAR: 'categories:popular',
    RECENT: 'categories:recent',
    // Add the missing WITH_SUBCATEGORIES property
    WITH_SUBCATEGORIES: 'categories:with-subcategories'
  },

   // Add the missing top-level properties
  CATEGORY_STATS: 'categories:stats',
  CATEGORY_VALIDATION: 'categories:validation',
  CATEGORIES_WITH_SUBCATEGORIES: 'categories:with-subcategories',

    // Other existing cache keys (keeping the structure you already have)
  PRODUCTS: {
    ALL: 'products:all',
    BY_ID: 'products:id',
    BY_SLUG: 'products:slug',
    BY_CATEGORY: 'products:category',
    BY_BRAND: 'products:brand',
    BY_STATUS: 'products:status',
    BY_PRICE_RANGE: 'products:price-range',
    FEATURED: 'products:featured',
    TRENDING: 'products:trending',
    POPULAR: 'products:popular',
    RECENT: 'products:recent'
  },


  // Subcategory cache keys
  SUBCATEGORIES: {
    ALL: 'subcategories:all',
    BY_ID: 'subcategories:id',
    BY_SLUG: 'subcategories:slug',
    BY_CATEGORY: 'subcategories:category',
    BY_STATUS: 'subcategories:status',
    BY_GENDER: 'subcategories:gender',
    ACTIVE: 'subcategories:active',
    INACTIVE: 'subcategories:inactive',
    TREE: 'subcategories:tree',
    BREADCRUMB: 'subcategories:breadcrumb',
    SEARCH: 'subcategories:search',
    COUNT: 'subcategories:count',
    PAGINATED: 'subcategories:paginated',
    FEATURED: 'subcategories:featured',
    POPULAR: 'subcategories:popular',
    RECENT: 'subcategories:recent',
  },

  // Collection cache keys
  COLLECTIONS: {
    ALL: 'collections:all',
    BY_ID: 'collections:id',
    BY_SLUG: 'collections:slug',
    BY_TYPE: 'collections:type',
    BY_STATUS: 'collections:status',
    BY_GENDER: 'collections:gender',
    BY_CATEGORY: 'collections:category',
    BY_SUBCATEGORY: 'collections:subcategory',
    ACTIVE: 'collections:active',
    INACTIVE: 'collections:inactive',
    SEASONAL: 'collections:seasonal',
    PROMOTIONAL: 'collections:promotional',
    REGULAR: 'collections:regular',
    SEARCH: 'collections:search',
    COUNT: 'collections:count',
    PAGINATED: 'collections:paginated',
    FEATURED: 'collections:featured',
    POPULAR: 'collections:popular',
    RECENT: 'collections:recent',
  },

  // Gender cache keys
  GENDER: {
    ALL: 'gender:all',
    BY_ID: 'gender:id',
    BY_SLUG: 'gender:slug',
    BY_STATUS: 'gender:status',
    ACTIVE: 'gender:active',
    INACTIVE: 'gender:inactive',
    SEARCH: 'gender:search',
    COUNT: 'gender:count',
    PAGINATED: 'gender:paginated',
  },

  // API Response cache keys
  API_RESPONSE: 'api:response',
  API_ERROR: 'api:error',

  // Statistics cache keys
  STATISTICS: {
    CATEGORY_COUNT: 'stats:category:count',
    SUBCATEGORY_COUNT: 'stats:subcategory:count',
    COLLECTION_COUNT: 'stats:collection:count',
    GENDER_COUNT: 'stats:gender:count',
    ACTIVE_CATEGORIES: 'stats:categories:active',
    INACTIVE_CATEGORIES: 'stats:categories:inactive',
    CATEGORY_HIERARCHY: 'stats:category:hierarchy',
    POPULAR_CATEGORIES: 'stats:categories:popular',
    TRENDING_COLLECTIONS: 'stats:collections:trending',
    DAILY_STATS: 'stats:daily',
    WEEKLY_STATS: 'stats:weekly',
    MONTHLY_STATS: 'stats:monthly',
  },

  // Search cache keys
  SEARCH: {
    CATEGORIES: 'search:categories',
    SUBCATEGORIES: 'search:subcategories',
    COLLECTIONS: 'search:collections',
    GENDER: 'search:gender',
    AUTOCOMPLETE: 'search:autocomplete',
    SUGGESTIONS: 'search:suggestions',
    POPULAR_SEARCHES: 'search:popular',
    RECENT_SEARCHES: 'search:recent',
  },

  // User-specific cache keys
  USER: {
    ALL: 'users:all',
    BY_ID: 'users:id',
    BY_EMAIL: 'users:email',
    BY_ROLE: 'users:role',
    BY_STATUS: 'users:status',
    ACTIVE: 'users:active',
    RECENT: 'users:recent',
    PREFERENCES: 'user:preferences',
    FAVORITES: 'user:favorites',
    RECENT_VIEWS: 'user:recent:views',
    SEARCH_HISTORY: 'user:search:history',
    RECOMMENDATIONS: 'user:recommendations',
  },

  // Session cache keys
  SESSION: {
    DATA: 'session:data',
    CART: 'session:cart',
    WISHLIST: 'session:wishlist',
    PREFERENCES: 'session:preferences',
    ACTIVITY: 'session:activity',
  },

  // Rate limiting cache keys
  RATE_LIMIT: {
    API: 'rate_limit:api',
    SEARCH: 'rate_limit:search',
    CREATE: 'rate_limit:create',
    UPDATE: 'rate_limit:update',
    DELETE: 'rate_limit:delete',
    BULK_OPERATIONS: 'rate_limit:bulk',
  },

  // Lock cache keys (for distributed locking)
  LOCK: {
    CATEGORY_UPDATE: 'lock:category:update',
    SUBCATEGORY_UPDATE: 'lock:subcategory:update',
    COLLECTION_UPDATE: 'lock:collection:update',
    GENDER_UPDATE: 'lock:gender:update',
    BULK_OPERATION: 'lock:bulk:operation',
    SEEDING: 'lock:seeding',
    MIGRATION: 'lock:migration',
  },

  // Health check cache keys
  HEALTH: {
    DATABASE: 'health:database',
    REDIS: 'health:redis',
    KAFKA: 'health:kafka',
    OVERALL: 'health:overall',
    SERVICES: 'health:services',
  },

  // Configuration cache keys
  CONFIG: {
    FEATURE_FLAGS: 'config:feature_flags',
    SETTINGS: 'config:settings',
    MAINTENANCE: 'config:maintenance',
    RATE_LIMITS: 'config:rate_limits',
    CACHE_TTL: 'config:cache_ttl',
  },

  // Monitoring cache keys
  MONITORING: {
    METRICS: 'monitoring:metrics',
    PERFORMANCE: 'monitoring:performance',
    ERRORS: 'monitoring:errors',
    ALERTS: 'monitoring:alerts',
    LOGS: 'monitoring:logs',
  },

  // Backup and sync cache keys
  BACKUP: {
    LAST_BACKUP: 'backup:last',
    STATUS: 'backup:status',
    SCHEDULE: 'backup:schedule',
  },

  // Event cache keys
  EVENTS: {
    CATEGORY_CREATED: 'event:category:created',
    CATEGORY_UPDATED: 'event:category:updated',
    CATEGORY_DELETED: 'event:category:deleted',
    SUBCATEGORY_CREATED: 'event:subcategory:created',
    SUBCATEGORY_UPDATED: 'event:subcategory:updated',
    SUBCATEGORY_DELETED: 'event:subcategory:deleted',
    COLLECTION_CREATED: 'event:collection:created',
    COLLECTION_UPDATED: 'event:collection:updated',
    COLLECTION_DELETED: 'event:collection:deleted',
    GENDER_CREATED: 'event:gender:created',
    GENDER_UPDATED: 'event:gender:updated',
    GENDER_DELETED: 'event:gender:deleted',
  },

  // Audit cache keys
  AUDIT: {
    CATEGORY_CHANGES: 'audit:category:changes',
    SUBCATEGORY_CHANGES: 'audit:subcategory:changes',
    COLLECTION_CHANGES: 'audit:collection:changes',
    GENDER_CHANGES: 'audit:gender:changes',
    USER_ACTIONS: 'audit:user:actions',
    SYSTEM_EVENTS: 'audit:system:events',
  },

  // Validation cache keys
  VALIDATION: {
    UNIQUE_SLUGS: 'validation:unique:slugs',
    UNIQUE_NAMES: 'validation:unique:names',
    CATEGORY_HIERARCHY: 'validation:category:hierarchy',
    BUSINESS_RULES: 'validation:business:rules',
  },

  // Notification cache keys
  NOTIFICATION: {
    PENDING: 'notification:pending',
    SENT: 'notification:sent',
    FAILED: 'notification:failed',
    PREFERENCES: 'notification:preferences',
  },
} as const;

// Cache TTL (Time To Live) constants in seconds
export const CACHE_TTL = {
  SHORT: 300,        // 5 minutes
  MEDIUM: 1800,      // 30 minutes
  LONG: 3600,        // 1 hour
  VERY_LONG: 86400,  // 24 hours
  PERMANENT: -1,     // No expiration
} as const;

// Cache key prefixes for different environments
export const CACHE_PREFIXES = {
  DEVELOPMENT: 'dev',
  STAGING: 'stage',
  PRODUCTION: 'prod',
  TEST: 'test',
} as const;

// Cache key patterns for complex operations
export const CACHE_PATTERNS = {
  WILDCARD: '*',
  CATEGORY_TREE: 'categories:tree:*',
  USER_DATA: 'user:*',
  SEARCH_RESULTS: 'search:*',
  RATE_LIMIT_USER: 'rate_limit:user:*',
  SESSION_DATA: 'session:*',
  STATISTICS: 'stats:*',
  HEALTH_CHECKS: 'health:*',
  LOCKS: 'lock:*',
  EVENTS: 'event:*',
  AUDIT_LOGS: 'audit:*',
} as const;

// Export types for type safety
export type CacheKey = typeof CACHE_KEYS;
export type CacheTTL = typeof CACHE_TTL;
export type CachePrefix = typeof CACHE_PREFIXES;
export type CachePattern = typeof CACHE_PATTERNS;