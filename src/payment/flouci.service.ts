import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

export interface FlouciPaymentRequest {
  amount: number;
  currency?: string;
  success_link: string;
  fail_link: string;
  app_transaction_id?: string;
  app_transaction_time?: number;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  webhook?: string;
}

export interface FlouciPaymentResponse {
  status: string;
  message?: string;
  result?: {
    link: string;
    payment_id: string;
  };
}

export interface FlouciPaymentStatusResponse {
  status: string;
  message?: string;
  result?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    app_transaction_id?: string;
    created_at?: string;
    customer?: {
      id?: string;
      name?: string;
      email?: string;
      phone?: string;
    };
  };
}

@Injectable()
export class FlouciService {
  private readonly logger = new Logger(FlouciService.name);
  private readonly appToken = process.env.FLOUCI_APP_TOKEN;
  private readonly publicKey = process.env.FLOUCI_PUBLIC_KEY;
  private readonly baseUrl = process.env.FLOUCI_BASE_URL || 'https://api.flouci.com/api/v2';

  constructor(private readonly http: HttpService) {}

  isConfigured(): boolean {
    return Boolean(this.appToken && this.publicKey);
  }

  async createPayment(request: FlouciPaymentRequest): Promise<FlouciPaymentResponse> {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException('Flouci credentials are not configured');
    }

    try {
      const response = await lastValueFrom(
        this.http.post<FlouciPaymentResponse>(
          `${this.baseUrl}/payment`,
          request,
          {
            headers: {
              'Content-Type': 'application/json',
              'apppublic': this.publicKey!,
              'appsecret': this.appToken!,
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to create Flouci payment', error?.response?.data || error?.message);
      throw new InternalServerErrorException(
        error?.response?.data?.message || 'Failed to create payment',
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<FlouciPaymentStatusResponse> {
    if (!this.isConfigured()) {
      throw new InternalServerErrorException('Flouci credentials are not configured');
    }

    try {
      const response = await lastValueFrom(
        this.http.get<FlouciPaymentStatusResponse>(
          `${this.baseUrl}/payment/${paymentId}`,
          {
            headers: {
              'apppublic': this.publicKey!,
              'appsecret': this.appToken!,
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Failed to get Flouci payment status', error?.response?.data || error?.message);
      throw new InternalServerErrorException(
        error?.response?.data?.message || 'Failed to get payment status',
      );
    }
  }
}

