import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreatePaypalOrderDto } from './dto/paypal-order.dto';

interface PaypalTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

@Injectable()
export class PaypalService {
  private readonly logger = new Logger(PaypalService.name);
  private readonly baseUrl: string;
  private tokenCache: { token: string; expiresAt: number } | null = null;

  constructor(private readonly http: HttpService) {
    this.baseUrl =
      process.env.PAYPAL_API_BASE_URL ||
      (process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com');
  }

  private getCredentials() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('PayPal credentials are not configured');
    }

    return { clientId, clientSecret };
  }

  private async getAccessToken(): Promise<string> {
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now()) {
      return this.tokenCache.token;
    }

    const { clientId, clientSecret } = this.getCredentials();
    const url = `${this.baseUrl}/v1/oauth2/token`;
    const payload = 'grant_type=client_credentials';

    try {
      const response = await firstValueFrom(
        this.http.post<PaypalTokenResponse>(url, payload, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          },
        }),
      );

      this.tokenCache = {
        token: response.data.access_token,
        expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
      };

      return response.data.access_token;
    } catch (error) {
      this.logger.error('Failed to fetch PayPal access token', error?.response?.data || error?.message);
      throw new InternalServerErrorException('Unable to authenticate with PayPal');
    }
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    const token = await this.getAccessToken();

    const response = await firstValueFrom(
      this.http.request<T>({
        ...config,
        baseURL: this.baseUrl,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(config.headers || {}),
        },
      }),
    );

    return response.data;
  }

  async createOrder(dto: CreatePaypalOrderDto, userId: string) {
    const currency = dto.currency.toUpperCase();
    const purchaseAmount = dto.amount.toFixed(2);
    const items = dto.items?.map((item) => ({
      name: item.name,
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: (item.currency_code || currency).toUpperCase(),
        value: item.unit_amount.toFixed(2),
      },
    }));
    const itemsTotal = items?.reduce(
      (acc, item) => acc + Number(item.unit_amount.value) * Number(item.quantity),
      0,
    );

    const body: Record<string, any> = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: items && items.length ? itemsTotal?.toFixed(2) : purchaseAmount,
            ...(items && items.length
              ? {
                  breakdown: {
                    item_total: {
                      currency_code: currency,
                      value: itemsTotal?.toFixed(2),
                    },
                  },
                }
              : {}),
          },
          description: dto.description || 'WayFinder payment',
          reference_id: dto.referenceId || userId,
          custom_id: dto.referenceId || undefined,
          items,
        },
      ],
      application_context: {
        return_url: dto.returnUrl,
        cancel_url: dto.cancelUrl,
      },
    };

    return this.request<any>({
      method: 'POST',
      url: '/v2/checkout/orders',
      data: body,
    });
  }

  async captureOrder(orderId: string) {
    return this.request<any>({
      method: 'POST',
      url: `/v2/checkout/orders/${orderId}/capture`,
    });
  }

  async getOrder(orderId: string) {
    return this.request<any>({
      method: 'GET',
      url: `/v2/checkout/orders/${orderId}`,
    });
  }

  getApprovalLink(order: any): string | undefined {
    return order?.links?.find((link: any) => link.rel === 'approve')?.href;
  }
}


