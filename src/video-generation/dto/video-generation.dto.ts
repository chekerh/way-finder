import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  MinLength,
} from 'class-validator';

export class AiVideoGenerateRequest {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Prompt must be at least 5 characters long' })
  prompt: string;
}

export class AiVideoGenerateWithMediaRequest {
  @IsString()
  @IsOptional()
  prompt?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  musicTrackId?: string;
}

export class VideoGenerationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class AiVideoStatusResponse {
  available: boolean;
  suggestions?: string[];
  message?: string;
}

export class AiVideoCheckStatusResponse {
  success: boolean;
  data?: AiVideoStatusData;
}

export class AiVideoStatusData {
  predictionId: string;
  status: string;
  videoUrl?: string;
  progress?: number;
  error?: string;
  isComplete: boolean;
  isFailed: boolean;
}

export class MusicTracksResponse {
  success: boolean;
  tracks: MusicTrack[];
}

export class TravelPlansResponse {
  success: boolean;
  plans: TravelPlan[];
}

export class ImageUploadResponse {
  success: boolean;
  message?: string;
  data?: ImageUploadData;
}

export class ImageUploadData {
  url: string;
  originalName: string;
  size?: number;
}

// Basic entity interfaces for responses
export interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  duration: string;
  previewUrl?: string;
}

export interface TravelPlan {
  id: string;
  title: string;
  description: string;
  destinations: string[];
  duration: string;
  activities: string[];
  videoPrompt: string;
}
