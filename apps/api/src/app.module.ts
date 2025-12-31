import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthCheckModule } from '@repo/health-check';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './modules/news/news.module';
import { ArticlesModule } from './modules/articles/articles.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    NewsModule,
    HealthCheckModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
