import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Create uploads directories if they don't exist
  // NOTE: On Render, the filesystem is ephemeral. For production, consider using cloud storage (S3, Cloudinary, etc.)
  const uploadsDir = join(__dirname, '..', 'uploads');
  const profilesDir = join(uploadsDir, 'profiles');
  const journeysDir = join(uploadsDir, 'journeys');
  const outfitsDir = join(uploadsDir, 'outfits');

  [uploadsDir, profilesDir, journeysDir, outfitsDir].forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
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

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    credentials: true,
  });

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
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(
    `📚 Swagger docs available at: http://localhost:${port}/api-docs`,
  );
}

bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
