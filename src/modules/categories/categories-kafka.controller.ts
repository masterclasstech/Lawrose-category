/* eslint-disable prettier/prettier */
import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-filter.dto';
import { CategoryStatus } from '../../common/enums/category-status.enum';
import { Gender } from '../../common/enums/gender.enum';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Controller()
export class CategoriesKafkaController {
  private readonly logger = new Logger(CategoriesKafkaController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create a new category via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.CREATE)
  async createCategory(
    @Payload() data: { createCategoryDto: CreateCategoryDto; imageData?: Buffer; imageName?: string },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { createCategoryDto, imageData, imageName } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category creation - Partition: ${partition}, Offset: ${offset}`);

      let imageFile: Express.Multer.File | undefined;
      
      // Convert image data back to Multer file format if provided
      if (imageData && imageName) {
        imageFile = {
          buffer: imageData,
          originalname: imageName,
          mimetype: this.getMimeTypeFromExtension(imageName),
          size: imageData.length,
          fieldname: 'image',
          encoding: '7bit',
          destination: '',
          filename: imageName,
          path: '',
          stream: null
        } as Express.Multer.File;
      }

      const result = await this.categoriesService.create(createCategoryDto, imageFile);
      
      this.logger.log(`Category created successfully via Kafka: ${result.name} (${result._id})`);
      
      return {
        success: true,
        data: result,
        message: 'Category created successfully'
      };
    } catch (error) {
      this.logger.error(`Error creating category via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create category'
      };
    }
  }

  /**
   * Find all categories with filtering and pagination via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.FIND_ALL)
  async findAllCategories(
    @Payload() queryDto: CategoryQueryDto,
    @Ctx() context: KafkaContext
  ) {
    try {
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing find all categories - Partition: ${partition}, Offset: ${offset}`);

      const result = await this.categoriesService.findAll(queryDto);
      
      this.logger.log(`Found ${result.data.length} categories via Kafka`);
      
      return {
        success: true,
        data: result,
        message: 'Categories retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error finding categories via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve categories'
      };
    }
  }

  /**
   * Find a single category by ID via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.FIND_ONE)
  async findOneCategory(
    @Payload() data: { id: string; includeSubcategories?: boolean },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { id, includeSubcategories = false } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing find category by ID - Partition: ${partition}, Offset: ${offset}, ID: ${id}`);

      const result = await this.categoriesService.findOne(id, includeSubcategories);
      
      this.logger.log(`Category found via Kafka: ${result.name} (${result._id})`);
      
      return {
        success: true,
        data: result,
        message: 'Category retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error finding category by ID via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve category'
      };
    }
  }

  /**
   * Find a category by slug via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.FIND_BY_SLUG)
  async findCategoryBySlug(
    @Payload() data: { slug: string; includeSubcategories?: boolean },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { slug, includeSubcategories = false } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing find category by slug - Partition: ${partition}, Offset: ${offset}, Slug: ${slug}`);

      const result = await this.categoriesService.findBySlug(slug, includeSubcategories);
      
      this.logger.log(`Category found by slug via Kafka: ${result.name} (${result._id})`);
      
      return {
        success: true,
        data: result,
        message: 'Category retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error finding category by slug via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve category'
      };
    }
  }

  /**
   * Update a category via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.UPDATE)
  async updateCategory(
    @Payload() data: { 
      id: string; 
      updateCategoryDto: UpdateCategoryDto; 
      imageData?: Buffer; 
      imageName?: string 
    },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { id, updateCategoryDto, imageData, imageName } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category update - Partition: ${partition}, Offset: ${offset}, ID: ${id}`);

      let imageFile: Express.Multer.File | undefined;
      
      // Convert image data back to Multer file format if provided
      if (imageData && imageName) {
        imageFile = {
          buffer: imageData,
          originalname: imageName,
          mimetype: this.getMimeTypeFromExtension(imageName),
          size: imageData.length,
          fieldname: 'image',
          encoding: '7bit',
          destination: '',
          filename: imageName,
          path: '',
          stream: null
        } as Express.Multer.File;
      }

      const result = await this.categoriesService.update(id, updateCategoryDto, imageFile);
      
      this.logger.log(`Category updated successfully via Kafka: ${result.name} (${result._id})`);
      
      return {
        success: true,
        data: result,
        message: 'Category updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating category via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update category'
      };
    }
  }

  /**
   * Soft delete a category via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.DELETE)
  async removeCategory(
    @Payload() data: { id: string },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { id } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category deletion - Partition: ${partition}, Offset: ${offset}, ID: ${id}`);

      const result = await this.categoriesService.remove(id);
      
      this.logger.log(`Category deleted successfully via Kafka: ${id}`);
      
      return {
        success: true,
        data: result,
        message: 'Category deleted successfully'
      };
    } catch (error) {
      this.logger.error(`Error deleting category via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete category'
      };
    }
  }

  /**
   * Restore a soft-deleted category via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.RESTORE)
  async restoreCategory(
    @Payload() data: { id: string },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { id } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category restoration - Partition: ${partition}, Offset: ${offset}, ID: ${id}`);

      const result = await this.categoriesService.restore(id);
      
      this.logger.log(`Category restored successfully via Kafka: ${result.name} (${result._id})`);
      
      return {
        success: true,
        data: result,
        message: 'Category restored successfully'
      };
    } catch (error) {
      this.logger.error(`Error restoring category via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to restore category'
      };
    }
  }

  /**
   * Hard delete a category via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.HARD_DELETE)
  async hardDeleteCategory(
    @Payload() data: { id: string },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { id } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category hard deletion - Partition: ${partition}, Offset: ${offset}, ID: ${id}`);

      const result = await this.categoriesService.hardDelete(id);
      
      this.logger.log(`Category hard deleted successfully via Kafka: ${id}`);
      
      return {
        success: true,
        data: result,
        message: 'Category permanently deleted'
      };
    } catch (error) {
      this.logger.error(`Error hard deleting category via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to permanently delete category'
      };
    }
  }

  /**
   * Update category status via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.UPDATE_STATUS)
  async updateCategoryStatus(
    @Payload() data: { id: string; status: CategoryStatus },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { id, status } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category status update - Partition: ${partition}, Offset: ${offset}, ID: ${id}, Status: ${status}`);

      const result = await this.categoriesService.updateStatus(id, status);
      
      this.logger.log(`Category status updated successfully via Kafka: ${result.name} (${result._id}) -> ${status}`);
      
      return {
        success: true,
        data: result,
        message: 'Category status updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating category status via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update category status'
      };
    }
  }

  /**
   * Update sort order for multiple categories via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.UPDATE_SORT_ORDER)
  async updateCategorySortOrder(
    @Payload() data: { updates: { id: string; sortOrder: number }[] },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { updates } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category sort order update - Partition: ${partition}, Offset: ${offset}, Updates: ${updates.length}`);

      const result = await this.categoriesService.updateSortOrder(updates);
      
      this.logger.log(`Category sort order updated successfully via Kafka: ${result.updated} categories`);
      
      return {
        success: true,
        data: result,
        message: 'Category sort order updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating category sort order via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update category sort order'
      };
    }
  }

  /**
   * Find categories by gender via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.FIND_BY_GENDER)
  async findCategoriesByGender(
    @Payload() data: { gender: Gender },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { gender } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing find categories by gender - Partition: ${partition}, Offset: ${offset}, Gender: ${gender}`);

      const result = await this.categoriesService.findByGender(gender);
      
      this.logger.log(`Found ${result.length} categories by gender via Kafka`);
      
      return {
        success: true,
        data: result,
        message: 'Categories retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error finding categories by gender via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve categories by gender'
      };
    }
  }

  /**
   * Find categories with subcategories via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.FIND_WITH_SUBCATEGORIES)
  async findCategoriesWithSubcategories(
    @Payload() data: object,
    @Ctx() context: KafkaContext
  ) {
    try {
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing find categories with subcategories - Partition: ${partition}, Offset: ${offset}`);

      const result = await this.categoriesService.findWithSubcategories();
      
      this.logger.log(`Found ${result.length} categories with subcategories via Kafka`);
      
      return {
        success: true,
        data: result,
        message: 'Categories with subcategories retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error finding categories with subcategories via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve categories with subcategories'
      };
    }
  }

  /**
   * Bulk create categories via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.BULK_CREATE)
  async bulkCreateCategories(
    @Payload() data: { categories: CreateCategoryDto[] },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { categories } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing bulk category creation - Partition: ${partition}, Offset: ${offset}, Count: ${categories.length}`);

      const result = await this.categoriesService.bulkCreate(categories);
      
      this.logger.log(`Bulk created ${result.length} categories via Kafka`);
      
      return {
        success: true,
        data: result,
        message: 'Categories bulk created successfully'
      };
    } catch (error) {
      this.logger.error(`Error bulk creating categories via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to bulk create categories'
      };
    }
  }

  /**
   * Get category statistics via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.GET_STATS)
  async getCategoryStats(
    @Payload() data: object,
    @Ctx() context: KafkaContext
  ) {
    try {
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing get category stats - Partition: ${partition}, Offset: ${offset}`);

      const result = await this.categoriesService.getStats();
      
      this.logger.log(`Category stats retrieved successfully via Kafka`);
      
      return {
        success: true,
        data: result,
        message: 'Category statistics retrieved successfully'
      };
    } catch (error) {
      this.logger.error(`Error getting category stats via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to retrieve category statistics'
      };
    }
  }

  /**
   * Validate category name and slug via Kafka
   */
  @MessagePattern(KAFKA_TOPICS.CATEGORIES.VALIDATE)
  async validateCategory(
    @Payload() data: { name: string; slug: string; excludeId?: string },
    @Ctx() context: KafkaContext
  ) {
    try {
      const { name, slug, excludeId } = data;
      const partition = context.getPartition();
      const offset = context.getMessage().offset;
      
      this.logger.log(`Processing category validation - Partition: ${partition}, Offset: ${offset}, Name: ${name}, Slug: ${slug}`);

      const result = await this.categoriesService.validateCategory(name, slug, excludeId);
      
      this.logger.log(`Category validation completed via Kafka`);
      
      return {
        success: true,
        data: result,
        message: 'Category validation completed'
      };
    } catch (error) {
      this.logger.error(`Error validating category via Kafka: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message,
        message: 'Failed to validate category'
      };
    }
  }

  /**
   * Helper method to get MIME type from file extension
   */
  private getMimeTypeFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}