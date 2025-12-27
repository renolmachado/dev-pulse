import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';

import { NewsService } from './news.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [
    HttpModule,
    UtilsModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'news-processing',
    }),
  ],
  controllers: [],
  providers: [NewsService],
})
export class NewsModule {}
