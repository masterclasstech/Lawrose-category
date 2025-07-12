/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  //UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseEnumPipe,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryQueryDto } from './dto/category-filter.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CategoryListResponseDto } from './dto/category-paginated.dto';
import { CategoryStatsDto, CategoryValidationDto } from './dto/category.statistics.dto';
import { CategoryStatus } from '../../common/enums/category-status.enum';
import { Gender } from '../../common/enums/gender.enum';
//import { AuthGuard } from '../../common/guards/auth.guard';
//import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { CacheInterceptor } from '../../common/interceptors/cache.interceptor';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@ApiTags('Categories')
@Controller('categories')
//@UseGuards(AuthGuard, RateLimitGuard)
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
@ApiExtraModels(
  CategoryResponseDto,
  CategoryListResponseDto,
  CategoryStatsDto,
  CategoryValidationDto
)
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new category',
    description: 'Creates a new category with optional image upload. Supports multipart/form-data for image uploads.'
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Category description' },
        status: { 
          type: 'string', 
          enum: Object.values(CategoryStatus),
          description: 'Category status'
        },
        applicableGenders: {
          type: 'array',
          items: { type: 'string', enum: Object.values(Gender) },
          description: 'Applicable genders'
        },
        sortOrder: { type: 'number', description: 'Sort order' },
        metadata: { type: 'object', description: 'Additional metadata' },
        icon: { type: 'string', description: 'Category icon' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Category image file'
        }
      },
      required: ['name', 'description', 'applicableGenders']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    schema: { $ref: getSchemaPath(CategoryResponseDto) }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Category name or slug already exists' })
  @ApiResponse({ status: 413, description: 'Image file too large' })
  @ApiResponse({ status: 415, description: 'Unsupported image file type' })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body(ValidationPipe) createCategoryDto: CreateCategoryDto,
    @UploadedFile() imageFile?: Express.Multer.File
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Creating category: ${createCategoryDto.name}`);
    return this.categoriesService.create(createCategoryDto, imageFile);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all categories',
    description: 'Retrieves all categories with optional filtering, sorting, and pagination'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)'
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in name and description'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: CategoryStatus,
    description: 'Filter by category status'
  })
  @ApiQuery({
    name: 'gender',
    required: false,
    enum: Gender,
    description: 'Filter by applicable gender'
  })
  @ApiQuery({
    name: 'hasSubcategories',
    required: false,
    type: Boolean,
    description: 'Filter by categories with/without subcategories'
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort field (name, createdAt, updatedAt, sortOrder)'
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (asc or desc)'
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted categories'
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: { $ref: getSchemaPath(CategoryListResponseDto) }
  })
  @UseInterceptors(CacheInterceptor)
  async findAll(@Query(ValidationPipe) queryDto: CategoryQueryDto): Promise<CategoryListResponseDto> {
    this.logger.log(`Retrieving categories with filters: ${JSON.stringify(queryDto)}`);
    return this.categoriesService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get category statistics',
    description: 'Retrieves comprehensive statistics about categories'
  })
  @ApiResponse({
    status: 200,
    description: 'Category statistics retrieved successfully',
    schema: { $ref: getSchemaPath(CategoryStatsDto) }
  })
  @UseInterceptors(CacheInterceptor)
  async getStats(): Promise<CategoryStatsDto> {
    this.logger.log('Retrieving category statistics');
    return this.categoriesService.getStats();
  }

  @Get('validate')
  @ApiOperation({ 
    summary: 'Validate category name and slug',
    description: 'Validates if a category name and slug are available'
  })
  @ApiQuery({ name: 'name', required: true, type: String, description: 'Category name to validate' })
  @ApiQuery({ name: 'slug', required: true, type: String, description: 'Category slug to validate' })
  @ApiQuery({ name: 'excludeId', required: false, type: String, description: 'Category ID to exclude from validation' })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: { $ref: getSchemaPath(CategoryValidationDto) }
  })
  @UseInterceptors(CacheInterceptor)
  async validateCategory(
    @Query('name') name: string,
    @Query('slug') slug: string,
    @Query('excludeId') excludeId?: string
  ): Promise<CategoryValidationDto> {
    this.logger.log(`Validating category: ${name}, slug: ${slug}`);
    return this.categoriesService.validateCategory(name, slug, excludeId);
  }

  @Get('gender/:gender')
  @ApiOperation({ 
    summary: 'Get categories by gender',
    description: 'Retrieves all categories applicable to a specific gender'
  })
  @ApiParam({
    name: 'gender',
    enum: Gender,
    description: 'Gender to filter by'
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CategoryResponseDto) }
    }
  })
  @UseInterceptors(CacheInterceptor)
  async findByGender(
    @Param('gender', new ParseEnumPipe(Gender)) gender: Gender
  ): Promise<CategoryResponseDto[]> {
    this.logger.log(`Retrieving categories for gender: ${gender}`);
    return this.categoriesService.findByGender(gender);
  }

  @Get('with-subcategories')
  @ApiOperation({ 
    summary: 'Get categories with subcategories',
    description: 'Retrieves all categories that have subcategories'
  })
  @ApiResponse({
    status: 200,
    description: 'Categories with subcategories retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CategoryResponseDto) }
    }
  })
  @UseInterceptors(CacheInterceptor)
  async findWithSubcategories(): Promise<CategoryResponseDto[]> {
    this.logger.log('Retrieving categories with subcategories');
    return this.categoriesService.findWithSubcategories();
  }

  @Get('slug/:slug')
  @ApiOperation({ 
    summary: 'Get category by slug',
    description: 'Retrieves a single category by its slug'
  })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Category slug'
  })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    type: Boolean,
    description: 'Include subcategories in response'
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    schema: { $ref: getSchemaPath(CategoryResponseDto) }
  })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseInterceptors(CacheInterceptor)
  async findBySlug(
    @Param('slug') slug: string,
    @Query('includeSubcategories') includeSubcategories?: boolean
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Retrieving category by slug: ${slug}`);
    return this.categoriesService.findBySlug(slug, includeSubcategories);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get category by ID',
    description: 'Retrieves a single category by its ID'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID'
  })
  @ApiQuery({
    name: 'includeSubcategories',
    required: false,
    type: Boolean,
    description: 'Include subcategories in response'
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    schema: { $ref: getSchemaPath(CategoryResponseDto) }
  })
  @ApiResponse({ status: 400, description: 'Invalid category ID format' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UseInterceptors(CacheInterceptor)
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('includeSubcategories') includeSubcategories?: boolean
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Retrieving category by ID: ${id}`);
    return this.categoriesService.findOne(id, includeSubcategories);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update category',
    description: 'Updates an existing category with optional image upload'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID'
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Category name' },
        description: { type: 'string', description: 'Category description' },
        status: { 
          type: 'string', 
          enum: Object.values(CategoryStatus),
          description: 'Category status'
        },
        applicableGenders: {
          type: 'array',
          items: { type: 'string', enum: Object.values(Gender) },
          description: 'Applicable genders'
        },
        sortOrder: { type: 'number', description: 'Sort order' },
        metadata: { type: 'object', description: 'Additional metadata' },
        icon: { type: 'string', description: 'Category icon' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Category image file'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    schema: { $ref: getSchemaPath(CategoryResponseDto) }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or category ID format' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category name or slug already exists' })
  @ApiResponse({ status: 413, description: 'Image file too large' })
  @ApiResponse({ status: 415, description: 'Unsupported image file type' })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(ValidationPipe) updateCategoryDto: UpdateCategoryDto,
    @UploadedFile() imageFile?: Express.Multer.File
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Updating category: ${id}`);
    return this.categoriesService.update(id, updateCategoryDto, imageFile);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Update category status',
    description: 'Updates the status of a specific category'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: Object.values(CategoryStatus),
          description: 'New category status'
        }
      },
      required: ['status']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Category status updated successfully',
    schema: { $ref: getSchemaPath(CategoryResponseDto) }
  })
  @ApiResponse({ status: 400, description: 'Invalid category ID format or status' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('status', new ParseEnumPipe(CategoryStatus)) status: CategoryStatus
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Updating category status: ${id} -> ${status}`);
    return this.categoriesService.updateStatus(id, status);
  }

  @Patch('sort-order')
  @ApiOperation({ 
    summary: 'Update sort order for multiple categories',
    description: 'Updates the sort order for multiple categories in a single request'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Category ID' },
              sortOrder: { type: 'number', description: 'New sort order' }
            },
            required: ['id', 'sortOrder']
          }
        }
      },
      required: ['updates']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Sort order updated successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        updated: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async updateSortOrder(
    @Body('updates', ValidationPipe) updates: { id: string; sortOrder: number }[]
  ): Promise<{ message: string; updated: number }> {
    this.logger.log(`Updating sort order for ${updates.length} categories`);
    return this.categoriesService.updateSortOrder(updates);
  }

  @Post('bulk')
  @ApiOperation({ 
    summary: 'Bulk create categories',
    description: 'Creates multiple categories in a single request'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: { $ref: getSchemaPath(CreateCategoryDto) }
        }
      },
      required: ['categories']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Categories created successfully',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(CategoryResponseDto) }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(
    @Body('categories', ValidationPipe) categories: CreateCategoryDto[]
  ): Promise<CategoryResponseDto[]> {
    this.logger.log(`Bulk creating ${categories.length} categories`);
    return this.categoriesService.bulkCreate(categories);
  }

  @Post(':id/restore')
  @ApiOperation({ 
    summary: 'Restore soft-deleted category',
    description: 'Restores a soft-deleted category'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Category restored successfully',
    schema: { $ref: getSchemaPath(CategoryResponseDto) }
  })
  @ApiResponse({ status: 400, description: 'Invalid category ID format' })
  @ApiResponse({ status: 404, description: 'Category not found or not deleted' })
  async restore(
    @Param('id', ParseObjectIdPipe) id: string
  ): Promise<CategoryResponseDto> {
    this.logger.log(`Restoring category: ${id}`);
    return this.categoriesService.restore(id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Soft delete category',
    description: 'Soft deletes a category (can be restored later)'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid category ID format' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async remove(
    @Param('id', ParseObjectIdPipe) id: string
  ): Promise<{ message: string }> {
    this.logger.log(`Soft deleting category: ${id}`);
    return this.categoriesService.remove(id);
  }

  @Delete(':id/permanent')
  @ApiOperation({ 
    summary: 'Permanently delete category',
    description: 'Permanently deletes a category (cannot be restored)'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Category ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Category permanently deleted',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid category ID format' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async hardDelete(
    @Param('id', ParseObjectIdPipe) id: string
  ): Promise<{ message: string }> {
    this.logger.log(`Permanently deleting category: ${id}`);
    return this.categoriesService.hardDelete(id);
  }
}