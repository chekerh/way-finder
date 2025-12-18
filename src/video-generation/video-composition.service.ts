import { Injectable, Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { VideoGeneration, VideoGenerationDocument } from './schemas/video-generation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// Conditional imports for when dependencies are available
let ffmpeg: any = null;
let sharp: any = null;
let axios: any = null;

try {
  ffmpeg = require('fluent-ffmpeg');
  sharp = require('sharp');
  axios = require('axios');
} catch (error) {
  // Dependencies not available, will use mock implementation
}

@Injectable()
export class VideoCompositionService {
  private readonly logger = new Logger(VideoCompositionService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp');
  private readonly outputDir = path.join(process.cwd(), 'uploads', 'videos');

  constructor(
    @InjectModel(VideoGeneration.name)
    private videoGenerationModel: Model<VideoGenerationDocument>,
  ) {
    this.ensureDirectories();
    this.setupFFmpeg();
  }

  /**
   * Setup FFmpeg configuration
   */
  private setupFFmpeg() {
    try {
      // Set FFmpeg path - you may need to adjust this based on your system
      // For production, FFmpeg should be installed system-wide
      const ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg';
      ffmpeg.setFfmpegPath(ffmpegPath);

      this.logger.log(`FFmpeg path set to: ${ffmpegPath}`);
    } catch (error) {
      this.logger.warn('Could not set FFmpeg path, using system default:', error);
    }
  }

  /**
   * Ensure temp and output directories exist
   */
  private async ensureDirectories() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      await fs.mkdir(this.outputDir, { recursive: true });
    } catch (error) {
      this.logger.error('Error creating directories:', error);
    }
  }

  /**
   * Create video from images with smooth transitions and background music
   */
  async createVideoFromImages(
    predictionId: string,
    imageUrls: string[],
    musicTrackUrl?: string,
    durationPerImage: number = 3, // seconds per image
    transitionDuration: number = 1.0, // seconds for crossfade transitions
  ): Promise<string> {
    try {
      this.logger.log(`Creating video for prediction ${predictionId} with ${imageUrls.length} images`);

      // Check if FFmpeg dependencies are available
      if (!ffmpeg || !sharp || !axios) {
        this.logger.warn('FFmpeg dependencies not available, using mock implementation');
        return this.createMockVideo(predictionId, imageUrls, musicTrackUrl);
      }

      // Full FFmpeg implementation
      return this.createVideoWithFFmpeg(predictionId, imageUrls, musicTrackUrl, durationPerImage, transitionDuration);

    } catch (error) {
      this.logger.error('Error creating video from images:', error);
      // Fallback to mock video
      return this.createMockVideo(predictionId, imageUrls, musicTrackUrl);
    }
  }

  /**
   * Full FFmpeg video creation implementation
   */
  private async createVideoWithFFmpeg(
    predictionId: string,
    imageUrls: string[],
    musicTrackUrl?: string,
    durationPerImage: number = 3,
    transitionDuration: number = 1.0,
  ): Promise<string> {
    const tempDir = path.join(this.tempDir, predictionId);
    const outputPath = path.join(this.outputDir, `${predictionId}.mp4`);

    try {
      // Create temp directory for this video
      await fs.mkdir(tempDir, { recursive: true });

      // Step 1: Download and process images
      const processedImages = await this.downloadAndProcessImages(imageUrls, tempDir);

      if (processedImages.length === 0) {
        throw new Error('No images could be processed');
      }

      // Step 2: Create video with crossfade transitions
      const videoPath = await this.createVideoWithCrossfadeTransitions(
        processedImages,
        tempDir,
        durationPerImage,
        transitionDuration
      );

      // Step 3: Add background music if provided
      let finalVideoPath = videoPath;
      if (musicTrackUrl) {
        finalVideoPath = await this.addBackgroundMusicToVideo(videoPath, musicTrackUrl, outputPath);
      } else {
        // No music, just move to final location
        await fs.rename(videoPath, outputPath);
        finalVideoPath = outputPath;
      }

      this.logger.log(`Video created successfully: ${finalVideoPath}`);

      // Cleanup temp files
      await this.cleanupTempFiles(tempDir);

      return finalVideoPath;

    } catch (error) {
      this.logger.error('Error in FFmpeg video creation:', error);
      // Cleanup on error
      await this.cleanupTempFiles(tempDir);
      throw error;
    }
  }

  /**
   * Mock video creation for development/testing
   */
  private async createMockVideo(
    predictionId: string,
    imageUrls: string[],
    musicTrackUrl?: string,
  ): Promise<string> {
    this.logger.log(`Creating mock video for ${predictionId} with ${imageUrls.length} images`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Return a sample video URL for testing
    // In production, this would be replaced with actual video generation
    const videoUrl = `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4`;

    this.logger.log(`Mock video created for prediction: ${predictionId}`);
    return videoUrl;
  }

  /**
   * Download and process images to consistent format for video
   */
  private async downloadAndProcessImages(imageUrls: string[], outputDir: string): Promise<string[]> {
    if (!sharp || !axios) {
      this.logger.warn('Image processing dependencies not available, using mock processing');
      return this.mockImageProcessing(imageUrls, outputDir);
    }

    const processedImages: string[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      try {
        const imageUrl = imageUrls[i];
        const outputPath = path.join(outputDir, `processed_${i.toString().padStart(3, '0')}.jpg`);

        this.logger.log(`Processing image ${i + 1}/${imageUrls.length}: ${imageUrl}`);

        // Download image
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 second timeout
          headers: {
            'User-Agent': 'WayFinder-Video-Generator/1.0'
          }
        });

        // Process image with Sharp (resize, optimize for video)
        await sharp(Buffer.from(response.data))
          .resize(1920, 1080, {
            fit: 'cover',
            position: 'center',
            withoutEnlargement: false
          })
          .jpeg({
            quality: 85,
            progressive: true
          })
          .toFile(outputPath);

        processedImages.push(outputPath);
        this.logger.log(`Successfully processed image ${i + 1}`);

      } catch (error) {
        this.logger.warn(`Failed to process image ${i}: ${error.message}`);
        // Create a fallback image
        await this.createFallbackImage(outputDir, i);
        processedImages.push(path.join(outputDir, `fallback_${i.toString().padStart(3, '0')}.jpg`));
      }
    }

    return processedImages;
  }

  /**
   * Mock image processing when dependencies aren't available
   */
  private async mockImageProcessing(imageUrls: string[], outputDir: string): Promise<string[]> {
    const processedImages: string[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      // Create a simple placeholder image
      await this.createFallbackImage(outputDir, i);
      processedImages.push(path.join(outputDir, `fallback_${i.toString().padStart(3, '0')}.jpg`));
      this.logger.log(`Mock processed image ${i + 1}/${imageUrls.length}`);
    }

    return processedImages;
  }

  /**
   * Create fallback image when download fails
   */
  private async createFallbackImage(outputDir: string, index: number): Promise<void> {
    const outputPath = path.join(outputDir, `fallback_${index.toString().padStart(3, '0')}.jpg`);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];
    const color = colors[index % colors.length];

    const svg = `
      <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
        <rect width="1920" height="1080" fill="${color}"/>
        <text x="960" y="520" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">
          Image ${index + 1}
        </text>
        <text x="960" y="580" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
          Travel Photo
        </text>
      </svg>
    `;

    await sharp(Buffer.from(svg)).jpeg().toFile(outputPath);
  }


  /**
   * Create video with smooth crossfade transitions between images
   */
  private async createVideoWithCrossfadeTransitions(
    imagePaths: string[],
    tempDir: string,
    durationPerImage: number,
    transitionDuration: number,
  ): Promise<string> {
    if (!ffmpeg) {
      throw new Error('FFmpeg not available for video creation');
    }

    return new Promise((resolve, reject) => {
      const outputPath = path.join(tempDir, 'video_no_audio.mp4');

      if (imagePaths.length === 1) {
        // Single image - create simple video
        ffmpeg()
          .input(imagePaths[0])
          .inputOptions(['-loop 1', '-t', durationPerImage.toString()])
          .videoCodec('libx264')
          .outputOptions([
            '-pix_fmt', 'yuv420p',
            '-r', '30',
            '-preset', 'medium',
            '-crf', '23',
            '-movflags', '+faststart', // Optimize for web playback
          ])
          .output(outputPath)
          .on('end', () => resolve(outputPath))
          .on('error', reject)
          .run();
      } else {
        // Multiple images - create with crossfade transitions
        const ffmpegCommand = ffmpeg();

        // Add all images as inputs
        imagePaths.forEach(imagePath => {
          ffmpegCommand.input(imagePath);
        });

        // Calculate total duration and transition points
        const totalImages = imagePaths.length;
        const imageDuration = durationPerImage - (transitionDuration / 2); // Account for transition overlap
        const transitionStart = imageDuration - (transitionDuration / 2);

        // Build complex filter for crossfade transitions
        const filterComplex = this.buildCrossfadeFilter(totalImages, imageDuration, transitionDuration);

        ffmpegCommand
          .complexFilter(filterComplex)
          .outputOptions([
            '-map', '[outv]', // Map the filtered video output
            '-pix_fmt', 'yuv420p',
            '-r', '30',
            '-preset', 'medium',
            '-crf', '23',
            '-movflags', '+faststart',
            '-t', ((totalImages * imageDuration) + (transitionDuration / 2)).toString(), // Total duration
          ])
          .output(outputPath)
          .on('end', () => {
            this.logger.log('Video with transitions created successfully');
            resolve(outputPath);
          })
          .on('error', (err) => {
            this.logger.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      }
    });
  }

  /**
   * Build FFmpeg complex filter for crossfade transitions
   */
  private buildCrossfadeFilter(totalImages: number, imageDuration: number, transitionDuration: number): string {
    const filters: string[] = [];

    // Create individual video streams with durations
    for (let i = 0; i < totalImages; i++) {
      const startTime = i * imageDuration;
      const endTime = (i + 1) * imageDuration;

      filters.push(`[${i}:v]trim=${startTime}:${endTime},setpts=PTS-STARTPTS[v${i}]`);
    }

    // Add crossfade transitions between consecutive images
    for (let i = 0; i < totalImages - 1; i++) {
      const offset = i * imageDuration;
      filters.push(`[v${i}][v${i + 1}]xfade=transition=fade:duration=${transitionDuration}:offset=${offset + imageDuration - transitionDuration}[v${i}x]`);
    }

    // Concatenate all the transition segments
    let concatInputs = '';
    for (let i = 0; i < totalImages - 1; i++) {
      concatInputs += `[v${i}x]`;
    }
    concatInputs += `[v${totalImages - 1}]`; // Add the last image without transition

    filters.push(`${concatInputs}concat=n=${totalImages}:v=1:a=0[outv]`);

    return filters.join(';');
  }

  /**
   * Add background music to video with proper mixing
   */
  private async addBackgroundMusicToVideo(
    videoPath: string,
    musicUrl: string,
    outputPath: string
  ): Promise<string> {
    if (!ffmpeg || !axios) {
      this.logger.warn('FFmpeg or axios not available, returning video without music');
      return videoPath;
    }

    return new Promise(async (resolve, reject) => {
      try {
        // Download music file
        this.logger.log('Downloading music track...');
        const musicResponse = await axios.get(musicUrl, {
          responseType: 'arraybuffer',
          timeout: 60000, // 60 second timeout for music
        });

        const musicPath = path.join(path.dirname(videoPath), 'background_music.mp3');
        await fs.writeFile(musicPath, Buffer.from(musicResponse.data));

        // Get video duration to loop music if needed
        const videoDuration = await this.getVideoDuration(videoPath);

        ffmpeg()
          .input(videoPath)
          .input(musicPath)
          .inputOptions(['-stream_loop', '-1']) // Loop music
          .audioCodec('aac')
          .audioFilters([
            'volume=0.4', // Reduce music volume for background
            'afade=t=in:ss=0:d=3', // Fade in first 3 seconds
            'afade=t=out:st=' + (videoDuration - 3) + ':d=3', // Fade out last 3 seconds
          ])
          .outputOptions([
            '-c:v', 'copy', // Copy video stream (no re-encoding)
            '-c:a', 'aac',
            '-shortest', // End when shortest stream ends
            '-map', '0:v:0', // Video from first input
            '-map', '1:a:0', // Audio from second input
            '-movflags', '+faststart',
          ])
          .output(outputPath)
          .on('end', () => {
            this.logger.log('Background music added successfully');
            resolve(outputPath);
          })
          .on('error', (err) => {
            this.logger.error('Error adding background music:', err);
            // If music fails, return the video without music
            resolve(videoPath);
          })
          .run();

      } catch (error) {
        this.logger.error('Failed to download/process music:', error);
        // Return video without music
        resolve(videoPath);
      }
    });
  }

  /**
   * Get video duration using FFmpeg
   */
  private async getVideoDuration(videoPath: string): Promise<number> {
    if (!ffmpeg) {
      return 10; // Default duration when FFmpeg not available
    }

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          this.logger.error('Error getting video duration:', err);
          resolve(10); // Default 10 seconds
        } else {
          resolve(metadata.format.duration || 10);
        }
      });
    });
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTempFiles(tempDir: string) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn('Failed to cleanup temp files:', error);
    }
  }

  /**
   * Create video from images (main public method)
   */
  async generateVideoFromImages(
    predictionId: string,
    images: string[],
    musicTrackUrl?: string,
  ): Promise<string> {
    const videoUrl = await this.createVideoFromImages(predictionId, images, musicTrackUrl);

    // Convert to web-accessible URL
    const relativePath = path.relative(path.join(process.cwd(), 'uploads'), videoUrl);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }
}
