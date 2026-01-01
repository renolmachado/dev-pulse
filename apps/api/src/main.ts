import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      /^http:\/\/localhost:(.*)/,
      'https://dev-pulse-web-gules.vercel.app',
    ],
    methods: ['GET'],
  });

  await app.listen(process.env.PORT ?? 8001);
}
bootstrap();
