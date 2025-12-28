import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai.service';
import { Article, ProcessingStatus } from '@repo/database';

/**
 * Integration tests for AiService
 * These tests make actual API calls and network requests
 *
 * NOTE: These tests require:
 * - GROQ_API_KEY environment variable to be set
 * - Active internet connection
 * - They may consume API credits
 *
 * To run only integration tests:
 * jest --testPathPattern=integration.spec.ts
 *
 * To skip integration tests:
 * jest --testPathIgnorePatterns=integration.spec.ts
 */
describe('AiService Integration Tests', () => {
  let service: AiService;

  beforeAll(async () => {
    // Check if API key is available
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not set. Integration tests will be skipped.');
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  // Helper to skip tests if no API key
  const skipIfNoApiKey = () => {
    if (!process.env.GROQ_API_KEY) {
      return test.skip;
    }
    return test;
  };

  describe('generateSummary - Real API Calls', () => {
    skipIfNoApiKey()(
      'should generate a summary for a real article with full content',
      async () => {
        // Use a stable, public article for testing
        const testArticle: Article = {
          id: 'test-1',
          url: 'https://example.com', // Using example.com as it's always available
          title: 'Example Domain',
          description:
            'This domain is for use in illustrative examples in documents.',
          content:
            'Example Domain. This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const summary = await service.generateSummary(testArticle);

        // Verify the summary was generated
        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');
        expect(summary!.length).toBeGreaterThan(0);
        expect(summary).not.toBe('Error generating summary.');

        console.log('Generated summary:', summary);
      },
      30000, // 30 second timeout for API call
    );

    skipIfNoApiKey()(
      'should handle a real article with only title and description',
      async () => {
        const testArticle: Article = {
          id: 'test-2',
          url: 'https://invalid-url-that-will-fail.example.com/nonexistent',
          title: 'The Future of Artificial Intelligence',
          description:
            'Exploring how AI is transforming industries and society.',
          content: null,
          author: 'Test Author',
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const summary = await service.generateSummary(testArticle);

        // Should still generate a summary from available data
        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');
        expect(summary!.length).toBeGreaterThan(0);

        console.log('Generated summary from title/description:', summary);
      },
      30000,
    );

    skipIfNoApiKey()(
      'should fetch and summarize content from a real accessible URL',
      async () => {
        // Using a stable, public URL
        const testArticle: Article = {
          id: 'test-3',
          url: 'https://www.ietf.org/rfc/rfc2616.txt', // HTTP RFC - always available
          title: 'HTTP RFC 2616',
          description: 'Hypertext Transfer Protocol -- HTTP/1.1',
          content: null,
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const summary = await service.generateSummary(testArticle);

        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');
        expect(summary!.length).toBeGreaterThan(0);

        console.log('Generated summary from fetched content:', summary);
      },
      45000, // Longer timeout for fetch + API call
    );

    skipIfNoApiKey()(
      'should handle multiple consecutive requests',
      async () => {
        const articles: Article[] = [
          {
            id: 'test-batch-1',
            url: 'https://example.com',
            title: 'First Article',
            description: 'First article description for testing.',
            content: null,
            author: null,
            publishedAt: new Date(),
            urlToImage: null,
            summary: null,
            status: ProcessingStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'test-batch-2',
            url: 'https://example.org',
            title: 'Second Article',
            description: 'Second article description for testing.',
            content: null,
            author: null,
            publishedAt: new Date(),
            urlToImage: null,
            summary: null,
            status: ProcessingStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const summaries = await Promise.all(
          articles.map((article) => service.generateSummary(article)),
        );

        expect(summaries).toHaveLength(2);
        summaries.forEach((summary, index) => {
          expect(summary).toBeDefined();
          expect(typeof summary).toBe('string');
          expect(summary!.length).toBeGreaterThan(0);
          console.log(`Summary ${index + 1}:`, summary);
        });
      },
      60000, // 60 seconds for multiple API calls
    );

    skipIfNoApiKey()(
      'should handle rate limiting gracefully',
      async () => {
        // Test with a large batch to potentially trigger rate limiting
        const articles: Article[] = Array.from({ length: 5 }, (_, i) => ({
          id: `test-rate-${i}`,
          url: 'https://example.com',
          title: `Rate Limit Test Article ${i + 1}`,
          description: `Testing rate limiting with article ${i + 1}.`,
          content: null,
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Process with small delays to avoid overwhelming the API
        const summaries: (string | undefined)[] = [];
        for (const article of articles) {
          const summary = await service.generateSummary(article);
          summaries.push(summary);
          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // All should complete, even if some fail
        expect(summaries).toHaveLength(5);
        const successfulSummaries = summaries.filter(
          (s) => s && s !== 'Error generating summary.',
        );
        expect(successfulSummaries.length).toBeGreaterThan(0);

        console.log(
          `Successfully generated ${successfulSummaries.length}/5 summaries`,
        );
      },
      90000, // 90 seconds for multiple sequential calls
    );

    skipIfNoApiKey()(
      'should produce different summaries for different content',
      async () => {
        const article1: Article = {
          id: 'test-diff-1',
          url: 'https://example.com',
          title: 'Understanding Machine Learning',
          description:
            'A comprehensive guide to machine learning algorithms and their applications in modern technology.',
          content: null,
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const article2: Article = {
          id: 'test-diff-2',
          url: 'https://example.com',
          title: 'The Art of Cooking Pasta',
          description:
            'Traditional Italian methods for preparing perfect pasta dishes at home.',
          content: null,
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const [summary1, summary2] = await Promise.all([
          service.generateSummary(article1),
          service.generateSummary(article2),
        ]);

        expect(summary1).toBeDefined();
        expect(summary2).toBeDefined();

        // Summaries should be different for different content
        expect(summary1).not.toBe(summary2);

        console.log('Summary 1 (ML):', summary1);
        console.log('Summary 2 (Cooking):', summary2);
      },
      45000,
    );

    skipIfNoApiKey()(
      'should verify summary quality and length constraints',
      async () => {
        const testArticle: Article = {
          id: 'test-quality',
          url: 'https://example.com',
          title: 'Climate Change and Global Warming',
          description:
            'An in-depth analysis of climate change impacts, causes, and potential solutions for a sustainable future.',
          content:
            'Climate change represents one of the most significant challenges facing humanity. Rising global temperatures, melting ice caps, and extreme weather events are just some of the consequences we are witnessing.',
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const summary = await service.generateSummary(testArticle);

        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');

        // Verify summary meets quality expectations
        const summaryLength = summary!.length;
        expect(summaryLength).toBeGreaterThan(50); // At least a meaningful sentence
        expect(summaryLength).toBeLessThan(1000); // Not too long (should be 2-4 sentences)

        // Should not be just the error message
        expect(summary).not.toBe('Error generating summary.');

        // Should contain actual content, not just empty strings
        expect(summary!.trim().length).toBeGreaterThan(0);

        console.log('Quality summary:', summary);
        console.log('Summary length:', summaryLength);
      },
      30000,
    );
  });

  describe('Error Handling - Real Scenarios', () => {
    skipIfNoApiKey()(
      'should handle completely invalid URLs gracefully',
      async () => {
        const testArticle: Article = {
          id: 'test-invalid',
          url: 'not-a-valid-url-at-all',
          title: 'Test Article with Invalid URL',
          description: 'This article has an invalid URL format.',
          content: null,
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const summary = await service.generateSummary(testArticle);

        // Should still generate a summary from available data
        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');
      },
      30000,
    );

    skipIfNoApiKey()(
      'should handle URLs that timeout or are very slow',
      async () => {
        const testArticle: Article = {
          id: 'test-slow',
          url: 'https://httpstat.us/200?sleep=15000', // Intentionally slow endpoint
          title: 'Slow Loading Article',
          description: 'This article tests behavior with slow-loading content.',
          content: 'Some content that is available immediately.',
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const startTime = Date.now();
        const summary = await service.generateSummary(testArticle);
        const duration = Date.now() - startTime;

        expect(summary).toBeDefined();
        expect(typeof summary).toBe('string');

        // Should not wait forever - fetch should timeout reasonably
        expect(duration).toBeLessThan(30000); // 30 seconds max

        console.log(`Request completed in ${duration}ms`);
        console.log('Summary:', summary);
      },
      45000,
    );
  });

  describe('Groq Service Configuration', () => {
    skipIfNoApiKey()('should have proper Groq client initialization', () => {
      expect(service.groq).toBeDefined();
      expect(service.groq.chat).toBeDefined();
      expect(service.groq.chat.completions).toBeDefined();
    });

    skipIfNoApiKey()(
      'should use the correct model and parameters',
      async () => {
        // This test verifies the configuration indirectly by ensuring
        // the service can successfully generate summaries
        const testArticle: Article = {
          id: 'test-config',
          url: 'https://example.com',
          title: 'Configuration Test',
          description: 'Testing service configuration.',
          content: null,
          author: null,
          publishedAt: new Date(),
          urlToImage: null,
          summary: null,
          status: ProcessingStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const summary = await service.generateSummary(testArticle);

        expect(summary).toBeDefined();
        expect(summary).not.toBe('Error generating summary.');

        // If we get a valid summary, it means the model and parameters are correctly configured
        console.log('Service is properly configured, generated:', summary);
      },
      30000,
    );
  });
});
