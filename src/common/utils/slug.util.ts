/* eslint-disable prettier/prettier */
/**
 * Utility functions for generating URL-friendly slugs
 * Used across the category service for creating SEO-friendly URLs
 */

export interface SlugOptions {
  replacement?: string;
  remove?: RegExp;
  lower?: boolean;
  strict?: boolean;
  locale?: string;
  trim?: boolean;
}

/**
 * Convert a string to a URL-friendly slug
 * @param input - The string to convert
 * @param options - Configuration options for slug generation
 * @returns URL-friendly slug string
 */
export function slugify(input: string, options: SlugOptions = {}): string {
  const defaults: SlugOptions = {
    replacement: '-',
    remove: /[*+~.()'"!:@]/g,
    lower: true,
    strict: false,
    locale: 'en',
    trim: true,
  };

  const opts = { ...defaults, ...options };

  if (!input || typeof input !== 'string') {
    return '';
  }

  let result = input;

  // Handle locale-specific character replacements
  if (opts.locale === 'en') {
    result = result
      .replace(/[àáâãäåæ]/g, 'a')
      .replace(/[çć]/g, 'c')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[ñń]/g, 'n')
      .replace(/[òóôõöø]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ß]/g, 'ss')
      .replace(/[ÀÁÂÃÄÅÆ]/g, 'A')
      .replace(/[ÇĆ]/g, 'C')
      .replace(/[ÈÉÊË]/g, 'E')
      .replace(/[ÌÍÎÏ]/g, 'I')
      .replace(/[ÑŃ]/g, 'N')
      .replace(/[ÒÓÔÕÖØ]/g, 'O')
      .replace(/[ÙÚÛÜ]/g, 'U')
      .replace(/[ÝŸ]/g, 'Y');
  }

  // Remove unwanted characters
  if (opts.remove) {
    result = result.replace(opts.remove, '');
  }

  // Replace spaces and special characters with replacement
  result = result
    .replace(/[\s\W-]+/g, opts.replacement!)
    .replace(new RegExp(`^${opts.replacement}+|${opts.replacement}+$`, 'g'), '');

  // Apply strict mode (remove all non-alphanumeric characters except replacement)
  if (opts.strict) {
    result = result.replace(new RegExp(`[^a-zA-Z0-9${opts.replacement}]`, 'g'), '');
  }

  // Convert to lowercase
  if (opts.lower) {
    result = result.toLowerCase();
  }

  // Trim whitespace
  if (opts.trim) {
    result = result.trim();
  }

  return result;
}

/**
 * Generate a unique slug by appending a number suffix if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @param maxAttempts - Maximum number of attempts to generate unique slug
 * @returns Unique slug string
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
  maxAttempts: number = 100,
): string {
  let slug = baseSlug;
  let counter = 1;
  let attempts = 0;

  while (existingSlugs.includes(slug) && attempts < maxAttempts) {
    slug = `${baseSlug}-${counter}`;
    counter++;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    // Fallback to timestamp-based slug
    slug = `${baseSlug}-${Date.now()}`;
  }

  return slug;
}

/**
 * Validate if a string is a valid slug
 * @param slug - The slug to validate
 * @returns Boolean indicating if slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Check if slug contains only lowercase letters, numbers, and hyphens
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length > 0 && slug.length <= 100;
}

/**
 * Generate slug from category name with parent category context
 * @param categoryName - The category name
 * @param parentSlug - Optional parent category slug for hierarchical URLs
 * @param options - Slug generation options
 * @returns Generated slug
 */
export function generateCategorySlug(
  categoryName: string,
  parentSlug?: string,
  options: SlugOptions = {},
): string {
  const slug = slugify(categoryName, options);
  
  if (parentSlug && isValidSlug(parentSlug)) {
    return `${parentSlug}/${slug}`;
  }
  
  return slug;
}

/**
 * Generate slug for collections with type prefix
 * @param collectionName - The collection name
 * @param collectionType - The collection type (e.g., 'seasonal', 'featured')
 * @param options - Slug generation options
 * @returns Generated collection slug
 */
export function generateCollectionSlug(
  collectionName: string,
  collectionType?: string,
  options: SlugOptions = {},
): string {
  const baseSlug = slugify(collectionName, options);
  
  if (collectionType) {
    const typeSlug = slugify(collectionType, options);
    return `${typeSlug}/${baseSlug}`;
  }
  
  return baseSlug;
}

/**
 * Extract the base slug from a hierarchical slug
 * @param slug - The hierarchical slug (e.g., 'parent/child')
 * @returns Base slug without parent path
 */
export function extractBaseSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return '';
  }

  const parts = slug.split('/');
  return parts[parts.length - 1];
}

/**
 * Get the parent slug from a hierarchical slug
 * @param slug - The hierarchical slug (e.g., 'parent/child')
 * @returns Parent slug or empty string if no parent
 */
export function getParentSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return '';
  }

  const parts = slug.split('/');
  if (parts.length <= 1) {
    return '';
  }

  return parts.slice(0, -1).join('/');
}

/**
 * Build breadcrumb array from hierarchical slug
 * @param slug - The hierarchical slug
 * @returns Array of slug parts for breadcrumb navigation
 */
export function buildSlugBreadcrumbs(slug: string): string[] {
  if (!slug || typeof slug !== 'string') {
    return [];
  }

  const parts = slug.split('/');
  const breadcrumbs: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    breadcrumbs.push(parts.slice(0, i + 1).join('/'));
  }

  return breadcrumbs;
}