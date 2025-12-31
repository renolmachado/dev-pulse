import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';

import { NewsService } from './news.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    HttpModule,
    UtilsModule,
    BullModule.forRoot({
      connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
      }),
    }),
    BullModule.registerQueue({
      name: 'news-processing',
    }),
  ],
  providers: [NewsService],
})
export class NewsModule {}
