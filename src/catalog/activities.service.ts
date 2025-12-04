import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ActivitySearchDto } from './dto/activity-search.dto';
import { FALLBACK_ACTIVITIES, FallbackActivity } from './catalog.fallback';
import { CacheService } from '../common/cache/cache.service';

interface GeoResponse {
  lat: number;
  lon: number;
}

interface OpenTripMapActivity {
  xid: string;
  name: string;
  kinds?: string;
  rate?: number;
  point?: {
    lat: number;
    lon: number;
  };
}

export interface ActivityFeedResponse {
  city: string;
  source: 'opentripmap' | 'fallback';
  total: number;
  items: FallbackActivity[];
}

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);
  private readonly apiKey = process.env.OPENTRIPMAP_KEY;
  private readonly host =
    process.env.OPENTRIPMAP_HOST ?? 'https://api.opentripmap.com/0.1';

  constructor(
    private readonly http: HttpService,
    private readonly cacheService: CacheService,
  ) {}

  async findActivities(
    params: ActivitySearchDto,
  ): Promise<ActivityFeedResponse> {
    const safeCity = params.city?.trim() || 'Paris';

    // Generate cache key
    const cacheKey = `activities:${safeCity}:${JSON.stringify(params).slice(0, 50)}`;

    // Try to get from cache first
    const cachedResult =
      await this.cacheService.get<ActivityFeedResponse>(cacheKey);
    if (cachedResult) {
      this.logger.debug(`Cache hit for activities: ${cacheKey}`);
      return cachedResult;
    }

    if (!this.apiKey) {
      this.logger.warn(
        'OpenTripMap API key missing, serving fallback activities',
      );
      const fallbackResult = this.buildFallbackResponse({
        ...params,
        city: safeCity,
      });
      // Cache fallback for 10 minutes (600 seconds)
      try {
        await this.cacheService.set(cacheKey, fallbackResult, 600);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache fallback activities: ${error}`);
      }
      return fallbackResult;
    }

    try {
      const geo = await this.resolveCity(safeCity);

      const query = new URLSearchParams({
        lat: geo.lat.toString(),
        lon: geo.lon.toString(),
        radius: (params.radiusMeters ?? 20000).toString(),
        format: 'json',
        limit: Math.min(params.limit ?? 20, 30).toString(),
        apikey: this.apiKey,
      });

      const themes = this.normalizeThemes(params.themes);
      if (themes.length) {
        query.append('kinds', themes.join(','));
      }

      const response = await lastValueFrom(
        this.http.get<OpenTripMapActivity[]>(`${this.host}/en/places/radius`, {
          params: query,
        }),
      );

      const mapped = (response.data ?? [])
        .filter((activity) => Boolean(activity?.name))
        .map((activity, index) =>
          this.mapExternalActivity(activity, safeCity, index),
        )
        .filter(Boolean);

      if (!mapped.length) {
        this.logger.warn(
          `No activities returned for ${safeCity}, using fallback dataset`,
        );
        const fallbackResult = this.buildFallbackResponse({
          ...params,
          city: safeCity,
        });
        // Cache fallback for 10 minutes (600 seconds)
        try {
          await this.cacheService.set(cacheKey, fallbackResult, 600);
        } catch (error) {
          // Cache failures shouldn't break the response
          this.logger.warn(`Failed to cache fallback activities: ${error}`);
        }
        return fallbackResult;
      }

      const limited = mapped.slice(0, params.limit ?? 12);
      const result = {
        city: safeCity,
        source: 'opentripmap' as const,
        total: limited.length,
        items: limited,
      };

      // Cache for 30 minutes (1800 seconds)
      try {
        await this.cacheService.set(cacheKey, result, 1800);
        this.logger.debug(`Cached activities: ${cacheKey}`);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache activities: ${error}`);
      }

      return result;
    } catch (error) {
      this.logger.error(
        'Failed to fetch activities',
        error instanceof Error ? error.stack : '',
      );
      const fallbackResult = this.buildFallbackResponse({
        ...params,
        city: safeCity,
      });
      // Cache fallback for 10 minutes (600 seconds)
      try {
        await this.cacheService.set(cacheKey, fallbackResult, 600);
      } catch (error) {
        // Cache failures shouldn't break the response
        this.logger.warn(`Failed to cache fallback activities: ${error}`);
      }
      return fallbackResult;
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

  private buildFallbackResponse(
    params: ActivitySearchDto & { city: string },
  ): ActivityFeedResponse {
    const themes = this.normalizeThemes(params.themes);
    let pool = FALLBACK_ACTIVITIES;

    if (params.city) {
      pool = pool.filter(
        (activity) => activity.city.toLowerCase() === params.city.toLowerCase(),
      );
      if (!pool.length) {
        pool = FALLBACK_ACTIVITIES;
      }
    }

    if (themes.length) {
      const normalizedThemes = themes.map((theme) => theme.toLowerCase());
      pool = pool.filter(
        (activity) =>
          normalizedThemes.includes(activity.category.toLowerCase()) ||
          activity.tags.some((tag) =>
            normalizedThemes.includes(tag.toLowerCase()),
          ),
      );
    }

    const limited = pool.slice(0, params.limit ?? 12);
    return {
      city: params.city,
      source: 'fallback',
      total: limited.length,
      items: limited,
    };
  }

  private normalizeThemes(themes?: string | string[]): string[] {
    if (!themes) {
      return [];
    }
    if (Array.isArray(themes)) {
      return themes
        .flatMap((theme) => (theme ? theme.split(',') : []))
        .map((theme) => theme.trim())
        .filter(Boolean);
    }
    return themes
      .split(',')
      .map((theme) => theme.trim())
      .filter(Boolean);
  }

  private mapExternalActivity(
    activity: OpenTripMapActivity,
    city: string,
    index: number,
  ): FallbackActivity {
    const category = activity.kinds?.split(',')?.[0]?.trim() || 'Activités';
    const imageUrl = this.getImageForCategory(category, city, index);
    const label = activity.name.trim();
    const coordinates = {
      lat: activity.point?.lat ?? 0,
      lon: activity.point?.lon ?? 0,
    };

    return {
      id: activity.xid ?? `EXT-${city.toUpperCase()}-${index}`,
      city,
      country: this.getCountryForCity(city),
      name: label,
      category,
      description: `Activité "${label}" recommandée à ${city}.`,
      imageUrl,
      address: `${city}, ${this.getCountryForCity(city)}`,
      price: undefined,
      rating: activity.rate
        ? Number((activity.rate / 3).toFixed(1))
        : undefined,
      tags: activity.kinds
        ? activity.kinds.split(',').map((kind) => kind.trim())
        : [],
      coordinates,
    };
  }

  private getImageForCategory(
    category: string,
    city: string,
    seed: number,
  ): string {
    const normalized = category.toLowerCase();
    if (normalized.includes('museum') || normalized.includes('muse')) {
      return 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop&q=80';
    }
    if (normalized.includes('restaurant')) {
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80';
    }
    if (normalized.includes('night') || normalized.includes('theater')) {
      return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&q=80';
    }
    if (normalized.includes('park')) {
      return 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?w=800&h=600&fit=crop&q=80';
    }
    const encodedCity = encodeURIComponent(city);
    return `https://source.unsplash.com/featured/800x600/?${encodedCity}&seed=${seed}`;
  }

  private getCountryForCity(city: string): string {
    switch (city.toLowerCase()) {
      case 'paris':
        return 'France';
      case 'rome':
        return 'Italie';
      case 'dubai':
        return 'Émirats arabes unis';
      case 'tunis':
        return 'Tunisie';
      case 'barcelona':
        return 'Espagne';
      case 'london':
        return 'Royaume-Uni';
      default:
        return 'Inconnu';
    }
  }
}
