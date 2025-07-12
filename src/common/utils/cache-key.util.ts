/* eslint-disable prettier/prettier */
/**
 * Cache key utility functions for generating consistent cache keys
 * across the category microservice
 */

// import { CACHE_KEYS } from '../constants/cache-keys.constants';

/**
 * Interface for cache key generation parameters
 */
export interface CacheKeyParams {
  prefix?: string;
  suffix?: string;
  separator?: string;
  [key: string]: any;
}

/**
 * Generate a standardized cache key with optional parameters
 * @param baseKey - Base cache key from constants
 * @param params - Parameters to include in the cache key
 * @returns Formatted cache key string
 */
export function generateCacheKey(baseKey: string, params?: CacheKeyParams): string {
  if (!params) {
    return baseKey;
  }

  const { prefix, suffix, separator = ':', ...otherParams } = params;
  const parts: string[] = [];

  // Add prefix if provided
  if (prefix) {
    parts.push(prefix);
  }

  // Add base key
  parts.push(baseKey);

  // Add other parameters as key-value pairs
  Object.entries(otherParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Convert arrays and objects to strings
      const stringValue = Array.isArray(value) || typeof value === 'object' 
        ? JSON.stringify(value) 
        : String(value);
      parts.push(`${key}${separator}${stringValue}`);
    }
  });

  // Add suffix if provided
  if (suffix) {
    parts.push(suffix);
  }

  return parts.join(separator);
}

/**
 * Generate cache key for paginated results
 * @param baseKey - Base cache key
 * @param page - Page number
 * @param limit - Items per page
 * @param filters - Additional filter parameters
 * @returns Formatted cache key for pagination
 */
export function generatePaginationCacheKey(
  baseKey: string,
  page: number,
  limit: number,
  filters?: Record<string, any>
): string {
  const params: CacheKeyParams = {
    page,
    limit,
    ...filters,
  };

  return generateCacheKey(baseKey, params);
}

/**
 * Generate cache key for entity by ID
 * @param baseKey - Base cache key
 * @param id - Entity ID
 * @returns Formatted cache key for single entity
 */
export function generateEntityCacheKey(baseKey: string, id: string): string {
  return generateCacheKey(baseKey, { id });
}

/**
 * Generate cache key for search results
 * @param baseKey - Base cache key
 * @param query - Search query
 * @param filters - Search filters
 * @returns Formatted cache key for search results
 */
export function generateSearchCacheKey(
  baseKey: string,
  query: string,
  filters?: Record<string, any>
): string {
  const params: CacheKeyParams = {
    query: query.toLowerCase().trim(),
    ...filters,
  };

  return generateCacheKey(baseKey, params);
}

/**
 * Generate cache key for user-specific data
 * @param baseKey - Base cache key
 * @param userId - User ID
 * @param additionalParams - Additional parameters
 * @returns Formatted cache key for user-specific data
 */
export function generateUserCacheKey(
  baseKey: string,
  userId: string,
  additionalParams?: Record<string, any>
): string {
  const params: CacheKeyParams = {
    userId,
    ...additionalParams,
  };

  return generateCacheKey(baseKey, params);
}

/**
 * Generate cache key for hierarchical data
 * @param baseKey - Base cache key
 * @param hierarchy - Array of hierarchy levels
 * @returns Formatted cache key for hierarchical data
 */
export function generateHierarchicalCacheKey(
  baseKey: string,
  hierarchy: string[]
): string {
  const params: CacheKeyParams = {
    hierarchy: hierarchy.join('-'),
  };

  return generateCacheKey(baseKey, params);
}

/**
 * Extract parameters from cache key
 * @param cacheKey - Cache key to parse
 * @param separator - Separator used in key (default: ':')
 * @returns Object with extracted parameters
 */
export function parseCacheKey(cacheKey: string, separator: string = ':'): Record<string, string> {
  const parts = cacheKey.split(separator);
  const params: Record<string, string> = {};

  parts.forEach((part, index) => {
    if (index === 0) {
      params.baseKey = part;
    } else if (part.includes(':')) {
      const [key, value] = part.split(':', 2);
      params[key] = value;
    }
  });

  return params;
}

