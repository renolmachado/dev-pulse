import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { NewsService } from './news.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [HttpModule, UtilsModule],
  controllers: [],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
