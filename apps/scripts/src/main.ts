import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [/^http:\/\/localhost:(.*)/],
    methods: ['GET', 'POST'],
  });

  await app.listen(process.env.PORT ?? 8005);
  console.log('Scripts service started on port', process.env.PORT ?? 8005);
}
bootstrap();