/**
 * Validate cache key format
 * @param cacheKey - Cache key to validate
 * @returns True if valid, false otherwise
 */
export function isValidCacheKey(cacheKey: string): boolean {
  // Check if key is not empty and doesn't contain invalid characters
  if (!cacheKey || cacheKey.trim().length === 0) {
    return false;
  }

  // Check for invalid characters that might cause issues with Redis
  const invalidChars = /[\s\n\r\t]/;
  if (invalidChars.test(cacheKey)) {
    return false;
  }

  // Check maximum length (Redis key limit is 512MB, but we'll use a practical limit)
  if (cacheKey.length > 250) {
    return false;
  }

  return true;
}

/**
 * Generate cache key with TTL information
 * @param baseKey - Base cache key
 * @param ttl - Time to live in seconds
 * @param params - Additional parameters
 * @returns Object with cache key and TTL
 */
export function generateCacheKeyWithTTL(
  baseKey: string,
  ttl: number,
  params?: CacheKeyParams
): { key: string; ttl: number } {
  const key = generateCacheKey(baseKey, params);
  return { key, ttl };
}

/**
 * Generate cache key for API responses
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param params - Request parameters
 * @returns Formatted cache key for API responses
 */
export function generateApiCacheKey(
  endpoint: string,
  method: string,
  params?: Record<string, any>
): string {
  const sanitizedEndpoint = endpoint.replace(/[\/\?]/g, '_');
  const baseKey = `${CACHE_KEYS.API_RESPONSE}:${method.toUpperCase()}:${sanitizedEndpoint}`;
  
  return generateCacheKey(baseKey, params);
}

/**
 * Cache key constants for the category microservice
 */
export const CACHE_KEYS = {
  // Category-related cache keys
  CATEGORIES: {
    ALL: 'categories:all',
    BY_ID: 'categories:id',
    BY_SLUG: 'categories:slug',
    BY_STATUS: 'categories:status',
    BY_GENDER: 'categories:gender',
    ACTIVE: 'categories:active',
    INACTIVE: 'categories:inactive',
    DELETED: 'categories:deleted',
    SEARCH: 'categories:search',
    PAGINATED: 'categories:paginated',
    RECENT: 'categories:recent',
    WITH_SUBCATEGORIES: 'categories:with-subcategories', // Added missing property
  },
  
  // Category stats cache key
  CATEGORY_STATS: 'categories:stats', // Added missing property
  
  // Category validation cache key
  CATEGORY_VALIDATION: 'categories:validation', // Added missing property
  
  // Alternative naming for consistency
  CATEGORIES_WITH_SUBCATEGORIES: 'categories:with-subcategories', // Added missing property
  
  // API response cache keys
  API_RESPONSE: 'api:response',
  
  // User-related cache keys
  USER: {
    PROFILE: 'user:profile',
    PREFERENCES: 'user:preferences',
    PERMISSIONS: 'user:permissions',
    SESSIONS: 'user:sessions',
  },
  
  // Product-related cache keys
  PRODUCTS: {
    ALL: 'products:all',
    BY_ID: 'products:id',
    BY_CATEGORY: 'products:category',
    BY_BRAND: 'products:brand',
    FEATURED: 'products:featured',
    TRENDING: 'products:trending',
    SEARCH: 'products:search',
  },
  
  // Order-related cache keys
  ORDERS: {
    ALL: 'orders:all',
    BY_ID: 'orders:id',
    BY_USER: 'orders:user',
    BY_STATUS: 'orders:status',
    RECENT: 'orders:recent',
  },
  
  // System cache keys
  SYSTEM: {
    CONFIG: 'system:config',
    HEALTH: 'system:health',
    METRICS: 'system:metrics',
  },
  
  // Notification cache keys
  NOTIFICATION: {
    BY_USER: 'notifications:user',
    UNREAD: 'notifications:unread',
    RECENT: 'notifications:recent',
  },
} as const;