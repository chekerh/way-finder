import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VideoGeneration, VideoGenerationDocument } from './schemas/video-generation.schema';
import { MusicTrack, MusicTrackDocument } from './schemas/music-track.schema';
import { TravelPlan, TravelPlanDocument } from './schemas/travel-plan.schema';
import { VideoCompositionService } from './video-composition.service';
import {
  AiVideoGenerateRequest,
  AiVideoGenerateWithMediaRequest,
  AiVideoStatusResponse,
  AiVideoCheckStatusResponse,
  AiVideoStatusData,
  MusicTracksResponse,
  TravelPlansResponse,
  ImageUploadResponse,
  ImageUploadData,
} from './dto/video-generation.dto';

@Injectable()
export class VideoGenerationService {
  private readonly logger = new Logger(VideoGenerationService.name);

  constructor(
    @InjectModel(VideoGeneration.name)
    private videoGenerationModel: Model<VideoGenerationDocument>,
    @InjectModel(MusicTrack.name)
    private musicTrackModel: Model<MusicTrackDocument>,
    @InjectModel(TravelPlan.name)
    private travelPlanModel: Model<TravelPlanDocument>,
    private videoCompositionService: VideoCompositionService,
  ) {
    this.seedInitialData();
  }

  /**
   * Seed initial music tracks and travel plans
   */
  private async seedInitialData() {
    try {
      await this.seedMusicTracks();
      await this.seedTravelPlans();
    } catch (error) {
      this.logger.error('Error seeding initial data:', error);
    }
  }

  /**
   * Seed music tracks for video generation
   */
  private async seedMusicTracks() {
    try {
      const existingTracks = await this.musicTrackModel.countDocuments();
      if (existingTracks > 0) return; // Already seeded

      const musicTracks = [
        {
          name: 'Travel Adventure',
          genre: 'Electronic',
          duration: '3:45',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
        },
        {
          name: 'Peaceful Journey',
          genre: 'Ambient',
          duration: '4:12',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
        },
        {
          name: 'Urban Exploration',
          genre: 'Instrumental',
          duration: '3:28',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
        },
        {
          name: 'Nature Sounds',
          genre: 'World',
          duration: '5:01',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
        },
        {
          name: 'Epic Landscapes',
          genre: 'Cinematic',
          duration: '4:33',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Placeholder
        },
      ];

      await this.musicTrackModel.insertMany(musicTracks);
      this.logger.log(`Seeded ${musicTracks.length} music tracks`);
    } catch (error) {
      this.logger.error('Error seeding music tracks:', error);
    }
  }

  /**
   * Seed travel plans for AI suggestions
   */
  private async seedTravelPlans() {
    try {
      const existingPlans = await this.travelPlanModel.countDocuments();
      if (existingPlans > 0) return; // Already seeded

      const travelPlans = [
        {
          title: 'Mediterranean Escape',
          description: 'Explore the stunning coastlines and ancient cities of the Mediterranean',
          destinations: ['Santorini', 'Rome', 'Barcelona', 'Athens'],
          duration: '10 days',
          activities: ['Beach hopping', 'Historical tours', 'Wine tasting', 'Boat cruises'],
          videoPrompt: 'Beautiful Mediterranean islands with crystal blue waters, whitewashed buildings, and ancient ruins under sunny skies',
        },
        {
          title: 'Alpine Adventure',
          description: 'Experience the majesty of the Swiss Alps and surrounding mountains',
          destinations: ['Zurich', 'Interlaken', 'Zermatt', 'Geneva'],
          duration: '8 days',
          activities: ['Hiking', 'Cable car rides', 'Lake cruises', 'Cheese tasting'],
          videoPrompt: 'Majestic snow-capped mountains, pristine alpine lakes, charming mountain villages, and breathtaking valley views',
        },
        {
          title: 'Asian Discovery',
          description: 'Immerse yourself in the vibrant cultures and landscapes of Southeast Asia',
          destinations: ['Bangkok', 'Hanoi', 'Siem Reap', 'Singapore'],
          duration: '12 days',
          activities: ['Temple visits', 'Street food tours', 'Jungle trekking', 'Island hopping'],
          videoPrompt: 'Vibrant Asian cities with ornate temples, bustling markets, lush jungles, and peaceful beaches',
        },
        {
          title: 'Northern Lights Quest',
          description: 'Chase the Aurora Borealis through Scandinavia',
          destinations: ['Oslo', 'Tromsø', 'Reykjavik', 'Stockholm'],
          duration: '9 days',
          activities: ['Northern lights viewing', 'Dog sledding', 'Ice cave exploration', 'Hot springs'],
          videoPrompt: 'Magical northern lights dancing across starry winter skies, snow-covered landscapes, and cozy Nordic cabins',
        },
        {
          title: 'Safari Adventure',
          description: 'Witness the incredible wildlife of East Africa',
          destinations: ['Nairobi', 'Serengeti', 'Maasai Mara', 'Amboseli'],
          duration: '7 days',
          activities: ['Game drives', 'Hot air balloon safaris', 'Cultural visits', 'Photography'],
          videoPrompt: 'Vast savannas teeming with wildlife, majestic elephants, lions, and giraffes under the African sun',
        },
      ];

      await this.travelPlanModel.insertMany(travelPlans);
      this.logger.log(`Seeded ${travelPlans.length} travel plans`);
    } catch (error) {
      this.logger.error('Error seeding travel plans:', error);
    }
  }

