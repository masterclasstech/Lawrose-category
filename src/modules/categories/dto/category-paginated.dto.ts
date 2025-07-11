/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { CategoryResponseDto } from "./category-response.dto";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";


export class CategoryListResponseDto {
  @ApiProperty({
    description: 'Array of categories',
    type: [CategoryResponseDto],
    isArray: true
  })
  @ValidateNested({ each: true })
  @Type(() => CategoryResponseDto)
  data: CategoryResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      total: { type: 'number', description: 'Total number of categories', example: 150 },
      page: { type: 'number', description: 'Current page number', example: 1 },
      limit: { type: 'number', description: 'Items per page', example: 20 },
      totalPages: { type: 'number', description: 'Total number of pages', example: 8 },
      hasNext: { type: 'boolean', description: 'Whether there is a next page', example: true },
      hasPrev: { type: 'boolean', description: 'Whether there is a previous page', example: false }
    }
  })
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}