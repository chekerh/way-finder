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
   * Enhanced to verify that services are truly ready (not just responding)
   */
  @Get('health')
  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      ready: false, // New field to indicate if truly ready
      services: {
        database: {
          status: 'unknown',
          latency: 0,
          ready: false,
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

    // Check MongoDB connection with actual ping
    try {
      if (this.mongooseConnection?.db) {
        const startTime = Date.now();
        // Perform actual ping to ensure connection is working
        await this.mongooseConnection.db.admin().ping();
        const latency = Date.now() - startTime;
        health.services.database.latency = latency;
        health.services.database.status = 'connected';
        health.services.database.ready = true;

        // Mark as ready if database is connected and responsive
        // Don't require < 100ms latency as Render can have variable network conditions
        health.ready = true;
      } else {
        health.services.database.status = 'disconnected';
        health.services.database.ready = false;
        health.status = 'degraded';
        health.ready = false;
      }
    } catch (error) {
      this.logger.error('MongoDB health check failed', error);
      health.services.database.status = 'disconnected';
      health.services.database.ready = false;
      health.status = 'degraded';
      health.ready = false;
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

  /**
   * Warm-up endpoint to pre-initialize critical services
   * This helps reduce cold start latency on Render by initializing
   * services before they're needed
   * Returns immediately if already warmed up to avoid blocking
   */
  @Get('warmup')
  async warmup() {
    const startTime = Date.now();
    const results: Record<string, { status: string; latency?: number }> = {};

    // Warm up database connection - this is the critical path
    try {
      const dbStart = Date.now();
      if (this.mongooseConnection?.db) {
        // Perform actual ping to ensure connection is working
        await this.mongooseConnection.db.admin().ping();
        results.database = {
          status: 'ready',
          latency: Date.now() - dbStart,
        };
      } else {
        results.database = { status: 'not_connected' };
      }
    } catch (error) {
      this.logger.error('Database warm-up failed', error);
      results.database = { status: 'error' };
    }

    // Warm up JWT service (if available)
    try {
      const jwtStart = Date.now();
      // Just verify JWT_SECRET is set (lightweight check)
      if (process.env.JWT_SECRET) {
        results.jwt = {
          status: 'configured',
          latency: Date.now() - jwtStart,
        };
      } else {
        results.jwt = { status: 'not_configured' };
      }
    } catch {
      results.jwt = { status: 'error' };
    }

    const totalLatency = Date.now() - startTime;

    return {
      status: 'warmed_up',
      timestamp: new Date().toISOString(),
      totalLatency,
      services: results,
      ready: results.database?.status === 'ready', // Server is ready if DB is ready
    };
  }
}
