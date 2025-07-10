/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CategoryStatus } from '../../../common/enums/category-status.enum';
import { CollectionType } from '../../../common/enums/collection-type.enum';
import { Gender } from '../../../common/enums/gender.enum';

export type CollectionDocument = Collection & Document;

@Schema({
  timestamps: true,
  collection: 'collections',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Collection {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ 
    type: String, 
    enum: CollectionType, 
    default: CollectionType.SEASONAL 
  })
  type: CollectionType;

  @Prop({ 
    type: String, 
    enum: CategoryStatus, 
    default: CategoryStatus.ACTIVE 
  })
  status: CategoryStatus;

  @Prop({ type: [String], enum: Gender, default: [] })
  applicableGenders: Gender[];

  @Prop({ type: Date, required: false })
  startDate?: Date;

  @Prop({ type: Date, required: false })
  endDate?: Date;

  @Prop({ required: true })
  year: number;

  @Prop({ required: false })
  season?: string; // e.g., 'Spring-Summer', 'Autumn-Winter'

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
  bannerImageUrl?: string;

  @Prop({ type: [String], default: [] })
  colors: string[]; // Collection color palette

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// Indexes for performance
CollectionSchema.index({ slug: 1 });
CollectionSchema.index({ status: 1 });
CollectionSchema.index({ type: 1 });
CollectionSchema.index({ year: 1 });
CollectionSchema.index({ applicableGenders: 1 });
CollectionSchema.index({ startDate: 1, endDate: 1 });
CollectionSchema.index({ sortOrder: 1 });
CollectionSchema.index({ isFeatured: 1 });
CollectionSchema.index({ createdAt: -1 });
CollectionSchema.index({ isDeleted: 1, status: 1 });