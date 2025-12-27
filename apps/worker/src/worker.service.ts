import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Article } from '@repo/database';
import { NewsProcessorService } from './modules/news-processor/news-processor.service';

@Processor('news-processing')
export class WorkerService extends WorkerHost {
  constructor(private readonly newsProcessorService: NewsProcessorService) {
    super();
  }

  async process(
    job: Job<Article[]>,
  ): Promise<{ status: 'completed' | 'failed' }> {
    switch (job.name) {
      case 'process-news': {
        const articles = job.data;

        if (articles.length === 0) {
          return { status: 'completed' };
        }

        await this.newsProcessorService.processNews(articles);

        // Filter out articles that are already in the database

        // const articlesInDatabase =
        //   await this.prismaService.client.article.findMany({
        //     where: {
        //       url: {
        //         in: articles.map((article) => article.url ?? ''),
        //       },
        //     },
        //   });

        // const newArticles = articles.filter(
        //   (article) => !articlesInDatabase.some((a) => a.url === article.url),
        // );

        // Here you would:
        // 1. Verify if the article is already in the database
        // 2. If it is, skip it
        // 3. If it is not, call AI for summary
        // 4. Save to Database using your @repo/database package
        // 5. Return the status
        return { status: 'completed' };
      }
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
