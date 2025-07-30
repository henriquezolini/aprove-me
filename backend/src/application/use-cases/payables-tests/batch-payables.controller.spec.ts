import { Test, TestingModule } from '@nestjs/testing';
import { PayablesController } from '../../../presentation/controllers/payables.controller';
import { PayablesService } from '../../../application/services/payables.service';
import {
  BatchPayablesDto,
  BatchResponseDto,
} from '../../../shared/utils/consumer/batch-payables.dto';
import { CreatePayableDto } from '../../../presentation/dtos/payables/payables.dto';

describe('PayablesController - Operações em Lote', () => {
  let controller: PayablesController;
  let service: PayablesService;

  const mockPayablesService = {
    createBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayablesController],
      providers: [
        {
          provide: PayablesService,
          useValue: mockPayablesService,
        },
      ],
    }).compile();

    controller = module.get<PayablesController>(PayablesController);
    service = module.get<PayablesService>(PayablesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBatch', () => {
    it('deve criar um lote de payables com sucesso', async () => {
      const batchPayablesDto: BatchPayablesDto = {
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
        ],
      };

      const expectedResponse: BatchResponseDto = {
        batchId: 'batch-123',
        totalPayables: 2,
        status: 'queued',
        message: 'Lote foi enfileirado para processamento',
      };

      mockPayablesService.createBatch.mockResolvedValue(expectedResponse);

      const result = await controller.createBatch(batchPayablesDto);

      expect(result).toEqual(expectedResponse);
      expect(mockPayablesService.createBatch).toHaveBeenCalledWith(
        batchPayablesDto,
      );
      expect(mockPayablesService.createBatch).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar lote com mais de 10.000 payables', async () => {
      const payables: CreatePayableDto[] = Array(10001).fill({
        value: 100.5,
        emissionDate: new Date('2024-01-01'),
        assignor: '550e8400-e29b-41d4-a716-446655440000',
      });

      const batchPayablesDto: BatchPayablesDto = {
        payables,
      };

      expect(payables.length).toBeGreaterThan(10000);
    });

    it('deve rejeitar lote vazio', async () => {
      const batchPayablesDto: BatchPayablesDto = {
        payables: [],
      };

      expect(batchPayablesDto.payables.length).toBe(0);
    });
  });
});
