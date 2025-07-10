/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { Gender } from '../../../common/enums/gender.enum';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  collection: 'categories',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Category {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ 
    type: String, 
    enum: CategoryStatus, 
    default: CategoryStatus.ACTIVE 
  })
  status: CategoryStatus;

  @Prop({ type: [String], enum: Gender, default: [] })
  applicableGenders: Gender[];

  @Prop({ default: false })
  hasSubcategories: boolean;

  @Prop({ default: 0 })
  sortOrder: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ 
    type: String, 
    required: false,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL format'
    }
  })
  imageUrl?: string;

  @Prop({ type: String, required: false })
  icon?: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Subcategory',
  localField: '_id',
  foreignField: 'categoryId'
});
// Indexes for performance
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1 });
CategorySchema.index({ applicableGenders: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ createdAt: -1 });
CategorySchema.index({ isDeleted: 1, status: 1 });
