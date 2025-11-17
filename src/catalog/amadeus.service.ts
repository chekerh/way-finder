import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom } from 'rxjs';
import { FlightSearchDto } from './dto/flight-search.dto';

interface AmadeusAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private cachedToken: string | null = null;
  private tokenExpiry = 0;

  private readonly clientId = process.env.AMADEUS_CLIENT_ID;
  private readonly clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  private readonly host = process.env.AMADEUS_HOST ?? 'https://test.api.amadeus.com';

  constructor(private readonly http: HttpService) {}

  isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiry - 5000) {
      return this.cachedToken;
    }

    if (!this.isConfigured()) {
      throw new InternalServerErrorException('Amadeus credentials are not configured');
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    try {
      const response = await lastValueFrom(
        this.http.post<AmadeusAuthResponse>(
          `${this.host}/v1/security/oauth2/token`,
          body.toString(),
          config,
        ),
      );

      this.cachedToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.cachedToken;
    } catch (error) {
      this.logger.error('Failed to fetch Amadeus token', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException('Failed to authenticate with Amadeus');
    }
  }

  async searchFlights(params: FlightSearchDto) {
    const accessToken = await this.getAccessToken();

    const payload: any = {
      currencyCode: params.currencyCode ?? 'EUR',
      sources: ['GDS'],
      originDestinations: [],
      travelers: [
        {
          id: '1',
          travelerType: 'ADULT',
        },
      ],
      searchCriteria: {
        maxFlightOffers: params.max ?? 5,
      },
    };

    if (params.adults && params.adults > 1) {
      payload.travelers = Array.from({ length: params.adults }, (_, idx) => ({
        id: `${idx + 1}`,
        travelerType: 'ADULT',
      }));
    }

    payload.originDestinations.push({
      id: '1',
      originLocationCode: params.originLocationCode,
      destinationLocationCode: params.destinationLocationCode,
      departureDateTimeRange: {
        date: params.departureDate,
      },
    });

    if (params.returnDate) {
      payload.originDestinations.push({
        id: '2',
        originLocationCode: params.destinationLocationCode,
        destinationLocationCode: params.originLocationCode,
        departureDateTimeRange: {
          date: params.returnDate,
        },
      });
    }

    if (params.travelClass) {
      payload.searchCriteria.flightFilters = {
        cabinRestrictions: [
          {
            cabin: params.travelClass,
            coverage: 'MOST_SEGMENTS',
            originDestinationIds: payload.originDestinations.map((od: any) => od.id),
          },
        ],
      };
    }

    if (params.maxPrice) {
      payload.searchCriteria.priceRange = {
        maxAmount: params.maxPrice,
      };
    }

    try {
      const response = await lastValueFrom(
        this.http.post(`${this.host}/v2/shopping/flight-offers`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch Amadeus flight offers', error instanceof Error ? error.stack : '');
      throw new InternalServerErrorException('Unable to fetch flight offers');
    }
  }
}

