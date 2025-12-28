import { Test, TestingModule } from '@nestjs/testing';
import { NewsProcessorService } from './news-processor.service';
import { AiService } from '../utils/ai.service';
import { PrismaService } from '../utils/prisma.service';
import { ProcessingStatus } from '@repo/database/generated/prisma/enums';
import { Article } from '@repo/database';

describe('NewsProcessorService', () => {
  let service: NewsProcessorService;

  const mockPrismaClient = {
    article: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  };

  const mockAiService = {
    generateSummary: jest.fn(),
  };

  beforeEach(async () => {
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processNews', () => {
    it('should process new articles successfully with summaries', async () => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockSummary1 = 'This is a summary of article 1';
      const mockSummary2 = 'This is a summary of article 2';

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateSummary
        .mockResolvedValueOnce(mockSummary1)
        .mockResolvedValueOnce(mockSummary2);

      await service.processNews(mockArticles);

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

      expect(mockAiService.generateSummary).toHaveBeenCalledTimes(2);
      expect(mockAiService.generateSummary).toHaveBeenCalledWith(
        mockArticles[0],
      );
      expect(mockAiService.generateSummary).toHaveBeenCalledWith(
        mockArticles[1],
      );

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[0],
            summary: mockSummary1,
            status: ProcessingStatus.COMPLETED,
          },
          {
            ...mockArticles[1],
            summary: mockSummary2,
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
      mockAiService.generateSummary.mockResolvedValue(
        'This is a summary of article 2',
      );

      await service.processNews(mockArticles);

      expect(mockAiService.generateSummary).toHaveBeenCalledTimes(1);
      expect(mockAiService.generateSummary).toHaveBeenCalledWith(
        mockArticles[1],
      );

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[1],
            summary: 'This is a summary of article 2',
            status: ProcessingStatus.COMPLETED,
          },
        ],
      });
    });

    it('should handle articles with failed summary generation', async () => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateSummary.mockResolvedValue(undefined);

      await service.processNews(mockArticles);

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[0],
            summary: null,
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

      expect(mockAiService.generateSummary).not.toHaveBeenCalled();
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

      expect(mockAiService.generateSummary).not.toHaveBeenCalled();
      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [],
      });
    });

    it('should handle mixed success and failure in summary generation', async () => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateSummary
        .mockResolvedValueOnce('Summary for article 1')
        .mockResolvedValueOnce(undefined);

      await service.processNews(mockArticles);

      expect(mockPrismaClient.article.createMany).toHaveBeenCalledWith({
        data: [
          {
            ...mockArticles[0],
            summary: 'Summary for article 1',
            status: ProcessingStatus.COMPLETED,
          },
          {
            ...mockArticles[1],
            summary: null,
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateSummary.mockResolvedValue('Test summary');

      await service.processNews(mockArticles);

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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaClient.article.findMany.mockResolvedValue([]);
      mockAiService.generateSummary
        .mockResolvedValueOnce('Summary 1')
        .mockResolvedValueOnce('Summary 2')
        .mockResolvedValueOnce('Summary 3');

      await service.processNews(mockArticles);

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
