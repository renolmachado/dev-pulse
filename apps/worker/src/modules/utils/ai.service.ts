import Groq from 'groq-sdk';
import { Injectable, Logger } from '@nestjs/common';
import { Article } from '@repo/database';
import * as cheerio from 'cheerio';

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
   * Generates a summary of an article using AI
   */
  public async generateSummary(article: Article): Promise<string | undefined> {
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

      const contentToSummarize = contentParts.join('\n\n');

      const finalTokenCount = this.estimateTokens(contentToSummarize);
      this.logger.debug(
        `Content tokens for ${article.url}: ~${finalTokenCount} tokens`,
      );

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are a professional content summarizer. Create concise, informative summaries that capture the key points and main ideas of articles. Keep summaries between 2-4 sentences.',
          },
          {
            role: 'user',
            content: `Please summarize the following article:\n\n${contentToSummarize}`,
          },
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.5,
        max_completion_tokens: 500,
      });

      const summary = completion.choices[0]?.message?.content || undefined;

      this.logger.log(`Generated summary for article: ${article.url}`);
      return summary;
    } catch (error) {
      this.logger.error(
        `Error generating summary for article ${article.url}:`,
        error,
      );
    }
  }
}
