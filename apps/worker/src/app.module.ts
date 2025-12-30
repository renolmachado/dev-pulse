import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
import { HealthCheckModule } from '@repo/health-check';
import { WorkerService } from './worker.service';
import { NewsProcessorModule } from './modules/news-processor/news-processor.module';

@Module({
  imports: [
    NewsProcessorModule,
    BullModule.forRoot({
      connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
      }),
    }),

    BullModule.registerQueue({
      name: 'news-processing',
    }),
    HealthCheckModule,
  ],
  providers: [WorkerService],
})
export class AppModule {}
