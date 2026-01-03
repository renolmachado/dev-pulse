import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckModule } from '@repo/health-check';
import { NewsModule } from './modules/news/news.module';
import { ArticlesModule } from './modules/articles/articles.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NewsModule,
    HealthCheckModule,
    ArticlesModule,
  ],
})
export class AppModule {}
