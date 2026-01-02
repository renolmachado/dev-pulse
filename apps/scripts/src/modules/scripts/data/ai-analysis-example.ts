import { Script, ScriptContext } from '../scripts.service';

const script: Script = {
  name: 'ai-analysis-example',
  description: 'Example script demonstrating AI analysis of articles',
  
  async execute(context: ScriptContext) {
    const { prisma, logger } = context;
    
    logger.log('Starting AI analysis example...');
    
    // This is a placeholder example. To actually use it:
    // 1. Set OPENAI_API_KEY or GROQ_API_KEY in your .env file
    // 2. Inject OpenAiService or GroqService into ScriptsService
    // 3. Pass the AI service to the script context
    
    // Example: Get recent articles
    const articles = await prisma.client.article.findMany({
      take: 5,
      orderBy: { publishedAt: 'desc' },
    });
    
    logger.log(`Found ${articles.length} recent articles`);
    
    // Example of what you could do with AI services:
    // for (const article of articles) {
    //   const summary = await aiService.generateCompletion(
    //     `Summarize this article: ${article.title}\n\n${article.content}`
    //   );
    //   logger.log(`Summary for "${article.title}": ${summary}`);
    // }
    
    logger.log('AI analysis example completed (placeholder)');
  },
};

export default script;
