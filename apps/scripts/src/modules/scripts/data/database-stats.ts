import { Script, ScriptContext } from '../scripts.service';

const script: Script = {
  name: 'database-stats',
  description: 'Generate database statistics and health metrics',
  
  async execute(context: ScriptContext) {
    const { prisma, logger } = context;
    
    logger.log('Generating database statistics...\n');
    
    // Total articles
    const totalArticles = await prisma.client.article.count();
    logger.log(`📊 Total Articles: ${totalArticles}`);
    
    // Articles by date range
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const recentArticles = await prisma.client.article.count({
      where: {
        publishedAt: {
          gte: oneMonthAgo,
        },
      },
    });
    logger.log(`📅 Articles from last month: ${recentArticles}`);
    
    // Latest article
    const latestArticle = await prisma.client.article.findFirst({
      orderBy: { publishedAt: 'desc' },
      select: { title: true, publishedAt: true },
    });
    
    if (latestArticle) {
      logger.log(`📰 Latest Article: "${latestArticle.title}"`);
      logger.log(`   Published: ${latestArticle.publishedAt.toISOString()}`);
    }
    
    // Oldest article
    const oldestArticle = await prisma.client.article.findFirst({
      orderBy: { publishedAt: 'asc' },
      select: { title: true, publishedAt: true },
    });
    
    if (oldestArticle) {
      logger.log(`📜 Oldest Article: "${oldestArticle.title}"`);
      logger.log(`   Published: ${oldestArticle.publishedAt.toISOString()}`);
    }
    
    // Articles with/without content
    const withContent = await prisma.client.article.count({
      where: { content: { not: null } },
    });
    const withoutContent = totalArticles - withContent;
    logger.log(`\n📝 Articles with content: ${withContent}`);
    logger.log(`❌ Articles without content: ${withoutContent}`);
    
    // Data quality score
    const qualityScore = totalArticles > 0 
      ? Math.round((withContent / totalArticles) * 100) 
      : 0;
    logger.log(`\n✨ Data Quality Score: ${qualityScore}%`);
    
    logger.log('\n✅ Statistics generation completed!');
  },
};

export default script;
