import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

describe('NestJS Application Smoke Test', () => {
  it('should bootstrap the application successfully', async () => {
    const app = await NestFactory.create(AppModule, { logger: false });
    expect(app).toBeDefined();
    expect(app.getHttpServer()).toBeDefined();
    await app.close();
  });
});
