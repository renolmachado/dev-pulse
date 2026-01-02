import { Script, ScriptContext } from '../scripts.service';

const script: Script = {
  name: 'batch-process-articles',
  description: 'Example of batch processing articles with progress tracking',
  
  async execute(context: ScriptContext) {
    const { prisma, logger } = context;
    
    logger.log('Starting batch processing...');
    
    // Get total count
    const totalCount = await prisma.client.article.count();
    logger.log(`Total articles to process: ${totalCount}`);
    
    // Process in batches
    const batchSize = 10;
    let processed = 0;
    
    while (processed < totalCount) {
      const batch = await prisma.client.article.findMany({
        skip: processed,
        take: batchSize,
        orderBy: { publishedAt: 'desc' },
      });
      
      logger.log(`Processing batch: ${processed + 1} to ${processed + batch.length}`);
      
      // Process each article in the batch
      for (const article of batch) {
        // Example processing
        logger.log(`  - Processing: ${article.title.substring(0, 50)}...`);
        
        // You could do things like:
        // - Generate summaries with AI
        // - Extract keywords
        // - Update metadata
        // - Calculate scores
        // await prisma.client.article.update({
        //   where: { id: article.id },
        //   data: { /* updated fields */ }
        // });
      }
      
      processed += batch.length;
      
      // Progress update
      const progress = Math.round((processed / totalCount) * 100);
      logger.log(`Progress: ${progress}% (${processed}/${totalCount})`);
      
      // Optional: Add delay between batches to avoid overwhelming the system
      // await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    logger.log(`✅ Batch processing completed! Processed ${processed} articles`);
  },
};

export default script;
