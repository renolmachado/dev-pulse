import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [UtilsModule],
  providers: [ScriptsService],
  exports: [ScriptsService],
})
export class ScriptsModule {}
