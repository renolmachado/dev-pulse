import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [/^http:\/\/localhost:(.*)/, /^https:\/\/.*\.vercel\.app$/],
    methods: ['GET'],
  });

  const host = process.env.HOST ?? '0.0.0.0';
  const port = process.env.PORT ?? 8001;

  await app.listen(port, host, () => {
    console.log(
      `************ Server is running on ${host}:${port} ************`,
    );
    console.log(`Database URL: ${process.env.DATABASE_URL}`);
    console.log(`Redis URL: ${process.env.REDIS_URL}`);
  });
}
bootstrap();
