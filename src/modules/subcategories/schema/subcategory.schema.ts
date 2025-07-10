/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { Gender } from '../../../common/enums/gender.enum';

export type SubcategoryDocument = Subcategory & Document;

@Schema({
  timestamps: true,
  collection: 'subcategories',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Subcategory {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true })
  slug: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Category', 
    required: true,
    index: true
  })
  categoryId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: CategoryStatus, 
    default: CategoryStatus.ACTIVE 
  })
  status: CategoryStatus;

  @Prop({ type: [String], enum: Gender, default: [] })
  applicableGenders: Gender[];

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

export const SubcategorySchema = SchemaFactory.createForClass(Subcategory);

// Virtual for category
SubcategorySchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Compound indexes
SubcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });
SubcategorySchema.index({ categoryId: 1, status: 1 });
SubcategorySchema.index({ categoryId: 1, sortOrder: 1 });
SubcategorySchema.index({ applicableGenders: 1 });
SubcategorySchema.index({ createdAt: -1 });
SubcategorySchema.index({ isDeleted: 1, status: 1 });
