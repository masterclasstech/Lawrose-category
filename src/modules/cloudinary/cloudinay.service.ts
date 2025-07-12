/* eslint-disable prettier/prettier */
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_NAME'),
      api_key: this.configService.get('CLOUDINARY_KEY'),
      api_secret: this.configService.get('CLOUDINARY_SECRET'),
    });
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'categories'
  ): Promise<UploadApiResponse> {
    try {
      this.logger.log(`Uploading image to Cloudinary folder: ${folder}`);
      
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            format: 'webp', // Convert to WebP for better compression
            quality: 'auto:best',
            fetch_format: 'auto',
            transformation: [
              {
                width: 800,
                height: 600,
                crop: 'limit',
                quality: 'auto:best'
              }
            ]
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              this.logger.error(`Cloudinary upload error: ${error.message}`, error);
              reject(new BadRequestException(`Image upload failed: ${error.message}`));
            } else if (result) {
              this.logger.log(`Image uploaded successfully: ${result.public_id}`);
              resolve(result);
            } else {
              reject(new BadRequestException('Unknown error occurred during image upload'));
            }
          }
        ).end(file.buffer);
      });
    } catch (error) {
      this.logger.error(`Error uploading image: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<any> {
    try {
      this.logger.log(`Deleting image from Cloudinary: ${publicId}`);
      
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        this.logger.log(`Image deleted successfully: ${publicId}`);
        return result;
      } else {
        this.logger.warn(`Failed to delete image: ${publicId}, result: ${result.result}`);
        return result;
      }
    } catch (error) {
      this.logger.error(`Error deleting image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update image in Cloudinary (delete old, upload new)
   */
  async updateImage(
    file: Express.Multer.File,
    oldPublicId?: string,
    folder: string = 'categories'
  ): Promise<UploadApiResponse> {
    try {
      // Upload new image first
      const uploadResult = await this.uploadImage(file, folder);
      
      // Delete old image if it exists
      if (oldPublicId) {
        await this.deleteImage(oldPublicId);
      }
      
      return uploadResult;
    } catch (error) {
      this.logger.error(`Error updating image: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   */
  extractPublicId(imageUrl: string): string | null {
    try {
      const regex = /\/([^\/]+)\.[^.]+$/;
      const match = imageUrl.match(regex);
      return match ? match[1] : null;
    } catch {
      this.logger.warn(`Failed to extract public ID from URL: ${imageUrl}`);
      return null;
    }
  }

  /**
   * Generate optimized image URL
   */
  generateOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  }): string {
    const { width = 800, height = 600, crop = 'limit', quality = 'auto:best' } = options || {};
    
    return cloudinary.url(publicId, {
      width,
      height,
      crop,
      quality,
      fetch_format: 'auto',
      secure: true
    });
  }
}