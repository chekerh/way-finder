import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { ExploreSearchDto } from './dto/explore-search.dto';

@Injectable()
export class TequilaService {
  private readonly logger = new Logger(TequilaService.name);
  private readonly apiKey = process.env.TEQUILA_API_KEY;
  private readonly host = process.env.TEQUILA_HOST ?? 'https://tequila-api.kiwi.com';

  constructor(private readonly http: HttpService) {}

  async searchExplore(params: ExploreSearchDto) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('Tequila API key is not configured');
    }

    const query = new URLSearchParams({
      fly_from: params.origin,
      fly_to: params.destination ?? 'anywhere',
      date_from: params.dateFrom ?? this.formatDate(new Date()),
      date_to: params.dateTo ?? this.formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
      limit: String(params.limit ?? 10),
      sort: 'price',
      asc: '1',
    });

    if (params.budget) {
      query.append('price_to', params.budget.toString());
    }

    try {
      const response = await lastValueFrom(
        this.http.get(`${this.host}/v2/search`, {
          params: query,
          headers: {
            apikey: this.apiKey,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch Tequila offers', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException('Unable to fetch explore offers');
    }
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString('en-GB').replace(/\//g, '/');
  }
}

