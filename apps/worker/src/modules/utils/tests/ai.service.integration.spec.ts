import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai.service';
import { Article, ProcessingStatus, Category, Language } from '@repo/database';

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

  describe('generateMetadata - Real API Calls', () => {
    skipIfNoApiKey()(
      'should generate metadata for a real article with full content',
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const metadata = await service.generateMetadata(testArticle);

        // Verify the metadata was generated
        expect(metadata).toBeDefined();
        expect(metadata!.summary).toBeDefined();
        expect(typeof metadata!.summary).toBe('string');
        expect(metadata!.summary.length).toBeGreaterThan(0);
        expect(metadata!.category).toBeDefined();
        expect(Object.values(Category)).toContain(metadata!.category);
        expect(metadata!.language).toBeDefined();
        expect(Object.values(Language)).toContain(metadata!.language);
        expect(metadata!.keywords).toBeDefined();
        expect(Array.isArray(metadata!.keywords)).toBe(true);

        console.log('Generated metadata:', metadata);
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const metadata = await service.generateMetadata(testArticle);

        // Should still generate metadata from available data
        expect(metadata).toBeDefined();
        expect(typeof metadata!.summary).toBe('string');
        expect(metadata!.summary.length).toBeGreaterThan(0);
        expect(metadata!.category).toBeDefined();
        expect(metadata!.language).toBeDefined();
        expect(metadata!.keywords).toBeDefined();

        console.log('Generated metadata from title/description:', metadata);
      },
      30000,
    );

    skipIfNoApiKey()(
      'should fetch and generate metadata from a real accessible URL',
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const metadata = await service.generateMetadata(testArticle);

        expect(metadata).toBeDefined();
        expect(typeof metadata!.summary).toBe('string');
        expect(metadata!.summary.length).toBeGreaterThan(0);
        expect(metadata!.category).toBeDefined();
        expect(metadata!.language).toBeDefined();
        expect(metadata!.keywords).toBeDefined();

        console.log('Generated metadata from fetched content:', metadata);
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
            category: null,
            keywords: [],
            language: Language.EN,
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
            category: null,
            keywords: [],
            language: Language.EN,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const metadataResults = await Promise.all(
          articles.map((article) => service.generateMetadata(article)),
        );

        expect(metadataResults).toHaveLength(2);
        metadataResults.forEach((metadata, index) => {
          expect(metadata).toBeDefined();
          expect(typeof metadata!.summary).toBe('string');
          expect(metadata!.summary.length).toBeGreaterThan(0);
          expect(metadata!.category).toBeDefined();
          expect(metadata!.language).toBeDefined();
          expect(metadata!.keywords).toBeDefined();
          console.log(`Metadata ${index + 1}:`, metadata);
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Process with small delays to avoid overwhelming the API
        const metadataResults: (typeof service.generateMetadata extends (...args: any[]) => Promise<infer R> ? R : never)[] = [];
        for (const article of articles) {
          const metadata = await service.generateMetadata(article);
          metadataResults.push(metadata);
          // Small delay between requests
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // All should complete, even if some fail
        expect(metadataResults).toHaveLength(5);
        const successfulMetadata = metadataResults.filter(
          (m) => m && m.summary,
        );
        expect(successfulMetadata.length).toBeGreaterThan(0);

        console.log(
          `Successfully generated ${successfulMetadata.length}/5 metadata`,
        );
      },
      90000, // 90 seconds for multiple sequential calls
    );

    skipIfNoApiKey()(
      'should produce different metadata for different content',
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
          category: null,
          keywords: [],
          language: Language.EN,
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const [metadata1, metadata2] = await Promise.all([
          service.generateMetadata(article1),
          service.generateMetadata(article2),
        ]);

        expect(metadata1).toBeDefined();
        expect(metadata2).toBeDefined();

        // Summaries should be different for different content
        expect(metadata1!.summary).not.toBe(metadata2!.summary);
        // Categories might be different too
        
        console.log('Metadata 1 (ML):', metadata1);
        console.log('Metadata 2 (Cooking):', metadata2);
      },
      45000,
    );

    skipIfNoApiKey()(
      'should verify metadata quality and length constraints',
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const metadata = await service.generateMetadata(testArticle);

        expect(metadata).toBeDefined();
        expect(typeof metadata!.summary).toBe('string');

        // Verify summary meets quality expectations
        const summaryLength = metadata!.summary.length;
        expect(summaryLength).toBeGreaterThan(50); // At least a meaningful sentence
        expect(summaryLength).toBeLessThan(1000); // Not too long (should be 2-4 sentences)

        // Should contain actual content, not just empty strings
        expect(metadata!.summary.trim().length).toBeGreaterThan(0);

        // Verify other fields
        expect(metadata!.category).toBeDefined();
        expect(metadata!.language).toBeDefined();
        expect(Array.isArray(metadata!.keywords)).toBe(true);
        expect(metadata!.keywords.length).toBeGreaterThan(0);

        console.log('Quality metadata:', metadata);
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const metadata = await service.generateMetadata(testArticle);

        // Should still generate metadata from available data
        expect(metadata).toBeDefined();
        expect(typeof metadata!.summary).toBe('string');
        expect(metadata!.category).toBeDefined();
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const startTime = Date.now();
        const metadata = await service.generateMetadata(testArticle);
        const duration = Date.now() - startTime;

        expect(metadata).toBeDefined();
        expect(typeof metadata!.summary).toBe('string');

        // Should not wait forever - fetch should timeout reasonably
        expect(duration).toBeLessThan(30000); // 30 seconds max

        console.log(`Request completed in ${duration}ms`);
        console.log('Metadata:', metadata);
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
        // the service can successfully generate metadata
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
          category: null,
          keywords: [],
          language: Language.EN,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const metadata = await service.generateMetadata(testArticle);

        expect(metadata).toBeDefined();
        expect(metadata!.summary).toBeDefined();
        expect(metadata!.category).toBeDefined();
        expect(metadata!.language).toBeDefined();
        expect(metadata!.keywords).toBeDefined();

        // If we get valid metadata, it means the model and parameters are correctly configured
        console.log('Service is properly configured, generated:', metadata);
      },
      30000,
    );
  });
});
