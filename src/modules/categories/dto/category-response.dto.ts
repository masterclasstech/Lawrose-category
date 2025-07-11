/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CategoryStatus } from "src/common/enums/category-status.enum";
import { Gender } from "src/common/enums/gender.enum";


export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category unique identifier',
    example: '507f1f77bcf86cd799439011'
  })
  _id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Electronics & Gadgets'
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'electronics-gadgets'
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All electronic devices, gadgets, and digital accessories'
  })
  description?: string;

  @ApiProperty({
    description: 'Category status',
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE
  })
  status: CategoryStatus;

  @ApiProperty({
    description: 'Applicable genders',
    enum: Gender,
    isArray: true,
    example: [Gender.MEN, Gender.WOMEN],
  })
  applicableGenders: Gender[];

  @ApiProperty({
    description: 'Has subcategories flag',
    example: true
  })
  hasSubcategories: boolean;

  @ApiProperty({
    description: 'Sort order for display',
    example: 10
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Additional metadata',
    type: 'object',
    example: { 
      color: '#007bff',
      featured: true,
      priority: 'high'
    },
    additionalProperties: true
  })
  metadata: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Category image URL',
    example: 'https://example.com/images/electronics-category.jpg'
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Icon identifier',
    example: 'fas fa-laptop'
  })
  icon?: string;

  @ApiProperty({
    description: 'Soft delete flag',
    example: false
  })
  isDeleted: boolean;

  @ApiPropertyOptional({
    description: 'Deletion timestamp (only present if deleted)',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00.000Z'
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Creation timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: 'string',
    format: 'date-time',
    example: '2024-01-15T10:30:00.000Z'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Associated subcategories (populated via virtual field)',
    type: 'array',
    items: { 
      type: 'object',
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' },
        slug: { type: 'string' }
      }
    }
  })
  subcategories?: any[];
}