  /**
   * Check if AI video generation service is available
   */
  async getAiVideoStatus(): Promise<AiVideoStatusResponse> {
    try {
      // TODO: Implement actual AI service availability check
      // For now, return available with some default suggestions
      const suggestions = [
        'A beautiful sunset over the mountains',
        'Exploring ancient ruins in the jungle',
        'A peaceful beach with crystal clear water',
        'City lights at night in a bustling metropolis',
        'Snow-capped peaks under a starry sky',
      ];

      return {
        available: true,
        suggestions,
      };
    } catch (error) {
      this.logger.error('Error checking AI video status:', error);
      return {
        available: false,
        message: 'Service temporarily unavailable',
      };
    }
  }

  /**
   * Get AI video generation suggestions
   */
  async getAiVideoSuggestions(): Promise<string[]> {
    // TODO: Implement dynamic suggestions based on user preferences/history
    return [
      'A scenic road trip through national parks',
      'Underwater exploration in coral reefs',
      'Cultural festival in a traditional village',
      'Hot air balloon ride at sunrise',
      'Hiking through autumn forests',
      'Safari adventure in the savanna',
      'Northern lights over frozen landscapes',
      'Medieval castle in misty mountains',
    ];
  }

  /**
   * Generate travel video from text prompt (creates video from stock images based on prompt)
   */
  async generateAiTravelVideo(
    userId: string,
    request: AiVideoGenerateRequest,
  ): Promise<any> {
    try {
      // Generate unique prediction ID
      const predictionId = this.generatePredictionId();

      // Generate image URLs based on prompt keywords
      const imageUrls = this.generateImagesFromPrompt(request.prompt);

      // Create video generation record
      const videoGeneration = new this.videoGenerationModel({
        userId,
        predictionId,
        originalPrompt: request.prompt,
        status: 'pending',
        progress: 0,
        images: imageUrls,
      });

      await videoGeneration.save();

      // Start async video generation
      this.processVideoGeneration(predictionId, imageUrls, undefined);

      return {
        success: true,
        data: {
          predictionId,
          status: 'pending',
          originalPrompt: request.prompt,
          enhancedPrompt: this.enhancePrompt(request.prompt),
          estimatedTime: '1-2 minutes',
        },
      };
    } catch (error) {
      this.logger.error('Error generating video:', error);
      return {
        success: false,
        message: 'Failed to start video generation',
      };
    }
  }

