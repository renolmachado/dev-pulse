import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(WorkerModule);

  console.log('Worker started');
}
bootstrap();
