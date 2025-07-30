import { Test, TestingModule } from '@nestjs/testing';
import { BatchProcessorService } from '../../../shared/utils/consumer/batch-processor.service';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { EmailService } from '../../../infrastructure/external/email/email.service';
import { CreatePayableDto } from '../../../presentation/dtos/payables/payables.dto';

describe('BatchProcessorService', () => {
  let service: BatchProcessorService;
  let prismaService: PrismaService;
  let emailService: EmailService;

  const mockPrismaService = {
    payable: {
      create: jest.fn(),
    },
  };

  const mockEmailService = {
    sendBatchCompletionEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BatchProcessorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<BatchProcessorService>(BatchProcessorService);
    prismaService = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processBatch', () => {
    it('deve processar lote com sucesso', async () => {
      const batchData = {
        batchId: 'batch-123',
        payables: [
          {
            value: 100.5,
            emissionDate: new Date('2024-01-01'),
            assignor: '550e8400-e29b-41d4-a716-446655440000',
          },
          {
            value: 200.75,
            emissionDate: new Date('2024-01-02'),
            assignor: '550e8400-e29b-41d4-a716-446655440001',
          },
        ] as CreatePayableDto[],
        totalPayables: 2,
        createdAt: new Date(),
      };

      mockPrismaService.payable.create.mockResolvedValue({
        id: 'payable-123',
        value: 100.5,
        emissionDate: new Date('2024-01-01'),
        assignorId: '550e8400-e29b-41d4-a716-446655440000',
      });

      mockEmailService.sendBatchCompletionEmail.mockResolvedValue(true);

      await service.processBatch(batchData);

      expect(mockPrismaService.payable.create).toHaveBeenCalledTimes(2);
      expect(mockEmailService.sendBatchCompletionEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          batchId: 'batch-123',
          totalPayables: 2,
          successCount: 2,
          failureCount: 0,
          errors: [],
        }),
      );
    });

    it('deve processar lote com falhas e sucessos', async () => {
      const batchData = {
        batchId: 'batch-456',
        payables: [
          {
            value: 100.5,
            emissionDate: new Date('2024-01-01'),
            assignor: '550e8400-e29b-41d4-a716-446655440000',
          },
          {
            value: -50, // valor inválido
            emissionDate: new Date('2024-01-02'),
            assignor: '550e8400-e29b-41d4-a716-446655440001',
          },
        ] as CreatePayableDto[],
        totalPayables: 2,
        createdAt: new Date(),
      };

      // Primeira chamada bem-sucedida
      mockPrismaService.payable.create.mockResolvedValueOnce({
        id: 'payable-123',
        value: 100.5,
        emissionDate: new Date('2024-01-01'),
        assignorId: '550e8400-e29b-41d4-a716-446655440000',
      });

      // Segunda chamada não vai acontecer porque o processPayable vai falhar na validação
      mockEmailService.sendBatchCompletionEmail.mockResolvedValue(true);

      await service.processBatch(batchData);

      // Só deve ter uma chamada para create, pois o segundo payable falha na validação
      expect(mockPrismaService.payable.create).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendBatchCompletionEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          batchId: 'batch-456',
          totalPayables: 2,
          successCount: 1,
          failureCount: 1,
          errors: expect.arrayContaining([
            expect.stringContaining('Error processing payable'),
          ]),
        }),
      );
    });

    it('deve continuar processamento mesmo se email falhar', async () => {
      const batchData = {
        batchId: 'batch-789',
        payables: [
          {
            value: 100.5,
            emissionDate: new Date('2024-01-01'),
            assignor: '550e8400-e29b-41d4-a716-446655440000',
          },
        ] as CreatePayableDto[],
        totalPayables: 1,
        createdAt: new Date(),
      };

      mockPrismaService.payable.create.mockResolvedValue({
        id: 'payable-123',
        value: 100.5,
        emissionDate: new Date('2024-01-01'),
        assignorId: '550e8400-e29b-41d4-a716-446655440000',
      });

      mockEmailService.sendBatchCompletionEmail.mockRejectedValue(
        new Error('Email service failed'),
      );

      // Não deve lançar erro mesmo se email falhar
      await expect(service.processBatch(batchData)).resolves.not.toThrow();

      expect(mockPrismaService.payable.create).toHaveBeenCalledTimes(1);
      expect(mockEmailService.sendBatchCompletionEmail).toHaveBeenCalledTimes(
        1,
      );
    });
  });
});
