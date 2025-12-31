import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from '../ai.service';
import { Article, ProcessingStatus } from '@repo/database';

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

  describe('generateSummary', () => {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should generate a summary successfully with all content', async () => {
      const mockHtml =
        '<article><p>This is the full article content</p></article>';
      const mockSummary = 'This is a test summary of the article.';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      // Mock cheerio
      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'This is the full article content',
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockSummary,
            },
          },
        ],
      });

      const result = await service.generateSummary(mockArticle);

      expect(result).toBe(mockSummary);
      expect(global.fetch).toHaveBeenCalledWith(mockArticle.url, {
        headers: {
          'User-Agent': expect.stringContaining('Mozilla/5.0'),
        },
      });
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalledWith({
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('professional content summarizer'),
          },
          {
            role: 'user',
            content: expect.stringContaining('Test Article Title'),
          },
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        temperature: 0.5,
        max_completion_tokens: 500,
      });
    });

    it('should handle fetch failure gracefully', async () => {
      const mockSummary = 'Summary from available data only.';

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
              content: mockSummary,
            },
          },
        ],
      });

      const result = await service.generateSummary(mockArticle);

      expect(result).toBe(mockSummary);
      // Should still call Groq with available article data
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalled();
    });

    it('should handle fetch exception gracefully', async () => {
      const mockSummary = 'Summary from available data only.';

      // Mock fetch throwing an error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: mockSummary,
            },
          },
        ],
      });

      const result = await service.generateSummary(mockArticle);

      expect(result).toBe(mockSummary);
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

      const result = await service.generateSummary(articleWithoutContent);

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

      const result = await service.generateSummary(mockArticle);

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

      const result = await service.generateSummary(mockArticle);

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

      const result = await service.generateSummary(mockArticle);

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
              content: 'Generated summary',
            },
          },
        ],
      });

      await service.generateSummary(mockArticle);

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

    it('should limit fetched content to 10000 characters', async () => {
      const longContent = 'a'.repeat(15000);
      const mockHtml = `<article><p>${longContent}</p></article>`;

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: longContent,
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Summary of long content',
            },
          },
        ],
      });

      const result = await service.generateSummary(mockArticle);

      expect(result).toBe('Summary of long content');

      // Verify the content passed to Groq is limited
      const callArgs =
        mockGroqInstance.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');
      expect(userMessage.content.length).toBeLessThan(15000);
    });

    it('should combine multiple content sources correctly', async () => {
      const mockHtml = '<article><p>Fetched content</p></article>';

      // Mock fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockHtml),
      });

      const cheerio = require('cheerio');
      cheerio.load = createCheerioMock({
        article: 'Fetched content',
      });

      // Mock Groq API response
      mockGroqInstance.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Combined summary',
            },
          },
        ],
      });

      await service.generateSummary(mockArticle);

      const callArgs =
        mockGroqInstance.chat.completions.create.mock.calls[0][0];
      const userMessage = callArgs.messages.find((m: any) => m.role === 'user');

      // Verify all content sources are included
      expect(userMessage.content).toContain('Title: Test Article Title');
      expect(userMessage.content).toContain('Description: Test description');
      expect(userMessage.content).toContain('Full Content: Fetched content');
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
              content: 'Summary from title only',
            },
          },
        ],
      });

      const result = await service.generateSummary(minimalArticle);

      expect(result).toBe('Summary from title only');
      expect(mockGroqInstance.chat.completions.create).toHaveBeenCalled();
    });
  });
});
