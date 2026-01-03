import { Article, ProcessingStatus } from '@repo/database';
import { Script, ScriptContext } from '../scripts.service';
import { Category, Language } from '@prisma/client';

const BATCH_SIZE = 100;
const DELAY_BETWEEN_BATCHES = 3000;

const markArticleAsFailed = async (prisma: any, articleId: string, failedCount: { value: number }) => {
  await prisma.client.article.update({
    where: { id: articleId },
    data: { status: ProcessingStatus.FAILED },
  });
  failedCount.value++;
};

interface ArticleMetadata {
  summary: string;
  category: Category;
  language: Language;
  keywords: string[];
}

const generateArticleMetadata = async (article: Article): Promise<ArticleMetadata | null> => {
  const availableCategories = Object.values(Category).join(', ');
  const availableLanguages = Object.values(Language).join(', ');

  const prompt = `You are an expert content analyzer. Analyze the article from the following URL and provide structured metadata.

Article URL: ${article.url}

Provide the analysis in valid JSON format with these exact fields:
{
  "summary": "informative summaries that capture the key points and main ideas of articles. Keep summaries between 2-4 sentences. Return ONLY the summary text without any preamble, introduction, or phrases like "Here is a summary" or "This article discusses". Start directly with the summary content.",
  "category": "One of: ${availableCategories}",
  "language": "One of: ${availableLanguages}",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Rules:
- summary: 2-4 sentences, no preamble
- category: Must match exactly one of the available categories
- language: Must match exactly one of the available languages (EN, ES, or PT)
- keywords: Array of exactly 5 relevant keywords
- Return ONLY valid JSON, no other text

JSON:`;

  try {
    const response = await fetch(`${process.env.AI_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemma3:4b',
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      console.error(`AI API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();
    const aiResponse = data.response;

    if (!aiResponse) {
      console.error('No response from AI API');
      return null;
    }

    const metadata = JSON.parse(aiResponse) as ArticleMetadata;

    if (!metadata.summary || !metadata.category || !metadata.language || !Array.isArray(metadata.keywords)) {
      console.error('Invalid metadata structure:', metadata);
      return null;
    }

    if (!Object.values(Category).includes(metadata.category as Category)) {
      console.error('Invalid category:', metadata.category);
      return null;
    }

    if (!Object.values(Language).includes(metadata.language as Language)) {
      console.error('Invalid language:', metadata.language);
      return null;
    }

    return metadata;
  } catch (error) {
    console.error('Error generating article metadata:', error);
    return null;
  }
};

const script: Script = {
  name: 'fill missing articles data',
  description: 'Process articles with missing data using AI to generate summary, category, language, and keywords',
  execute: async (context: ScriptContext) => {
    const { prisma, logger } = context;

    logger.log('Starting to process articles with missing data...');

    const articlesNeedingProcessing = await prisma.client.article.findMany({
      where: {
        OR: [{ status: ProcessingStatus.FAILED }, { summary: null }, { category: null }, { keywords: { isEmpty: true } }],
      },
      orderBy: { publishedAt: 'desc' },
    });

    logger.log(`Found ${articlesNeedingProcessing.length} articles needing processing`);

    if (articlesNeedingProcessing.length === 0) {
      logger.log('No articles to process. Exiting...');
      return;
    }

    let processedCount = 0;
    let successCount = 0;
    const failedCount = { value: 0 };

    for (let i = 0; i < articlesNeedingProcessing.length; i += BATCH_SIZE) {
      const batch = articlesNeedingProcessing.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(articlesNeedingProcessing.length / BATCH_SIZE);

      logger.log(`\n🔄 Processing batch ${batchNumber}/${totalBatches} (${batch.length} articles)`);

      for (const article of batch) {
        processedCount++;
        logger.log(`\n[${processedCount}/${articlesNeedingProcessing.length}] Processing: ${article.title || article.url}`);

        try {
          // Generate metadata using AI
          const metadata = await generateArticleMetadata(article);

          if (metadata === null) {
            logger.warn(`❌ Failed to generate metadata for article: ${article.url}`);
            await markArticleAsFailed(prisma, article.id, failedCount);
            continue;
          }

          // Update article with generated metadata
          await prisma.client.article.update({
            where: { id: article.id },
            data: {
              summary: metadata.summary,
              category: metadata.category,
              language: metadata.language,
              keywords: metadata.keywords,
              status: ProcessingStatus.COMPLETED,
            },
          });

          logger.log(`✅ Successfully processed article ${article.id}`);
          logger.log(`   Summary: ${metadata.summary.substring(0, 100)}...`);
          logger.log(`   Category: ${metadata.category}`);
          logger.log(`   Language: ${metadata.language}`);
          logger.log(`   Keywords: ${metadata.keywords.join(', ')}`);

          successCount++;
        } catch (error) {
          logger.error(`❌ Error processing article ${article.url}:`, error);
          await markArticleAsFailed(prisma, article.id, failedCount);
        }
      }

      // Delay between batches
      if (i + BATCH_SIZE < articlesNeedingProcessing.length) {
        logger.log(`\n⏳ Batch ${batchNumber} complete. Waiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    logger.log('\n' + '='.repeat(60));
    logger.log('📊 Processing Summary:');
    logger.log(`   Total articles processed: ${processedCount}`);
    logger.log(`   ✅ Successful: ${successCount}`);
    logger.log(`   ❌ Failed: ${failedCount.value}`);
    logger.log(`   Success rate: ${((successCount / processedCount) * 100).toFixed(1)}%`);
    logger.log('='.repeat(60));
  },
};

export default script;
