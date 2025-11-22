export interface VideoSlideInput {
  imageUrl: string;
  caption?: string | null;
}

export interface VideoJobPayload {
  journeyId: string;
  userId: string;
  destination?: string | null;
  musicTheme?: string | null;
  captionText?: string | null;
  slides: VideoSlideInput[];
}

