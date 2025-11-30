import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getGoogleMapsApiKey(): { apiKey: string | null } {
    return {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || null,
    };
  }
}
