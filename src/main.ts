import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';
import { Handler, Context, Callback } from 'aws-lambda';
import { Server } from 'http';

let cachedServer: Handler | null = null;

async function createNestServer(): Promise<Server> {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    credentials: true,
  });

  // Security headers
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Wayfindr API')
    .setDescription('API documentation for Wayfindr backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.init();
  return app.getHttpAdapter().getInstance();
}

async function bootstrap() {
  try {
    const server = await createNestServer();
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`🚀 Application is running on: http://localhost:${port}/api`);
      console.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
    });
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  bootstrap();
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  if (!cachedServer) {
    const nestServer = await createNestServer();
    cachedServer = serverlessExpress({ app: nestServer });
  }
  return cachedServer(event, context, callback);
};