  /**
   * Generate AI travel video with media (images and music)
   */
  async generateAiTravelVideoWithMedia(
    userId: string,
    request: AiVideoGenerateWithMediaRequest,
  ): Promise<any> {
    try {
      const predictionId = this.generatePredictionId();

      // Use provided images or generate from prompt
      const imageUrls = request.images && request.images.length > 0
        ? request.images
        : this.generateImagesFromPrompt(request.prompt || 'travel destination');

      const videoGeneration = new this.videoGenerationModel({
        userId,
        predictionId,
        originalPrompt: request.prompt || '',
        status: 'pending',
        progress: 0,
        images: imageUrls,
        musicTrackId: request.musicTrackId,
      });

      await videoGeneration.save();

      // Start async video generation
      this.processVideoGeneration(predictionId, imageUrls, request.musicTrackId);

      return {
        success: true,
        data: {
          predictionId,
          status: 'pending',
          originalPrompt: request.prompt || '',
          enhancedPrompt: this.enhancePrompt(request.prompt || ''),
          musicTrack: request.musicTrackId ? await this.getMusicTrackById(request.musicTrackId) : null,
          estimatedTime: '3-5 minutes',
        },
      };
    } catch (error) {
      this.logger.error('Error generating AI video with media:', error);
      return {
        success: false,
        message: 'Failed to start video generation with media',
      };
    }
  }

  /**
   * Check status of video generation
   */
  async checkAiVideoStatus(predictionId: string): Promise<AiVideoCheckStatusResponse> {
    try {
      const videoGeneration = await this.videoGenerationModel.findOne({ predictionId });

      if (!videoGeneration) {
        return {
          success: false,
        };
      }

      const data: AiVideoStatusData = {
        predictionId,
        status: videoGeneration.status,
        videoUrl: videoGeneration.videoUrl,
        progress: videoGeneration.progress,
        error: videoGeneration.error,
        isComplete: videoGeneration.status === 'completed',
        isFailed: videoGeneration.status === 'failed',
      };

      return {
        success: true,
        data,
      };
    } catch (error) {
      this.logger.error('Error checking video status:', error);
      return {
        success: false,
      };
    }
  }

  /**
   * Cancel video generation
   */
  async cancelAiVideo(predictionId: string): Promise<any> {
    try {
      await this.videoGenerationModel.findOneAndUpdate(
        { predictionId },
        {
          status: 'cancelled',
          completedAt: new Date(),
        },
      );

      return {
        success: true,
        message: 'Video generation cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Error cancelling video generation:', error);
      return {
        success: false,
        message: 'Failed to cancel video generation',
      };
    }
  }

