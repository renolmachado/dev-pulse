import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { NewsService } from './modules/news/news.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly newsService: NewsService,
  ) {}

  @Get()
  async getHello(): Promise<any> {
    const news = await this.newsService.getNews();
    return news;
  }
}
