import { Module } from '@nestjs/common';
import { UtilsModule } from '../utils/utils.module';
import { NewsProcessorService } from './news-processor.service';

@Module({
  imports: [UtilsModule],
  providers: [NewsProcessorService],
  exports: [NewsProcessorService],
})
export class NewsProcessorModule {}
