import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable gzip compression for all responses
  // This significantly reduces response sizes and improves performance, especially on Render hosting
  // Compression level: 6 (balanced between CPU usage and compression ratio)
  // Filter: Only compress responses larger than 1KB and non-binary content
  app.use(
    compression({
      level: 6, // Compression level (1-9, 6 is balanced)
      threshold: 1024, // Only compress responses > 1KB
      filter: (req, res) => {
        // Don't compress if explicitly disabled
        if (req.headers['x-no-compression']) {
          return false;
        }
        // Use compression for all other responses
        return compression.filter(req, res);
      },
    }),
  );
  logger.log('✅ Response compression enabled (gzip)');

  // Create uploads directories if they don't exist
  // NOTE: On Render, the filesystem is ephemeral. For production, consider using cloud storage (S3, Cloudinary, etc.)
  const uploadsDir = join(__dirname, '..', 'uploads');
  const profilesDir = join(uploadsDir, 'profiles');
  const journeysDir = join(uploadsDir, 'journeys');
  const outfitsDir = join(uploadsDir, 'outfits');

  [uploadsDir, profilesDir, journeysDir, outfitsDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      logger.log(`📁 Created directory: ${dir}`);
    }
  });

  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Serve destination videos
  const destinationVideosDir = join(
    __dirname,
    '..',
    'uploads',
    'destination-videos',
  );
  if (!existsSync(destinationVideosDir)) {
    mkdirSync(destinationVideosDir, { recursive: true });
  }
  app.useStaticAssets(destinationVideosDir, {
    prefix: '/uploads/destination-videos/',
  });

  // CORS configuration - restrict origins for security
  // In production, always specify exact origins. Wildcard (*) is only for development.
  const allowedOrigins = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(',').map((origin) => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? [] // Production must specify origins
      : ['http://localhost:3000', 'http://localhost:3001']; // Development defaults

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // In development, allow all origins if FRONTEND_ORIGIN is not set
      if (
        process.env.NODE_ENV !== 'production' &&
        (!process.env.FRONTEND_ORIGIN || process.env.FRONTEND_ORIGIN === '*')
      ) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  logger.log(
    `✅ CORS configured for ${allowedOrigins.length || 'all'} origin(s)`,
  );

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Wayfindr API')
    .setDescription('API documentation for Wayfindr backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT) || 3000;
  
  // Start server and wait for it to be ready
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
  logger.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`💾 MongoDB: Connected with connection pooling enabled`);
  
  // Ensure server is fully ready before marking as started
  // This helps with Render cold starts by pre-initializing critical paths
  try {
    // Small delay to ensure all routes are registered
    await new Promise((resolve) => setTimeout(resolve, 200));
    logger.log(`✅ Server fully initialized and ready to accept requests`);
  } catch (error) {
    logger.warn('⚠️ Server initialization warning:', error.message);
  }

  // Pre-warm critical services after server starts
  // This helps reduce cold start latency on Render
  // Note: Warm-up happens via HTTP call after server is listening
  setImmediate(async () => {
    try {
      // Small delay to ensure server is fully ready
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Call warmup endpoint via HTTP to ensure full request pipeline is warmed
      const http = await import('http');
      const warmupUrl = `http://localhost:${port}/api/warmup`;
      
      logger.log('🔥 Pre-warming critical services...');
      
      http.get(warmupUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            logger.log(`✅ Services pre-warmed: ${JSON.stringify(result.services)}`);
          } catch (e) {
            // Ignore parse errors
          }
        });
      }).on('error', (err) => {
        // Ignore warm-up errors, server is still running
        logger.warn('⚠️ Warm-up failed (non-critical):', err.message);
      });
    } catch (error) {
      // Ignore warm-up errors, server is still running
      logger.warn('⚠️ Could not pre-warm services (non-critical):', error.message);
    }
  });
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error starting the application:', error);
  process.exit(1);
});
