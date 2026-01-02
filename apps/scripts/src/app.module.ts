import { Module } from '@nestjs/common';
import { HealthCheckModule } from '@repo/health-check';
import { ScriptsModule } from './modules/scripts/scripts.module';
import { UtilsModule } from './modules/utils/utils.module';

@Module({
  imports: [
    HealthCheckModule,
    UtilsModule,
    ScriptsModule,
  ],
})
export class AppModule {}
