/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsOptional, MinLength, ValidateNested } from "class-validator";
import { CategoryStatus } from "src/common/enums/category-status.enum";
import { UpdateCategoryDto } from "./update-category.dto";
import { Type } from "class-transformer";


export class BulkCategoryOperationDto {
  @ApiProperty({
    description: 'Array of category IDs to operate on',
    type: [String],
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013']
  })
  @IsArray()
  @IsMongoId({ each: true })
  @MinLength(1, { each: true })
  ids: string[];
}

export class BulkUpdateCategoryDto extends BulkCategoryOperationDto {
  @ApiProperty({
    description: 'Updates to apply to all specified categories',
    type: UpdateCategoryDto
  })
  @ValidateNested()
  @Type(() => UpdateCategoryDto)
  updates: UpdateCategoryDto;
}

export class BulkDeleteCategoryDto extends BulkCategoryOperationDto {
  @ApiPropertyOptional({
    description: 'Whether to perform hard delete (permanent) or soft delete',
    default: false,
    example: false
  })
  @IsOptional()
  @IsBoolean()
  hardDelete?: boolean;
}

export class BulkStatusUpdateDto extends BulkCategoryOperationDto {
  @ApiProperty({
    description: 'New status to apply to all specified categories',
    enum: CategoryStatus,
    example: CategoryStatus.INACTIVE
  })
  @IsEnum(CategoryStatus)
  status: CategoryStatus;
}