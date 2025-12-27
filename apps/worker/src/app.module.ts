import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { WorkerService } from './worker.service';
import { NewsProcessorModule } from './modules/news-processor/news-processor.module';

@Module({
  imports: [
    NewsProcessorModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),

    BullModule.registerQueue({
      name: 'news-processing',
    }),
  ],
  providers: [WorkerService],
})
export class WorkerModule {}
