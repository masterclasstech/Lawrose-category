/* eslint-disable prettier/prettier */
import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery, UpdateQuery } from 'mongoose';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { CategoryQueryDto } from '../categories/dto/category-filter.dto';
import { CategoryStatus } from '../../common/enums/category-status.enum';
import { Gender } from '../../common/enums/gender.enum';
import { PaginationMeta, PaginationResult } from '../../common/interfaces/pagination.interface';
import { slugify } from '../../common/utils/slug.util';

@Injectable()
export class CategoriesRepository {
  private readonly logger = new Logger(CategoriesRepository.name);

  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    try {
      this.logger.log(`Creating category: ${createCategoryDto.name}`);
      
      // Generate slug from name
      const slug = slugify(createCategoryDto.name);
      
      // Check if category with same name or slug already exists
      const existingCategory = await this.categoryModel.findOne({
        $or: [
          { name: createCategoryDto.name },
          { slug: slug }
        ],
        isDeleted: false
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name or slug already exists');
      }

      const categoryData = {
        ...createCategoryDto,
        slug,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createdCategory = new this.categoryModel(categoryData);
      const savedCategory = await createdCategory.save();
      
      this.logger.log(`Category created successfully: ${savedCategory._id}`);
      return savedCategory.toObject();
    } catch (error) {
      this.logger.error(`Error creating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find all categories with pagination and filtering
   */
  async findAll(query: CategoryQueryDto): Promise<PaginationResult<Category>> {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      gender,
      hasSubcategories,
      search,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = query;

    // Build filter query
    const filter: FilterQuery<CategoryDocument> = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    if (gender) {
      filter.applicableGenders = { $in: [gender] };
    }

    if (hasSubcategories !== undefined) {
      filter.hasSubcategories = hasSubcategories;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await this.categoryModel.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Execute query
    const categories = await this.categoryModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('subcategories')
      .exec();

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };

    this.logger.log(`Found ${categories.length} categories`);
    return {
      data: categories.map(cat => cat.toObject()),
      pagination
    };
  } catch (error) {
    this.logger.error(`Error finding categories: ${error.message}`, error.stack);
    throw error;
  }
}

  /**
   * Find category by ID
   */
  async findById(id: string): Promise<Category> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid category ID format');
      }

      const category = await this.categoryModel
        .findOne({ _id: id, isDeleted: false })
        .populate('subcategories')
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Found category: ${category._id}`);
      return category.toObject();
    } catch (error) {
      this.logger.error(`Error finding category by ID: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string): Promise<Category> {
    try {
      const category = await this.categoryModel
        .findOne({ slug, isDeleted: false })
        .populate('subcategories')
        .exec();

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Found category by slug: ${slug}`);
      return category.toObject();
    } catch (error) {
      this.logger.error(`Error finding category by slug: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update category by ID
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid category ID format');
      }

      const updateData: UpdateQuery<CategoryDocument> = {
        ...updateCategoryDto,
        updatedAt: new Date()
      };

      // If name is being updated, regenerate slug
      if (updateCategoryDto.name) {
        const newSlug = slugify(updateCategoryDto.name);
        
        // Check if new slug conflicts with existing categories
        const existingCategory = await this.categoryModel.findOne({
          slug: newSlug,
          _id: { $ne: id },
          isDeleted: false
        });

        if (existingCategory) {
          throw new ConflictException('Category with this name already exists');
        }

        updateData.slug = newSlug;
      }

      const updatedCategory = await this.categoryModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          updateData,
          { new: true, runValidators: true }
        )
        .populate('subcategories')
        .exec();

      if (!updatedCategory) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Category updated successfully: ${updatedCategory._id}`);
      return updatedCategory.toObject();
    } catch (error) {
      this.logger.error(`Error updating category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Soft delete category by ID
   */
  async softDelete(id: string): Promise<Category> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid category ID format');
      }

      const deletedCategory = await this.categoryModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          { 
            isDeleted: true, 
            deletedAt: new Date(),
            updatedAt: new Date()
          },
          { new: true }
        )
        .exec();

      if (!deletedCategory) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Category soft deleted: ${deletedCategory._id}`);
      return deletedCategory.toObject();
    } catch (error) {
      this.logger.error(`Error soft deleting category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Hard delete category by ID (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid category ID format');
      }

      const result = await this.categoryModel.deleteOne({ _id: id }).exec();

      if (result.deletedCount === 0) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Category hard deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error hard deleting category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Restore soft deleted category
   */
  async restore(id: string): Promise<Category> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid category ID format');
      }

      const restoredCategory = await this.categoryModel
        .findOneAndUpdate(
          { _id: id, isDeleted: true },
          { 
            isDeleted: false, 
            deletedAt: null,
            updatedAt: new Date()
          },
          { new: true }
        )
        .exec();

      if (!restoredCategory) {
        throw new NotFoundException('Category not found or not deleted');
      }

      this.logger.log(`Category restored: ${restoredCategory._id}`);
      return restoredCategory.toObject();
    } catch (error) {
      this.logger.error(`Error restoring category: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update category status
   */
  async updateStatus(id: string, status: CategoryStatus): Promise<Category> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Invalid category ID format');
      }

      const updatedCategory = await this.categoryModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          { status, updatedAt: new Date() },
          { new: true }
        )
        .exec();

      if (!updatedCategory) {
        throw new NotFoundException('Category not found');
      }

      this.logger.log(`Category status updated: ${updatedCategory._id} -> ${status}`);
      return updatedCategory.toObject();
    } catch (error) {
      this.logger.error(`Error updating category status: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update sort order for multiple categories
   */
  async updateSortOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    try {
      const bulkOps = updates.map(update => ({
        updateOne: {
          filter: { _id: update.id, isDeleted: false },
          update: { sortOrder: update.sortOrder, updatedAt: new Date() }
        }
      }));

      await this.categoryModel.bulkWrite(bulkOps);
      this.logger.log(`Updated sort order for ${updates.length} categories`);
    } catch (error) {
      this.logger.error(`Error updating sort order: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find categories by gender
   */
  async findByGender(gender: Gender): Promise<Category[]> {
    try {
      const categories = await this.categoryModel
        .find({
          applicableGenders: { $in: [gender] },
          status: CategoryStatus.ACTIVE,
          isDeleted: false
        })
        .sort({ sortOrder: 1 })
        .exec();

      this.logger.log(`Found ${categories.length} categories for gender: ${gender}`);
      return categories.map(cat => cat.toObject());
    } catch (error) {
      this.logger.error(`Error finding categories by gender: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find categories with subcategories
   */
  async findWithSubcategories(): Promise<Category[]> {
    try {
      const categories = await this.categoryModel
        .find({
          hasSubcategories: true,
          status: CategoryStatus.ACTIVE,
          isDeleted: false
        })
        .populate('subcategories')
        .sort({ sortOrder: 1 })
        .exec();

      this.logger.log(`Found ${categories.length} categories with subcategories`);
      return categories.map(cat => cat.toObject());
    } catch (error) {
      this.logger.error(`Error finding categories with subcategories: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get category statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    deleted: number;
    withSubcategories: number;
  }> {
    try {
      const [total, active, inactive, deleted, withSubcategories] = await Promise.all([
        this.categoryModel.countDocuments({ isDeleted: false }),
        this.categoryModel.countDocuments({ status: CategoryStatus.ACTIVE, isDeleted: false }),
        this.categoryModel.countDocuments({ status: CategoryStatus.INACTIVE, isDeleted: false }),
        this.categoryModel.countDocuments({ isDeleted: true }),
        this.categoryModel.countDocuments({ hasSubcategories: true, isDeleted: false })
      ]);

      return {
        total,
        active,
        inactive,
        deleted,
        withSubcategories
      };
    } catch (error) {
      this.logger.error(`Error getting category stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check if category exists by name or slug
   */
  async exists(name: string, slug?: string): Promise<boolean> {
    try {
      const query: FilterQuery<CategoryDocument> = {
        isDeleted: false,
        $or: [{ name }]
      };

      if (slug) {
        query.$or.push({ slug });
      }

      const count = await this.categoryModel.countDocuments(query);
      return count > 0;
    } catch (error) {
      this.logger.error(`Error checking category existence: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Bulk create categories
   */
  async bulkCreate(categories: CreateCategoryDto[]): Promise<Category[]> {
    try {
      const categoriesWithSlugs = categories.map(cat => ({
        ...cat,
        slug: slugify(cat.name),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const createdCategories = await this.categoryModel.insertMany(categoriesWithSlugs);
      
      this.logger.log(`Bulk created ${createdCategories.length} categories`);
      return createdCategories.map(cat => cat.toObject());
    } catch (error) {
      this.logger.error(`Error bulk creating categories: ${error.message}`, error.stack);
      throw error;
    }
  }
          
        // Add these methods to your CategoriesRepository class

  /**
  * Get status breakdown for statistics
  */
  async getStatusBreakdown(): Promise<Record<CategoryStatus, number>> {
    const pipeline = [
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];

    const results = await this.categoryModel.aggregate(pipeline);
  
    // Initialize with all statuses at 0
    const breakdown: Record<CategoryStatus, number> = {
      [CategoryStatus.ACTIVE]: 0,
      [CategoryStatus.INACTIVE]: 0,
      [CategoryStatus.ARCHIVED]: 0
    };

    // Fill in actual counts
    results.forEach(result => {
      if (result._id in breakdown) {
        breakdown[result._id] = result.count;
      }
    });

    return breakdown;
  }

  /**
  * Get gender breakdown for statistics
  */
  async getGenderBreakdown(): Promise<Record<Gender, number>> {
    const pipeline = [
      { $match: { isDeleted: false } },
      { $unwind: '$applicableGenders' },
      {
        $group: {
          _id: '$applicableGenders',
          count: { $sum: 1 }
        }
      }
    ];

    const results = await this.categoryModel.aggregate(pipeline);
  
    // Initialize with all genders at 0
    const breakdown: Record<Gender, number> = {
      [Gender.MEN]: 0,
      [Gender.WOMEN]: 0,
      [Gender.UNISEX]: 0,
      //[Gender.KIDS]: 0
    };

    // Fill in actual counts
    results.forEach(result => {
      if (result._id in breakdown) {
        breakdown[result._id] = result.count;
      }
    });

    return breakdown;
  }

  /**
  * Get recently created categories
  */
  async getRecentlyCreated(limit: number = 5): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
  * Get recently updated categories
  */
  async getRecentlyUpdated(limit: number = 5): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }
}