export interface VideoSlideInput {
  imageUrl: string;
  caption?: string;
}

export interface VideoJobPayload {
  journeyId: string;
  userId: string;
  destination?: string | null;
  musicTheme?: string | null;
  captionText?: string | null;
  slides: VideoSlideInput[];
}

