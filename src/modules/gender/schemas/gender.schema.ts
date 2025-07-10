/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender as GenderEnum } from '../../../common/enums/gender.enum';
import { CategoryStatus } from '../../../common/enums/category-status.enum';

export type GenderDocument = GenderEntity & Document;

@Schema({
  timestamps: true,
  collection: 'genders',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class GenderEntity {
  @Prop({ 
    required: true, 
    unique: true, 
    type: String, 
    enum: GenderEnum 
  })
  name: GenderEnum;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ required: true, trim: true })
  displayName: string; // e.g., 'Men', 'Women'

  @Prop({ 
    type: String, 
    enum: CategoryStatus, 
    default: CategoryStatus.ACTIVE 
  })
  status: CategoryStatus;

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

  @Prop({ type: String, required: false })
  colorTheme?: string; // Hex color for UI theming

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Date, required: false })
  deletedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const GenderSchema = SchemaFactory.createForClass(GenderEntity);

// Indexes for performance
GenderSchema.index({ slug: 1 });
GenderSchema.index({ status: 1 });
GenderSchema.index({ sortOrder: 1 });
GenderSchema.index({ createdAt: -1 });
GenderSchema.index({ isDeleted: 1, status: 1 });

// Pre-save middleware to generate slug
GenderSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});