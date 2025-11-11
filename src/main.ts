import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import serverlessExpress from '@vendia/serverless-express';
import type { Context, Callback, Handler } from 'aws-lambda';

let cachedServer: ReturnType<typeof serverlessExpress> | null = null;
let cachedApp: INestApplication | null = null;

async function createNestApp(): Promise<INestApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);

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

  await app.init();
  cachedApp = app;
  return app;
}

async function bootstrapLocal() {
  try {
    const app = await createNestApp();
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  bootstrapLocal();
}

export const handler: Handler = async (event: any, context: Context, callback: Callback) => {
  if (!cachedServer) {
    const app = await createNestApp();
    const expressApp = app.getHttpAdapter().getInstance();
    cachedServer = serverlessExpress({ app: expressApp });
  }
  return cachedServer(event, context, callback);
};

export default handler;
