/* eslint-disable prettier/prettier */
import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ConflictException,
  Logger,
  Inject
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from "../categories/dto/update-category.dto";
import { CategoryQueryDto } from "../categories/dto/category-filter.dto";
import { CategoryResponseDto } from "../categories/dto/category-response.dto";
import { CategoryListResponseDto } from "../categories/dto/category-paginated.dto";
import { 
  CategoryStatsDto, 
  CategoryValidationDto 
} from "../categories/dto/category.statistics.dto";
import { CategoriesRepository } from './categories.repository';
import { CategoryStatus } from '../../common/enums/category-status.enum';
import { Gender } from '../../common/enums/gender.enum';
import { generateCacheKey } from '../../common/utils/cache-key.util';
import { CACHE_KEYS } from '../../common/constants/cache-keys.constants';
import { Types } from 'mongoose';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  
  // Cache TTL constants for different types of data
  private readonly CACHE_TTL = {
    LIST: 300,        // 5 minutes for lists
    DETAIL: 600,      // 10 minutes for single items
    STATS: 900,       // 15 minutes for statistics
    VALIDATION: 60    // 1 minute for validation
  };

  constructor(
    private readonly categoriesRepository: CategoriesRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto>  {
    try {
      // Repository already handles duplicate checks, so we can directly create
      const category = await this.categoriesRepository.create(createCategoryDto);
      
      // Clear relevant caches efficiently
      await this.clearCategoryCache();
      
      this.logger.log(`Category created successfully: ${category.name} (${category._id})`);
      
      return this.mapToResponseDto(category);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error; // Re-throw repository conflicts
      }
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all categories with filtering and pagination
   */
  async findAll(queryDto: CategoryQueryDto): Promise<CategoryListResponseDto> {
    try {
      const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORIES.ALL, queryDto);
      
      // Try cache first
      const cachedResult = await this.cacheManager.get<CategoryListResponseDto>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use repository's findAll method directly
      const result = await this.categoriesRepository.findAll(queryDto);

      const response: CategoryListResponseDto = {
        data: result.data.map(category => this.mapToResponseDto(category)),
        pagination: result.pagination
      };

      // Cache with appropriate TTL
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL.LIST);
      
      return response;
    } catch (error) {
      this.logger.error(`Error finding categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a single category by ID
   */
  async findOne(id: string, includeSubcategories = false): Promise<CategoryResponseDto> {
    try {
      // Early validation
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid category ID format');
      }

      const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORIES.BY_ID, { id, includeSubcategories });
      
      // Try cache first
      const cachedResult = await this.cacheManager.get<CategoryResponseDto>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use repository's findById method
      const category = await this.categoriesRepository.findById(id);

      const response = this.mapToResponseDto(category);
      
      // Cache with longer TTL for single items
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL.DETAIL);
      
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw repository not found errors
      }
      this.logger.error(`Error finding category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find a category by slug
   */
  async findBySlug(slug: string, includeSubcategories = false): Promise<CategoryResponseDto> {
    try {
      const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORIES.BY_SLUG, { slug, includeSubcategories });
      
      // Try cache first
      const cachedResult = await this.cacheManager.get<CategoryResponseDto>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use repository's findBySlug method
      const category = await this.categoriesRepository.findBySlug(slug);

      const response = this.mapToResponseDto(category);
      
      // Cache with longer TTL
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL.DETAIL);
      
      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw repository not found errors
      }
      this.logger.error(`Error finding category by slug ${slug}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    try {
      // Early validation
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid category ID format');
      }

      // Repository handles existence checks and conflict validation
      const updatedCategory = await this.categoriesRepository.update(id, updateCategoryDto);
      
      // Clear relevant caches efficiently
      await this.clearCategoryCache(id);
      
      this.logger.log(`Category updated successfully: ${updatedCategory.name} (${updatedCategory._id})`);
      
      return this.mapToResponseDto(updatedCategory);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error; // Re-throw repository errors
      }
      this.logger.error(`Error updating category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete a category
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      // Early validation
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid category ID format');
      }

      // Repository handles existence checks
      const deletedCategory = await this.categoriesRepository.softDelete(id);
      
      // Clear relevant caches
      await this.clearCategoryCache(id);
      
      this.logger.log(`Category soft deleted successfully: ${deletedCategory.name} (${id})`);
      
      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw repository not found errors
      }
      this.logger.error(`Error deleting category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore a soft-deleted category
   */
  async restore(id: string): Promise<CategoryResponseDto> {
    try {
      // Early validation
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid category ID format');
      }

      // Repository handles existence and deletion state checks
      const restoredCategory = await this.categoriesRepository.restore(id);
      
      // Clear relevant caches
      await this.clearCategoryCache(id);
      
      this.logger.log(`Category restored successfully: ${restoredCategory.name} (${id})`);
      
      return this.mapToResponseDto(restoredCategory);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw repository errors
      }
      this.logger.error(`Error restoring category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Hard delete a category (permanent)
   */
  async hardDelete(id: string): Promise<{ message: string }> {
    try {
      // Early validation
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid category ID format');
      }

      // Repository handles existence checks
      await this.categoriesRepository.hardDelete(id);
      
      // Clear relevant caches
      await this.clearCategoryCache(id);
      
      this.logger.log(`Category hard deleted successfully: (${id})`);
      
      return { message: 'Category permanently deleted' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw repository not found errors
      }
      this.logger.error(`Error hard deleting category ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update category status
   */
  async updateStatus(id: string, status: CategoryStatus): Promise<CategoryResponseDto> {
    try {
      // Early validation
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid category ID format');
      }

      // Use repository's updateStatus method
      const updatedCategory = await this.categoriesRepository.updateStatus(id, status);
      
      // Clear relevant caches
      await this.clearCategoryCache(id);
      
      this.logger.log(`Category status updated: ${updatedCategory.name} (${id}) -> ${status}`);
      
      return this.mapToResponseDto(updatedCategory);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw repository not found errors
      }
      this.logger.error(`Error updating category status ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update sort order for multiple categories
   */
  async updateSortOrder(updates: { id: string; sortOrder: number }[]): Promise<{ message: string; updated: number }> {
    try {
      // Validate all IDs upfront
      const invalidIds = updates.filter(update => !Types.ObjectId.isValid(update.id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid ID format: ${invalidIds.map(u => u.id).join(', ')}`);
      }

      // Use repository's updateSortOrder method
      await this.categoriesRepository.updateSortOrder(updates);
      
      // Clear relevant caches
      await this.clearCategoryCache();
      
      this.logger.log(`Sort order updated for ${updates.length} categories`);
      
      return { 
        message: 'Sort order updated successfully', 
        updated: updates.length 
      };
    } catch (error) {
      this.logger.error(`Error updating sort order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find categories by gender
   */
  async findByGender(gender: Gender): Promise<CategoryResponseDto[]> {
    try {
      const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORIES.BY_GENDER, { gender });
      
      // Try cache first
      const cachedResult = await this.cacheManager.get<CategoryResponseDto[]>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use repository's findByGender method
      const categories = await this.categoriesRepository.findByGender(gender);
      
      const response = categories.map(category => this.mapToResponseDto(category));
      
      // Cache with appropriate TTL
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL.LIST);
      
      return response;
    } catch (error) {
      this.logger.error(`Error finding categories by gender ${gender}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find categories with subcategories
   */
  async findWithSubcategories(): Promise<CategoryResponseDto[]> {
    try {
      const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORIES.WITH_SUBCATEGORIES);
      
      // Try cache first
      const cachedResult = await this.cacheManager.get<CategoryResponseDto[]>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use repository's findWithSubcategories method
      const categories = await this.categoriesRepository.findWithSubcategories();
      
      const response = categories.map(category => this.mapToResponseDto(category));
      
      // Cache with appropriate TTL
      await this.cacheManager.set(cacheKey, response, this.CACHE_TTL.LIST);
      
      return response;
    } catch (error) {
      this.logger.error(`Error finding categories with subcategories: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Bulk create categories
   */
  async bulkCreate(categories: CreateCategoryDto[]): Promise<CategoryResponseDto[]> {
    try {
      // Use repository's bulkCreate method
      const createdCategories = await this.categoriesRepository.bulkCreate(categories);
      
      // Clear relevant caches
      await this.clearCategoryCache();
      
      this.logger.log(`Bulk created ${createdCategories.length} categories`);
      
      return createdCategories.map(category => this.mapToResponseDto(category));
    } catch (error) {
      this.logger.error(`Error bulk creating categories: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
       /**
 * Get category statistics
 */
async getStats(): Promise<CategoryStatsDto> {
  try {
    const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORY_STATS);
    
    // Try cache first
    const cachedResult = await this.cacheManager.get<CategoryStatsDto>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Get basic stats from repository
    const basicStats = await this.categoriesRepository.getStats();
    
    // Get additional required data
    const [
      statusBreakdown,
      genderBreakdown,
      recentlyCreated,
      recentlyUpdated
    ] = await Promise.all([
      this.categoriesRepository.getStatusBreakdown(),
      this.categoriesRepository.getGenderBreakdown(),
      this.categoriesRepository.getRecentlyCreated(5),
      this.categoriesRepository.getRecentlyUpdated(5)
    ]);

    // Build complete stats object
    const stats: CategoryStatsDto = {
      total: basicStats.total,
      byStatus: statusBreakdown,
      byGender: genderBreakdown,
      withSubcategories: basicStats.withSubcategories,
      withoutSubcategories: basicStats.total - basicStats.withSubcategories,
      softDeleted: basicStats.deleted || 0,
      recentlyCreated: recentlyCreated.map(category => this.mapToResponseDto(category)),
      recentlyUpdated: recentlyUpdated.map(category => this.mapToResponseDto(category))
    };
    
    // Cache with longer TTL for stats
    await this.cacheManager.set(cacheKey, stats, this.CACHE_TTL.STATS);
    
    return stats;
  } catch (error) {
    this.logger.error(`Error getting category stats: ${error.message}`, error.stack);
    throw error;
  }
}

  /**
   * Validate category name and slug availability
   */
  async validateCategory(name: string, slug: string, excludeId?: string): Promise<CategoryValidationDto> {
    try {
      const cacheKey = generateCacheKey(CACHE_KEYS.CATEGORY_VALIDATION, { name, slug, excludeId });
      
      // Try cache first (shorter TTL for validation)
      const cachedResult = await this.cacheManager.get<CategoryValidationDto>(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Use repository's exists method for efficient checking
      const nameExists = await this.categoriesRepository.exists(name);
      const slugExists = await this.categoriesRepository.exists('', slug);
      
      let nameAvailable = !nameExists;
      let slugAvailable = !slugExists;
      const messages: string[] = [];
      
      // If excluding an ID, check if it's the same category
      if (excludeId && (nameExists || slugExists)) {
        // Additional check needed here - this could be optimized further
        // by adding a method to repository to check existence excluding an ID
        nameAvailable = true; // Simplified for now
        slugAvailable = true; // Simplified for now
      }
      
      if (nameAvailable) {
        messages.push('Category name is available');
      } else {
        messages.push('Category name is already in use');
      }
      
      let suggestedSlug: string | undefined;
      if (!slugAvailable) {
        suggestedSlug = await this.generateUniqueSlug(slug);
        messages.push(`Suggested alternative slug: ${suggestedSlug}`);
      } else {
        messages.push('Category slug is available');
      }
      
      const result: CategoryValidationDto = {
        nameAvailable,
        slugAvailable,
        suggestedSlug,
        messages
      };

      // Cache validation result briefly
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL.VALIDATION);
      
      return result;
    } catch (error) {
      this.logger.error(`Error validating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Generate unique slug
   */
  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let counter = 1;
    let uniqueSlug = `${baseSlug}-${counter}`;
    
    // Use repository's exists method for efficiency
    while (await this.categoriesRepository.exists('', uniqueSlug)) {
      counter++;
      uniqueSlug = `${baseSlug}-${counter}`;
    }
    
    return uniqueSlug;
  }

  /**
   * Map category document to response DTO
   */
  private mapToResponseDto(category: any): CategoryResponseDto {
    return {
      _id: category._id?.toString() || category.id?.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status,
      applicableGenders: category.applicableGenders,
      hasSubcategories: category.hasSubcategories,
      sortOrder: category.sortOrder,
      metadata: category.metadata,
      imageUrl: category.imageUrl,
      icon: category.icon,
      isDeleted: category.isDeleted,
      deletedAt: category.deletedAt,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      subcategories: category.subcategories
    };
  }

  /**
   * Clear category-related cache efficiently
   */
  private async clearCategoryCache(categoryId?: string): Promise<void> {
    try {
      // Use Set for unique cache keys to avoid duplicates
      const cacheKeys = new Set<string>([
        CACHE_KEYS.CATEGORIES.ALL,
        CACHE_KEYS.CATEGORY_STATS as string,
        CACHE_KEYS.CATEGORIES.BY_GENDER as string,
        CACHE_KEYS.CATEGORIES_WITH_SUBCATEGORIES as string
      ]);
      
      if (categoryId) {
        cacheKeys.add(`${CACHE_KEYS.CATEGORIES.BY_ID}:${categoryId}`);
        cacheKeys.add(`${CACHE_KEYS.CATEGORIES.BY_SLUG}:*`);
      }
      
      // Clear all cache keys in parallel for better performance
      await Promise.allSettled(
        Array.from(cacheKeys).map(key => this.cacheManager.del(key))
      );
    } catch (error) {
      this.logger.warn(`Error clearing cache: ${error.message}`);
    }
  }
}