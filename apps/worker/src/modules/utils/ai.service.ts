import Groq from 'groq-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { Article, Category, Language } from '@repo/database';
import * as cheerio from 'cheerio';

export interface ArticleMetadata {
  summary: string;
  category: Category;
  language: Language;
  keywords: string[];
}

@Injectable()
export class AiService {
  public readonly groq: Groq;
  private readonly logger = new Logger(AiService.name);

  constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY ?? '',
    });
  }

  /**
   * Fetches the content from a URL and extracts the main text
   */
  private async fetchArticleContent(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `Failed to fetch URL: ${url}, status: ${response.status}`,
        );
        return '';
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script, style, and other non-content elements
      $('script, style, nav, footer, header, aside, iframe').remove();

      // Try to find the main content area
      let mainContent =
        $('article').text() ||
        $('main').text() ||
        $('.content').text() ||
        $('.article-content').text() ||
        $('.post-content').text() ||
        $('body').text();

      // Clean up whitespace
      mainContent = mainContent
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      // Limit content to reasonable size (e.g., 10,000 characters)
      return mainContent.substring(0, 10000);
    } catch (error) {
      this.logger.error(`Error fetching article content from ${url}:`, error);
      return '';
    }
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private truncateToTokenLimit(content: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(content);
    if (estimatedTokens <= maxTokens) {
      return content;
    }

    const maxChars = maxTokens * 4;
    return content.substring(0, maxChars) + '...';
  }

  /**
   * Generates structured metadata for an article using AI
   */
  public async generateMetadata(
    article: Article,
  ): Promise<ArticleMetadata | undefined> {
    try {
      // Fetch the full article content from the URL
      const fetchedContent = await this.fetchArticleContent(article.url);

      // Reserve tokens for system prompt, user prompt template, and response
      // System prompt + template overhead: ~100 tokens
      // Response: 500 tokens (max_completion_tokens)
      // Safety margin: 100 tokens
      const OVERHEAD_TOKENS = 700;
      const MAX_INPUT_TOKENS = 10000 - OVERHEAD_TOKENS;

      const title = article.title ? `Title: ${article.title}` : '';
      const description = article.description
        ? `Description: ${article.description}`
        : '';

      const titleTokens = this.estimateTokens(title);
      const descriptionTokens = this.estimateTokens(description);
      const remainingTokens =
        MAX_INPUT_TOKENS - titleTokens - descriptionTokens;

      const truncatedContent = fetchedContent
        ? this.truncateToTokenLimit(fetchedContent, remainingTokens - 20)
        : '';

      const contentParts = [
        title,
        description,
        truncatedContent ? `Full Content: ${truncatedContent}` : '',
      ].filter((part) => part.length > 0);

      if (contentParts.length === 0) {
        this.logger.warn(`No content available for article: ${article.url}`);
        return undefined;
      }

      const contentToAnalyze = contentParts.join('\n\n');

      const finalTokenCount = this.estimateTokens(contentToAnalyze);
      this.logger.debug(
        `Content tokens for ${article.url}: ~${finalTokenCount} tokens`,
      );

      const availableCategories = Object.values(Category).join(', ');
      const availableLanguages = Object.values(Language).join(', ');

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert content analyzer. Analyze articles and provide structured metadata in valid JSON format. Pay special attention to the article title as it provides crucial context about the main topic. Return ONLY valid JSON, no other text or explanation.',
          },
          {
            role: 'user',
            content: `Analyze the following article and provide structured metadata.

Article URL: ${article.url}
${article.title ? `Article Title: ${article.title}` : ''}

${contentToAnalyze}

Provide the analysis in valid JSON format with these exact fields:
{
  "summary": "informative summaries that capture the key points and main ideas of articles. Keep summaries between 2-4 sentences. Use the article title as a primary guide to understand the article's focus and key message. Return ONLY the summary text without any preamble, introduction, or phrases like "Here is a summary" or "This article discusses". Start directly with the summary content.",
  "category": "One of: ${availableCategories}",
  "language": "One of: ${availableLanguages}",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

Rules:
- summary: 2-4 sentences, no preamble. Let the article title guide you to the main topic and ensure the summary aligns with it.
- category: Must match exactly one of the available categories. Consider the article title when determining the category.
- language: Must match exactly one of the available languages (EN, ES, or PT)
- keywords: Array of exactly 5 relevant keywords that reflect both the title and content
- Return ONLY valid JSON, no other text

JSON:`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_completion_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const responseContent = completion.choices[0]?.message?.content;

      if (!responseContent) {
        this.logger.warn(
          `No response content from AI for article: ${article.url}`,
        );
        return undefined;
      }

      const metadata = JSON.parse(responseContent) as ArticleMetadata;

      // Validate the metadata structure
      if (
        !metadata.summary ||
        !metadata.category ||
        !metadata.language ||
        !Array.isArray(metadata.keywords)
      ) {
        this.logger.error(
          `Invalid metadata structure for article ${article.url}:`,
          metadata,
        );
        return undefined;
      }

      // Validate category and language enums
      if (!Object.values(Category).includes(metadata.category as Category)) {
        this.logger.error(
          `Invalid category for article ${article.url}:`,
          metadata.category,
        );
        return undefined;
      }

      if (!Object.values(Language).includes(metadata.language as Language)) {
        this.logger.error(
          `Invalid language for article ${article.url}:`,
          metadata.language,
        );
        return undefined;
      }

      this.logger.log(`Generated metadata for article: ${article.url}`);
      return metadata;
    } catch (error) {
      this.logger.error(
        `Error generating metadata for article ${article.url}:`,
        error,
      );
    }
  }
}
