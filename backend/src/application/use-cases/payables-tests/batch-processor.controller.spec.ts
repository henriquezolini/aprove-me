import { Test, TestingModule } from '@nestjs/testing';
import { BatchProcessorController } from '../../../shared/utils/consumer/batch-processor.controller';
import { BatchProcessorService } from '../../../shared/utils/consumer/batch-processor.service';
import { Logger } from '@nestjs/common';

describe('BatchProcessorController', () => {
  let controller: BatchProcessorController;
  let service: BatchProcessorService;
  let logger: Logger;

  const mockBatchProcessorService = {
    processBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchProcessorController],
      providers: [
        {
          provide: BatchProcessorService,
          useValue: mockBatchProcessorService,
        },
      ],
    }).compile();

    controller = module.get<BatchProcessorController>(BatchProcessorController);
    service = module.get<BatchProcessorService>(BatchProcessorService);
    logger = new Logger(BatchProcessorController.name);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleBatchProcessing', () => {
    const mockBatchData = {
      batchId: 'test-batch-123',
      payables: [
        {
          value: 100,
          emissionDate: new Date(),
          assignor: '11111111-1111-1111-1111-111111111111',
        },
      ],
      totalPayables: 1,
      createdAt: new Date(),
    };

    it('should process batch successfully', async () => {
      mockBatchProcessorService.processBatch.mockResolvedValue(undefined);

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await controller.handleBatchProcessing(mockBatchData);

      expect(mockBatchProcessorService.processBatch).toHaveBeenCalledWith(
        mockBatchData,
      );
      expect(mockBatchProcessorService.processBatch).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Processing batch ${mockBatchData.batchId}`,
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Batch ${mockBatchData.batchId} processed successfully`,
      );
    });

    it('should handle batch processing errors', async () => {
      const error = new Error('Processing failed');
      mockBatchProcessorService.processBatch.mockRejectedValue(error);

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await controller.handleBatchProcessing(mockBatchData);

      expect(mockBatchProcessorService.processBatch).toHaveBeenCalledWith(
        mockBatchData,
      );
      expect(mockBatchProcessorService.processBatch).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Processing batch ${mockBatchData.batchId}`,
      );
      expect(errorSpy).toHaveBeenCalledWith(
        `Error processing batch ${mockBatchData.batchId}: ${error.message}`,
      );
    });

    it('should handle batch processing with empty payables', async () => {
      const emptyBatchData = {
        ...mockBatchData,
        payables: [],
        totalPayables: 0,
      };

      mockBatchProcessorService.processBatch.mockResolvedValue(undefined);

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await controller.handleBatchProcessing(emptyBatchData);

      expect(mockBatchProcessorService.processBatch).toHaveBeenCalledWith(
        emptyBatchData,
      );
      expect(mockBatchProcessorService.processBatch).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(
        `Processing batch ${emptyBatchData.batchId}`,
      );
      expect(logSpy).toHaveBeenCalledWith(
        `Batch ${emptyBatchData.batchId} processed successfully`,
      );
    });
  });
});
