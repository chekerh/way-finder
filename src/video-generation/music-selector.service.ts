import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { promisify } from 'util';

interface PixabayMusicResponse {
  hits: Array<{
    id: number;
    pageURL: string;
    type: string;
    tags: string;
    duration: number;
    picture_id: string;
    videos: {
      tiny: { url: string; width: number; height: number; size: number };
      small: { url: string; width: number; height: number; size: number };
      medium: { url: string; width: number; height: number; size: number };
      large: { url: string; width: number; height: number; size: number };
    };
    views: number;
    downloads: number;
    likes: number;
  }>;
  total: number;
}

@Injectable()
export class MusicSelectorService {
  private readonly logger = new Logger(MusicSelectorService.name);
  private readonly pixabayApiKey: string;
  private readonly musicCacheDir: string;

  constructor(private readonly httpService: HttpService) {
    this.pixabayApiKey = process.env.PIXABAY_API_KEY || '';
    this.musicCacheDir = path.join(process.cwd(), 'uploads', 'music');
    
    // Create music cache directory if it doesn't exist
    if (!fs.existsSync(this.musicCacheDir)) {
      fs.mkdirSync(this.musicCacheDir, { recursive: true });
    }
  }

  /**
   * Select and download music for a destination
   * @param destination - The destination name (e.g., "Paris", "Beach")
   * @param tags - Optional tags to help select music
   * @param duration - Desired duration in seconds (for trimming/looping)
   * @returns Path to the downloaded music file
   */
  async selectAndDownloadMusic(
    destination: string,
    tags: string[] = [],
    duration: number = 60,
  ): Promise<{ filePath: string; source: string; originalUrl: string }> {
    try {
      // Try Pixabay first
      if (this.pixabayApiKey) {
        const pixabayResult = await this.fetchFromPixabay(destination, tags, duration);
        if (pixabayResult) {
          return pixabayResult;
        }
      }

      // Fallback: Use generic travel music from Pixabay (public domain)
      this.logger.warn(`Pixabay API key not configured or no results. Using fallback music.`);
      return await this.fetchFallbackMusic(destination, duration);
    } catch (error) {
      this.logger.error(`Error selecting music: ${error.message}`, error.stack);
      // Return a silent audio file or throw based on requirements
      throw new Error(`Failed to select music: ${error.message}`);
    }
  }

  /**
   * Fetch music from Pixabay API
   */
  private async fetchFromPixabay(
    destination: string,
    tags: string[],
    duration: number,
  ): Promise<{ filePath: string; source: string; originalUrl: string } | null> {
    try {
      // Build search query based on destination and tags
      const searchTerms = this.buildSearchQuery(destination, tags);
      
      const url = `https://pixabay.com/api/videos/?key=${this.pixabayApiKey}&q=${encodeURIComponent(searchTerms)}&video_type=music&category=music&per_page=10&safesearch=true`;
      
      this.logger.log(`Fetching music from Pixabay with query: ${searchTerms}`);
      
      const response = await firstValueFrom(
        this.httpService.get<PixabayMusicResponse>(url, {
          timeout: 10000,
        }),
      );

      if (!response.data.hits || response.data.hits.length === 0) {
        this.logger.warn('No music found on Pixabay for query: ' + searchTerms);
        return null;
      }

      // Select the best match (first result with medium quality)
      const selectedMusic = response.data.hits[0];
      const videoUrl = selectedMusic.videos.medium?.url || selectedMusic.videos.small?.url;

      if (!videoUrl) {
        this.logger.warn('Selected music has no video URL');
        return null;
      }

      // Download the music file
      const filePath = await this.downloadMusicFile(videoUrl, destination, 'pixabay');
      
      return {
        filePath,
        source: 'pixabay',
        originalUrl: videoUrl,
      };
    } catch (error) {
      this.logger.error(`Pixabay API error: ${error.message}`);
      return null;
    }
  }

  /**
   * Build search query from destination and tags
   */
  private buildSearchQuery(destination: string, tags: string[]): string {
    // Map destinations to music moods
    const destinationMoods: Record<string, string> = {
      paris: 'romantic',
      beach: 'relaxing',
      mountain: 'epic',
      berlin: 'electronic',
      tokyo: 'energetic',
      newyork: 'urban',
    };

    const lowerDestination = destination.toLowerCase();
    let mood = 'travel';

    // Check for mood keywords in destination
    for (const [key, value] of Object.entries(destinationMoods)) {
      if (lowerDestination.includes(key)) {
        mood = value;
        break;
      }
    }

    // Combine mood with tags
    const searchTerms = [mood, 'travel', 'cinematic'];
    if (tags.length > 0) {
      searchTerms.push(...tags.slice(0, 2));
    }

    return searchTerms.join(' ');
  }

  /**
   * Fetch fallback music (generic travel music)
   */
  private async fetchFallbackMusic(
    destination: string,
    duration: number,
  ): Promise<{ filePath: string; source: string; originalUrl: string }> {
    // Use a generic travel music search
    const searchTerms = 'travel cinematic music';
    const url = `https://pixabay.com/api/videos/?key=${this.pixabayApiKey || 'public'}&q=${encodeURIComponent(searchTerms)}&video_type=music&category=music&per_page=1&safesearch=true`;

    try {
      const response = await firstValueFrom(
        this.httpService.get<PixabayMusicResponse>(url, {
          timeout: 10000,
        }),
      );

      if (response.data.hits && response.data.hits.length > 0) {
        const videoUrl = response.data.hits[0].videos.medium?.url || response.data.hits[0].videos.small?.url;
        if (videoUrl) {
          const filePath = await this.downloadMusicFile(videoUrl, destination, 'pixabay_fallback');
          return {
            filePath,
            source: 'pixabay_fallback',
            originalUrl: videoUrl,
          };
        }
      }
    } catch (error) {
      this.logger.warn(`Fallback music fetch failed: ${error.message}`);
    }

    // If all else fails, throw error (or return silent audio)
    throw new Error('Unable to fetch music from any source');
  }

  /**
   * Download music file from URL
   */
  private async downloadMusicFile(
    url: string,
    destination: string,
    source: string,
  ): Promise<string> {
    const fileName = `music_${destination.replace(/\s+/g, '_')}_${Date.now()}_${source}.mp4`;
    const filePath = path.join(this.musicCacheDir, fileName);

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download music: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          this.logger.log(`Music downloaded to: ${filePath}`);
          resolve(filePath);
        });
      }).on('error', (error) => {
        fs.unlinkSync(filePath); // Delete the file on error
        reject(error);
      });
    });
  }

  /**
   * Clean up old music files (older than 7 days)
   */
  async cleanupOldMusicFiles(): Promise<void> {
    try {
      const files = fs.readdirSync(this.musicCacheDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

      for (const file of files) {
        const filePath = path.join(this.musicCacheDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted old music file: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error cleaning up music files: ${error.message}`);
    }
  }
}

