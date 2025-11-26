import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);
  private readonly webClient: OAuth2Client | null;
  private readonly webClientId: string;
  private readonly androidClientId: string;

  constructor() {
    this.webClientId = process.env.GOOGLE_CLIENT_ID_WEB || '';
    this.androidClientId = process.env.GOOGLE_CLIENT_ID_ANDROID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET_WEB || '';

    // Initialize OAuth2 client for web token verification only if we have both ID and secret
    if (this.webClientId && clientSecret) {
      this.webClient = new OAuth2Client(this.webClientId, clientSecret);
      this.logger.log('Google OAuth Web client configured');
    } else {
      this.webClient = null;
      if (this.webClientId && !clientSecret) {
        this.logger.warn(
          'Google OAuth Web client ID provided but no secret. Web OAuth will be disabled.',
        );
      }
    }

    if (!this.androidClientId) {
      this.logger.warn(
        'Google OAuth Android client ID not configured. Android Google Sign-In will not work.',
      );
    } else {
      this.logger.log('Google OAuth Android client ID configured');
    }
  }

  /**
   * Verify Google ID token and extract user information
   * @param idToken - Google ID token from client
   * @param clientType - 'web' or 'android' to determine which client ID to verify against
   * @returns User information from Google
   */
  async verifyIdToken(
    idToken: string,
    clientType: 'web' | 'android' = 'android',
  ): Promise<{
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }> {
    try {
      let ticket;

      if (clientType === 'android') {
        // For Android, verify using Android client ID (no secret needed)
        if (!this.androidClientId) {
          throw new UnauthorizedException(
            'Google OAuth Android client ID not configured',
          );
        }

        // Create a client without secret for Android token verification
        const androidClient = new OAuth2Client();
        ticket = await androidClient.verifyIdToken({
          idToken,
          audience: this.androidClientId, // Android client ID
        });
      } else {
        // For Web, verify using Web client ID and secret
        if (!this.webClient) {
          throw new UnauthorizedException(
            'Google OAuth Web client not configured. Please configure GOOGLE_CLIENT_ID_WEB and GOOGLE_CLIENT_SECRET_WEB',
          );
        }

        ticket = await this.webClient.verifyIdToken({
          idToken,
          audience: this.webClientId,
        });
      }

      const payload = ticket.getPayload();

      if (!payload) {
        throw new UnauthorizedException('Invalid Google token: no payload');
      }

      // Extract user information
      const googleId = payload.sub; // Google user ID
      const email = payload.email;
      const emailVerified = payload.email_verified || false;
      const name = payload.name || '';
      const picture = payload.picture;

      // Split name into first and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || email.split('@')[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!email) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      this.logger.log(`Google token verified for user: ${email} (${googleId})`);

      return {
        googleId,
        email: email.toLowerCase(),
        emailVerified,
        name,
        firstName,
        lastName,
        picture,
      };
    } catch (error) {
      this.logger.error('Google token verification failed:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Check if Google OAuth is properly configured
   * For Android, only client ID is needed. For Web, both ID and secret are needed.
   */
  isConfigured(): boolean {
    // At minimum, Android client ID should be configured
    // Web client is optional
    return (
      !!this.androidClientId ||
      !!(this.webClientId && process.env.GOOGLE_CLIENT_SECRET_WEB)
    );
  }

  /**
   * Check if Android OAuth is configured
   */
  isAndroidConfigured(): boolean {
    return !!this.androidClientId;
  }
}
