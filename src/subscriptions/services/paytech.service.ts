import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, createHash } from 'crypto';

export interface PaytechPaymentRequest {
  item_name: string;
  item_price: number;
  currency: string;
  ref_command: string;
  command_name: string;
  env: string;
  ipn_url: string;
  success_url: string;
  cancel_url: string;
  custom_field?: string;
}

export interface PaytechPaymentResponse {
  success: number;
  token: string;
  redirect_url: string;
  redirectUrl: string;
}

export interface PaytechIpnPayload {
  type_event: string;
  custom_field?: string;
  ref_command: string;
  item_name: string;
  item_price: number;
  currency: string;
  command_name: string;
  token: string;
  env: string;
  payment_method: string;
  client_phone: string;
  api_key_sha256: string;
  api_secret_sha256: string;
  hmac_compute?: string;
}

@Injectable()
export class PaytechService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl = 'https://paytech.sn/api';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('PAYTECH_API_KEY');
    this.apiSecret =
      this.configService.getOrThrow<string>('PAYTECH_API_SECRET');
  }

  async requestPayment(
    params: PaytechPaymentRequest,
  ): Promise<PaytechPaymentResponse> {
    const response = await fetch(`${this.baseUrl}/payment/request-payment`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        API_KEY: this.apiKey,
        API_SECRET: this.apiSecret,
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success !== 1) {
      throw new BadRequestException(
        `Erreur PayTech: ${data.message || 'Échec de la demande de paiement'}`,
      );
    }

    return data as PaytechPaymentResponse;
  }

  async getPaymentStatus(token: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/payment/get-status?token_payment=${token}`,
      {
        method: 'GET',
        headers: {
          API_KEY: this.apiKey,
          API_SECRET: this.apiSecret,
        },
      },
    );

    return response.json();
  }

  verifyIpnHmac(payload: PaytechIpnPayload): boolean {
    if (payload.hmac_compute) {
      const message = `${payload.item_price}|${payload.ref_command}|${this.apiKey}`;
      const hmac = createHmac('sha256', this.apiSecret);
      hmac.update(message);
      const expectedHmac = hmac.digest('hex');
      return expectedHmac === payload.hmac_compute;
    }
    return false;
  }

  verifyIpnSha256(payload: PaytechIpnPayload): boolean {
    const expectedKeyHash = createHash('sha256')
      .update(this.apiKey)
      .digest('hex');
    const expectedSecretHash = createHash('sha256')
      .update(this.apiSecret)
      .digest('hex');

    return (
      expectedKeyHash === payload.api_key_sha256 &&
      expectedSecretHash === payload.api_secret_sha256
    );
  }

  verifyIpn(payload: PaytechIpnPayload): boolean {
    if (payload.hmac_compute) {
      return this.verifyIpnHmac(payload);
    }
    return this.verifyIpnSha256(payload);
  }
}
