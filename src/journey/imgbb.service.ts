import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import * as fs from 'fs';

interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

@Injectable()
export class ImgBBService {
  private readonly logger = new Logger(ImgBBService.name);
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.imgbb.com/1/upload';

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.IMGBB_API_KEY || '';
    if (!this.apiKey) {
      this.logger.warn('IMGBB_API_KEY not configured. Image uploads will fail.');
    }
  }

  /**
   * Upload a single image file to ImgBB
   * @param filePath - Path to the image file
   * @param fileName - Optional custom filename
   * @returns The ImgBB URL of the uploaded image
   */
  async uploadImage(filePath: string, fileName?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('IMGBB_API_KEY is not configured');
    }

    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(filePath);
      
      formData.append('key', this.apiKey);
      formData.append('image', fileStream, {
        filename: fileName || filePath.split('/').pop() || 'image.jpg',
        contentType: 'image/jpeg',
      });

      const response = await firstValueFrom(
        this.httpService.post<ImgBBResponse>(this.apiUrl, formData, {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      );

      if (response.data.success && response.data.data?.url) {
        this.logger.log(`Image uploaded successfully: ${response.data.data.url}`);
        return response.data.data.url;
      } else {
        throw new Error(`ImgBB upload failed: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload image to ImgBB: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload multiple images in parallel
   * @param filePaths - Array of file paths
   * @returns Array of ImgBB URLs
   */
  async uploadImages(filePaths: string[]): Promise<string[]> {
    if (!this.apiKey) {
      throw new Error('IMGBB_API_KEY is not configured');
    }

    try {
      // Upload images in parallel for better performance
      const uploadPromises = filePaths.map((filePath, index) =>
        this.uploadImage(filePath).catch((error) => {
          this.logger.error(`Failed to upload image ${index + 1}/${filePaths.length}: ${error.message}`);
          throw error;
        }),
      );

      const urls = await Promise.all(uploadPromises);
      this.logger.log(`Successfully uploaded ${urls.length} images to ImgBB`);
      return urls;
    } catch (error) {
      this.logger.error(`Failed to upload images batch: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Upload image from buffer (useful for in-memory processing)
   * @param buffer - Image buffer
   * @param fileName - Filename
   * @param mimeType - MIME type (e.g., 'image/jpeg')
   * @returns The ImgBB URL of the uploaded image
   */
  async uploadImageFromBuffer(
    buffer: Buffer,
    fileName: string,
    mimeType: string = 'image/jpeg',
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('IMGBB_API_KEY is not configured');
    }

    try {
      const formData = new FormData();
      formData.append('key', this.apiKey);
      formData.append('image', buffer, {
        filename: fileName,
        contentType: mimeType,
      });

      const response = await firstValueFrom(
        this.httpService.post<ImgBBResponse>(this.apiUrl, formData, {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }),
      );

      if (response.data.success && response.data.data?.url) {
        this.logger.log(`Image uploaded successfully from buffer: ${response.data.data.url}`);
        return response.data.data.url;
      } else {
        throw new Error(`ImgBB upload failed: ${JSON.stringify(response.data)}`);
      }
    } catch (error) {
      this.logger.error(`Failed to upload image from buffer to ImgBB: ${error.message}`, error.stack);
      throw error;
    }
  }
}