  /**
   * Get available music tracks
   */
  async getMusicTracks(): Promise<MusicTracksResponse> {
    try {
      const tracks = await this.musicTrackModel.find({ isActive: true });

      return {
        success: true,
        tracks: tracks.map(track => ({
          id: (track._id as any).toString(),
          name: track.name,
          genre: track.genre,
          duration: track.duration,
          previewUrl: track.previewUrl,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting music tracks:', error);
      return {
        success: false,
        tracks: [],
      };
    }
  }

  /**
   * Get travel plan suggestions
   */
  async getTravelPlans(): Promise<TravelPlansResponse> {
    try {
      const plans = await this.travelPlanModel.find({ isActive: true });

      return {
        success: true,
        plans: plans.map(plan => ({
          id: (plan._id as any).toString(),
          title: plan.title,
          description: plan.description,
          destinations: plan.destinations,
          duration: plan.duration,
          activities: plan.activities,
          videoPrompt: plan.videoPrompt,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting travel plans:', error);
      return {
        success: false,
        plans: [],
      };
    }
  }

  /**
   * Upload image for video generation
   */
  async uploadVideoImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<ImageUploadResponse> {
    try {
      // TODO: Implement actual image upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, simulate upload with a placeholder URL
      const imageUrl = `https://via.placeholder.com/800x600?text=${encodeURIComponent(file.originalname)}`;

      return {
        success: true,
        data: {
          url: imageUrl,
          originalName: file.originalname,
          size: file.size,
        },
      };
    } catch (error) {
      this.logger.error('Error uploading image:', error);
      return {
        success: false,
        message: 'Failed to upload image',
      };
    }
  }

  /**
   * Helper method to generate unique prediction ID
   */
  private generatePredictionId(): string {
    return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enhance prompt for better video generation
   */
  private enhancePrompt(prompt: string): string {
    // TODO: Implement AI-powered prompt enhancement
    // For now, add some basic enhancements
    const enhancements = [
      'with cinematic lighting',
      'in high definition',
      'with smooth camera movements',
      'featuring beautiful landscapes',
      'with professional cinematography',
    ];

    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    return `${prompt}, ${randomEnhancement}`;
  }

  /**
   * Get music track by ID
   */
  private async getMusicTrackById(id: string): Promise<any> {
    try {
      const track = await this.musicTrackModel.findById(id);
      if (track) {
        return {
          id: (track._id as any).toString(),
          name: track.name,
          genre: track.genre,
          duration: track.duration,
          previewUrl: track.previewUrl,
        };
      }
      return null;
    } catch (error) {
      this.logger.error('Error getting music track:', error);
      return null;
    }
  }

  /**
   * Process video generation using FFmpeg composition
   */
  private async processVideoGeneration(
    predictionId: string,
    imageUrls: string[],
    musicTrackId?: string
  ) {
    try {
      // Update to processing
      await this.videoGenerationModel.findOneAndUpdate(
        { predictionId },
        { status: 'processing', progress: 10 }
      );

      // Get music track URL if provided
      let musicUrl: string | undefined;
      if (musicTrackId) {
        const musicTrack = await this.musicTrackModel.findById(musicTrackId);
        if (musicTrack?.previewUrl) {
          musicUrl = musicTrack.previewUrl;
        }
      }

      // Update progress
      await this.videoGenerationModel.findOneAndUpdate(
        { predictionId },
        { progress: 30 }
      );

      // Generate video using composition service
      const videoUrl = await this.videoCompositionService.generateVideoFromImages(
        predictionId,
        imageUrls,
        musicUrl
      );

      // Update progress to completed
      await this.videoGenerationModel.findOneAndUpdate(
        { predictionId },
        {
          status: 'completed',
          progress: 100,
          videoUrl,
          completedAt: new Date(),
        }
      );

      this.logger.log(`Video generation completed for prediction: ${predictionId}`);
    } catch (error) {
      this.logger.error('Error in video generation:', error);
      await this.videoGenerationModel.findOneAndUpdate(
        { predictionId },
        {
          status: 'failed',
          error: error.message || 'Video generation failed',
          completedAt: new Date(),
        }
      );
    }
  }

  /**
   * Generate image URLs based on prompt keywords (for development)
   */
  private generateImagesFromPrompt(prompt: string): string[] {
    // Extract keywords from prompt
    const keywords = this.extractKeywords(prompt);

    // Generate placeholder image URLs based on keywords
    const images: string[] = [];
    const baseUrl = 'https://images.unsplash.com/photo-';

    // Travel-related image IDs (pre-selected for quality)
    const travelImages = [
      '1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80', // City lights
      '1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80', // Mountain landscape
      '1441974231533-cb5fe1af6227?w=800&h=600&fit=crop&q=80', // Beach sunset
      '1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80', // Forest path
      '1502920917128-1aa500764cbd?w=800&h=600&fit=crop&q=80', // Ancient ruins
      '1447757039982-b5a14badbf7?w=800&h=600&fit=crop&q=80',  // Hot air balloon
    ];

    // Return 3-5 images based on keywords
    const numImages = Math.min(Math.max(keywords.length, 3), 5);
    for (let i = 0; i < numImages; i++) {
      images.push(`${baseUrl}${travelImages[i % travelImages.length]}`);
    }

    return images;
  }

  /**
   * Extract keywords from prompt for image generation
   */
  private extractKeywords(prompt: string): string[] {
    const travelKeywords = [
      'beach', 'mountain', 'city', 'forest', 'desert', 'ocean', 'lake', 'river',
      'sunset', 'sunrise', 'night', 'snow', 'tropical', 'adventure', 'explore',
      'travel', 'vacation', 'holiday', 'destination', 'landscape', 'nature',
      'urban', 'village', 'island', 'canyon', 'waterfall', 'garden', 'park'
    ];

    const words = prompt.toLowerCase().split(/\s+/);
    return words.filter(word => travelKeywords.some(keyword =>
      word.includes(keyword) || keyword.includes(word)
    )).slice(0, 5); // Max 5 keywords
  }
}
