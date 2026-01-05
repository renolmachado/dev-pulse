import { Test, TestingModule } from '@nestjs/testing';
import { AiService, ArticleMetadata } from '../ai.service';
import { Article, ProcessingStatus, Category, Language } from '@repo/database';

// Mock Groq SDK
jest.mock('groq-sdk');

// Mock cheerio
jest.mock('cheerio', () => {
  return {
    load: jest.fn(),
  };
});

// Mock global fetch
global.fetch = jest.fn();

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */

describe('AiService', () => {
  let service: AiService;
  let mockGroqInstance: any;

  // Helper function to create a cheerio mock
  const createCheerioMock = (contentMap: Record<string, string>) => {
    return jest.fn(() => {
      const $ = jest.fn((selector: string) => {
        return {
          text: () => contentMap[selector] || '',
          remove: jest.fn(),
        };
      }) as any;
      return $;
    });
  };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a mock Groq instance
    mockGroqInstance = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    // Mock the Groq constructor
    const Groq = require('groq-sdk');
    Groq.mockImplementation(() => mockGroqInstance);

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a groq instance', () => {
    expect(service.groq).toBeDefined();
  });

  describe('generateMetadata', () => {
    const mockArticle: Article = {
      id: '1',
      url: 'https://example.com/article',
      title: 'Test Article Title',
      description: 'Test description',
      content: 'Test content preview',
      author: 'Test Author',
      publishedAt: new Date('2024-01-01'),
      urlToImage: null,
      summary: null,
      status: ProcessingStatus.PENDING,
      category: null,
      keywords: [],
      language: Language.EN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockMetadata: ArticleMetadata = {
      summary: 'This is a test summary of the article.',
      category: Category.TECHNOLOGY_INNOVATION,
      language: Language.EN,
      keywords: ['test', 'article', 'technology', 'innovation', 'software'],
    };

    it('should generate metadata successfully with all content', async () => {
      const mockHtml =
        '<article><p>This is the full article content about technology and innovation</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      // Mock cheerio
      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article:
          'This is the full article content about technology and innovation',
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMetadata),
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toEqual(mockMetadata);
      expect(global.fetch).toHaveBeenCalledWith(mockArticle.url, {
        headers: {
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        },
      });
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalledWith({
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('expert content analyzer'),
          },
          {
            role: 'user',
            content: expect.stringContaining('Test Article Title'),
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_completion_tokens: 500,
        response_format: { type: 'json_object' },
      });
    });

    it('should handle fetch failure gracefully', async () => {
      // Mock fetch failure
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMetadata),
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toEqual(mockMetadata);
      // Should still call Groq with available article data
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalled();
    });

    it('should handle fetch exception gracefully', async () => {
      // Mock fetch throwing an error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMetadata),
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toEqual(mockMetadata);
      // Should still call Groq with available article data
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalled();
    });

    it('should return undefined when no content is available', async () => {
      const articleWithoutContent: Article = {
        id: '1',
        url: 'https://example.com/article',
        title: null,
        description: null,
        content: null,
        author: null,
        publishedAt: new Date('2024-01-01'),
        urlToImage: null,
        summary: null,
        status: ProcessingStatus.PENDING,
        category: null,
        keywords: [],
        language: Language.EN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fetch returning empty content
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue('<html></html>'),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({});

      const result = await service.generateMetadata(articleWithoutContent);

      expect(result).toBeUndefined();
      expect(mockGroqInstance.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should handle Groq API errors and return undefined', async () => {
      const mockHtml = '<article><p>Article content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Article content',
      });

      // Mock Groq API throwing an error
      mockGroqInstance.chat.completions.create.mockRejectedValue(
        new Error('API rate limit exceeded'),
      );

      const result = await service.generateMetadata(mockArticle);

      expect(result).toBeUndefined();
    });

    it('should handle empty Groq response', async () => {
      const mockHtml = '<article><p>Article content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Article content',
      });

      // Mock Groq API returning empty response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toBeUndefined();
    });

    it('should handle Groq response with null content', async () => {
      const mockHtml = '<article><p>Article content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Article content',
      });

      // Mock Groq API returning null content
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toBeUndefined();
    });

    it('should validate metadata structure and return undefined for invalid data', async () => {
      const mockHtml = '<article><p>Article content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Article content',
      });

      // Mock Groq API returning invalid metadata (missing fields)
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({ summary: 'Only summary' }),
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toBeUndefined();
    });

    it('should validate category enum and return undefined for invalid category', async () => {
      const mockHtml = '<article><p>Article content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Article content',
      });

      // Mock Groq API returning invalid category
      const invalidMetadata = {
        summary: 'Test summary',
        category: 'INVALID_CATEGORY',
        language: Language.EN,
        keywords: ['test', 'keywords', 'array', 'valid', 'five'],
      };

      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidMetadata),
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toBeUndefined();
    });

    it('should validate language enum and return undefined for invalid language', async () => {
      const mockHtml = '<article><p>Article content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Article content',
      });

      // Mock Groq API returning invalid language
      const invalidMetadata = {
        summary: 'Test summary',
        category: Category.TECHNOLOGY_INNOVATION,
        language: 'INVALID_LANGUAGE',
        keywords: ['test', 'keywords', 'array', 'valid', 'five'],
      };

      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(invalidMetadata),
            },
          },
        ],
      });

      const result = await service.generateMetadata(mockArticle);

      expect(result).toBeUndefined();
    });

    it('should use article title, description, and content when available', async () => {
      // Mock fetch returning empty
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMetadata),
            },
          },
        ],
      });

      await service.generateMetadata(mockArticle);

      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringMatching(/Title: Test Article Title/),
            }),
          ]),
        }),
      );
    });

    it('should include available categories and languages in prompt', async () => {
      // Mock fetch returning empty
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMetadata),
            },
          },
        ],
      });

      await service.generateMetadata(mockArticle);

      const callArgs =
        mockGroqInstance.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      expect(userMessage.content).toContain('TECHNOLOGY_INNOVATION');
      expect(userMessage.content).toContain('EN, ES, PT');
    });

    it('should work with minimal article data', async () => {
      const minimalArticle: Article = {
        id: '1',
        url: 'https://example.com/article',
        title: 'Only Title',
        description: null,
        content: null,
        author: null,
        publishedAt: new Date('2024-01-01'),
        urlToImage: null,
        summary: null,
        status: ProcessingStatus.PENDING,
        category: null,
        keywords: [],
        language: Language.EN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock fetch failure
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMetadata),
            },
          },
        ],
      });

      const result = await service.generateMetadata(minimalArticle);

      expect(result).toEqual(mockMetadata);
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalled();
    });
  });
});
