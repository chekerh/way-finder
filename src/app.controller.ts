import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppService } from './app.service';

/**
 * Main application controller
 * Handles root routes, configuration, and health checks
 */
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly mongooseConnection: Connection,
  ) {}

  /**
   * Root endpoint - simple hello world
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Google Maps API key configuration endpoint
   */
  @Get('config/google-maps-api-key')
  getGoogleMapsApiKey() {
    return this.appService.getGoogleMapsApiKey();
  }

  /**
   * Health check endpoint for Render monitoring
   * Returns application status and basic metrics
   */
  @Get('health')
  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: 'unknown',
          latency: 0,
        },
        redis: {
          status: 'unknown',
          configured: !!(
            process.env.REDIS_URL ||
            process.env.UPSTASH_REDIS_URL ||
            process.env.REDIS_HOST
          ),
        },
      },
    };

    // Check MongoDB connection
    try {
      if (this.mongooseConnection?.db) {
        const startTime = Date.now();
        await this.mongooseConnection.db.admin().ping();
        health.services.database.latency = Date.now() - startTime;
        health.services.database.status = 'connected';
      } else {
        health.services.database.status = 'disconnected';
        health.status = 'degraded';
      }
    } catch (error) {
      this.logger.error('MongoDB health check failed', error);
      health.services.database.status = 'disconnected';
      health.status = 'degraded';
    }

    // Note: Redis check would require Redis client injection
    // For now, just indicate if it's configured
    if (health.services.redis.configured) {
      health.services.redis.status = 'configured';
    } else {
      health.services.redis.status = 'not_configured';
    }

    return health;
  }

  /**
   * Readiness probe endpoint
   * Returns 200 if the application is ready to serve traffic
   * Used by orchestration platforms (Render, Kubernetes, etc.)
   */
  @Get('ready')
  async getReady() {
    try {
      // Check if database is connected
      if (this.mongooseConnection?.db) {
        await this.mongooseConnection.db.admin().ping();
        return { status: 'ready', timestamp: new Date().toISOString() };
      } else {
        throw new ServiceUnavailableException(
          'Database connection not available',
        );
      }
    } catch (error) {
      this.logger.error('Readiness check failed', error);
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new ServiceUnavailableException(
        'Service is not ready to serve traffic',
      );
    }
  }

  /**
   * Liveness probe endpoint
   * Returns 200 if the application is alive (not crashed)
   * Used by orchestration platforms to restart containers if needed
   */
  @Get('live')
  getLive() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}
