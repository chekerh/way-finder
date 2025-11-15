import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ActivitySearchDto } from './dto/activity-search.dto';

interface GeoResponse {
  lat: number;
  lon: number;
}

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);
  private readonly apiKey = process.env.OPENTRIPMAP_KEY;
  private readonly host = process.env.OPENTRIPMAP_HOST ?? 'https://api.opentripmap.com/0.1';

  constructor(private readonly http: HttpService) {}

  async findActivities(params: ActivitySearchDto) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('OpenTripMap API key is not configured');
    }

    const geo = await this.resolveCity(params.city);

    const query = new URLSearchParams({
      lat: geo.lat.toString(),
      lon: geo.lon.toString(),
      radius: (params.radiusMeters ?? 20000).toString(),
      format: 'json',
      limit: (params.limit ?? 12).toString(),
      apikey: this.apiKey,
    });

    const themes = Array.isArray(params.themes) ? params.themes : params.themes ? [params.themes] : [];
    if (themes.length) {
      query.append('kinds', themes.join(','));
    }

    try {
      const response = await lastValueFrom(
        this.http.get(`${this.host}/en/places/radius`, {
          params: query,
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch activities', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException('Unable to fetch activities');
    }
  }

  private async resolveCity(city: string): Promise<GeoResponse> {
    try {
      const response = await lastValueFrom(
        this.http.get<GeoResponse>(`${this.host}/en/places/geoname`, {
          params: { name: city, apikey: this.apiKey },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(`Failed to resolve city ${city}: ${error}`);
      throw new NotFoundException(`City "${city}" not found`);
    }
  }
}

