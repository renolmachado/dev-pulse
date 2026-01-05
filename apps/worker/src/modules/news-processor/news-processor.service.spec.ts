/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { NewsProcessorService } from './news-processor.service';
import { AiService } from '../utils/ai.service';
import { PrismaService } from '../utils/prisma.service';
import { ProcessingStatus, Article, Category, Language } from '@repo/database';

describe('NewsProcessorService', () => {
  let service: NewsProcessorService;

  const mockPrismaClient = {
    article: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockAiService = {
    generateMetadata: jest.fn(),
  };

  beforeEach(async () => {
    jest.useFakeTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsProcessorService,
        {
          provide: AiService,
          useValue: mockAiService,
        },
        {
          provide: PrismaService,
          useValue: {
            client: mockPrismaClient,
          },
        },
      ],
    }).compile();

    service = module.get<NewsProcessorService>(NewsProcessorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processNews', () => {
    it('should process new articles successfully with metadata', async () => {
      const mockArticles = [
        {
          id: '1',
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          description: 'Description 1',
          content: 'Content 1',
          author: 'Author 1',
          publishedAt: new Date('2024-01-01'),
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
          id: '2',
          url: 'https://example.com/article2',
          title: 'Test Article 2',
          description: 'Description 2',
          content: 'Content 2',
          author: 'Author 2',
          publishedAt: new Date('2024-01-02'),
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

      const mockMetadata1 = {
        summary: 'This is a summary of article 1',
        category: Category.TECHNOLOGY_INNOVATION,
        language: Language.EN,
        keywords: ['tech', 'innovation', 'test', 'article', 'one'],
      };

      const mockMetadata2 = {
        summary: 'This is a summary of article 2',
        category: Category.SOFTWARE_ENGINEERING_DEVELOPMENT,
        language: Language.EN,
        keywords: ['software', 'engineering', 'test', 'article', 'two'],
      };

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateMetadata
        .mockResolvedValueOnce(mockMetadata1)
        .mockResolvedValueOnce(mockMetadata2);

      const processPromise = service.processNews(mockArticles);

      // Fast-forward through all timers
      await jest.runAllTimersAsync();

      await processPromise;

      expect(mockPrismaClient.article.findMany).toHaveBeenCalledWith({
        where: {
          url: {
            in: [
              'https://example.com/article1',
              'https://example.com/article2',
            ],
          },
        },
      });

      expect(mockAiService.generateMetadata).toHaveBeenCalledTimes(2);
      expect(mockAiService.generateMetadata).toHaveBeenCalledWith(
        mockArticles[0],
      );
      expect(mockAiService.generateMetadata).toHaveBeenCalledWith(
        mockArticles[1],
      );

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[0],
            summary: mockMetadata1.summary,
            category: mockMetadata1.category,
            language: mockMetadata1.language,
            keywords: mockMetadata1.keywords,
            status: ProcessingStatus.COMPLETED,
          },
          {
            ...mockArticles[1],
            summary: mockMetadata2.summary,
            category: mockMetadata2.category,
            language: mockMetadata2.language,
            keywords: mockMetadata2.keywords,
            status: ProcessingStatus.COMPLETED,
          },
        ],
      });
    });

    it('should skip articles that already exist in the database', async () => {
      const mockArticles = [
        {
          id: '1',
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          description: 'Description 1',
          content: 'Content 1',
          author: 'Author 1',
          publishedAt: new Date('2024-01-01'),
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
          id: '2',
          url: 'https://example.com/article2',
          title: 'Test Article 2',
          description: 'Description 2',
          content: 'Content 2',
          author: 'Author 2',
          publishedAt: new Date('2024-01-02'),
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

      const existingArticles = [
        {
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          summary: 'Existing summary',
          status: ProcessingStatus.COMPLETED,
        },
      ];

      const mockMetadata = {
        summary: 'This is a summary of article 2',
        category: Category.TECHNOLOGY_INNOVATION,
        language: Language.EN,
        keywords: ['tech', 'test', 'article', 'two', 'keywords'],
      };

      mockPrismaClient.article.findMany.mockResolvedValue(existingArticles);
      mockAiService.generateMetadata.mockResolvedValue(mockMetadata);

      const processPromise = service.processNews(mockArticles);
      await jest.runAllTimersAsync();
      await processPromise;

      expect(mockAiService.generateMetadata).toHaveBeenCalledTimes(1);
      expect(mockAiService.generateMetadata).toHaveBeenCalledWith(
        mockArticles[1],
      );

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[1],
            summary: mockMetadata.summary,
            category: mockMetadata.category,
            language: mockMetadata.language,
            keywords: mockMetadata.keywords,
            status: ProcessingStatus.COMPLETED,
          },
        ],
      });
    });

    it('should handle articles with failed metadata generation', async () => {
      const mockArticles = [
        {
          id: '1',
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          description: 'Description 1',
          content: 'Content 1',
          author: 'Author 1',
          publishedAt: new Date('2024-01-01'),
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

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateMetadata.mockResolvedValue(undefined);

      const processPromise = service.processNews(mockArticles);
      await jest.runAllTimersAsync();
      await processPromise;

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[0],
            summary: null,
            category: null,
            language: Language.EN,
            keywords: [],
            status: ProcessingStatus.FAILED,
          },
        ],
      });
    });

    it('should handle empty article list', async () => {
      const mockArticles: Article[] = [];

      mockPrismaClient.article.findMany.mockResolvedValue([]);

      await service.processNews(mockArticles);

      expect(mockPrismaClient.article.findMany).toHaveBeenCalledWith({
        where: {
          url: {
            in: [],
          },
        },
      });

      expect(mockAiService.generateMetadata).not.toHaveBeenCalled();
      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [],
      });
    });

    it('should handle all articles already existing in database', async () => {
      const mockArticles = [
        {
          id: '1',
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          description: 'Description 1',
          content: 'Content 1',
          author: 'Author 1',
          publishedAt: new Date('2024-01-01'),
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

      const existingArticles = [
        {
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          summary: 'Existing summary',
          status: ProcessingStatus.COMPLETED,
        },
      ];

      mockPrismaClient.article.findMany.mockResolvedValue(existingArticles);

      await service.processNews(mockArticles);

      expect(mockAiService.generateMetadata).not.toHaveBeenCalled();
      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [],
      });
    });

    it('should handle mixed success and failure in metadata generation', async () => {
      const mockArticles = [
        {
          id: '1',
          url: 'https://example.com/article1',
          title: 'Test Article 1',
          description: 'Description 1',
          content: 'Content 1',
          author: 'Author 1',
          publishedAt: new Date('2024-01-01'),
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
          id: '2',
          url: 'https://example.com/article2',
          title: 'Test Article 2',
          description: 'Description 2',
          content: 'Content 2',
          author: 'Author 2',
          publishedAt: new Date('2024-01-02'),
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

      const mockMetadata = {
        summary: 'Summary for article 1',
        category: Category.TECHNOLOGY_INNOVATION,
        language: Language.EN,
        keywords: ['tech', 'test', 'article', 'one', 'keywords'],
      };

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateMetadata
        .mockResolvedValueOnce(mockMetadata)
        .mockResolvedValueOnce(undefined);

      const processPromise = service.processNews(mockArticles);
      await jest.runAllTimersAsync();
      await processPromise;

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[0],
            summary: mockMetadata.summary,
            category: mockMetadata.category,
            language: mockMetadata.language,
            keywords: mockMetadata.keywords,
            status: ProcessingStatus.COMPLETED,
          },
          {
            ...mockArticles[1],
            summary: null,
            category: null,
            language: Language.EN,
            keywords: [],
            status: ProcessingStatus.FAILED,
          },
        ],
      });
    });

    it('should handle articles with null URLs', async () => {
      const mockArticles = [
        {
          id: '1',
          url: '', // Empty string instead of null since url is required
          title: 'Test Article',
          description: 'Description',
          content: 'Content',
          author: 'Author',
          publishedAt: new Date('2024-01-01'),
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

      const mockMetadata = {
        summary: 'Test summary',
        category: Category.TECHNOLOGY_INNOVATION,
        language: Language.EN,
        keywords: ['test', 'article', 'keywords', 'example', 'mock'],
      };

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateMetadata.mockResolvedValue(mockMetadata);

      const processPromise = service.processNews(mockArticles);
      await jest.runAllTimersAsync();
      await processPromise;

      expect(mockPrismaClient.article.findMany).toHaveBeenCalledWith({
        where: {
          url: {
            in: [''],
          },
        },
      });
    });

    it('should process articles sequentially and maintain order', async () => {
      const mockArticles = [
        {
          id: '1',
          url: 'https://example.com/article1',
          title: 'Article 1',
          description: 'Description 1',
          content: 'Content 1',
          author: 'Author 1',
          publishedAt: new Date('2024-01-01'),
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
          id: '2',
          url: 'https://example.com/article2',
          title: 'Article 2',
          description: 'Description 2',
          content: 'Content 2',
          author: 'Author 2',
          publishedAt: new Date('2024-01-02'),
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
          id: '3',
          url: 'https://example.com/article3',
          title: 'Article 3',
          description: 'Description 3',
          content: 'Content 3',
          author: 'Author 3',
          publishedAt: new Date('2024-01-03'),
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

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateMetadata
        .mockResolvedValueOnce({
          summary: 'Summary 1',
          category: Category.TECHNOLOGY_INNOVATION,
          language: Language.EN,
          keywords: ['one', 'test', 'article', 'mock', 'keywords'],
        })
        .mockResolvedValueOnce({
          summary: 'Summary 2',
          category: Category.SOFTWARE_ENGINEERING_DEVELOPMENT,
          language: Language.EN,
          keywords: ['two', 'test', 'article', 'mock', 'keywords'],
        })
        .mockResolvedValueOnce({
          summary: 'Summary 3',
          category: Category.BUSINESS_FINANCE,
          language: Language.EN,
          keywords: ['three', 'test', 'article', 'mock', 'keywords'],
        });

      const processPromise = service.processNews(mockArticles);
      await jest.runAllTimersAsync();
      await processPromise;

      const createManyCalls = mockPrismaClient.article.createMany.mock
        .calls as unknown as [[{ data: Article[] }]];
      const createManyCall = createManyCalls[0];
      if (createManyCall?.[0]) {
        const callData = createManyCall[0];
        expect(callData.data).toHaveLength(3);
        expect(callData.data[0]?.url).toBe('https://example.com/article1');
        expect(callData.data[1]?.url).toBe('https://example.com/article2');
        expect(callData.data[2]?.url).toBe('https://example.com/article3');
      }
    });
  });
});
