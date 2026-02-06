import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedHandler: any;

async function createHandler() {
  console.log('Creating NestJS application...');
  const expressApp = express();
  const nestApp = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { logger: ['error', 'warn', 'log', 'debug'] }
  );

  nestApp.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  await nestApp.init();
  console.log('NestJS application initialized successfully');
  return serverlessExpress({ app: expressApp });
}

export const handler = async (event: any, context: any) => {
  // Deshabilitar temporalmente el caché para debugging
  cachedHandler = await createHandler();
  return cachedHandler(event, context);
};
