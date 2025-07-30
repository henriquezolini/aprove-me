import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { BatchProcessorService } from './batch-processor.service';
import { CreatePayableDto } from '../../../presentation/dtos/payables/payables.dto';

interface BatchData {
  batchId: string;
  payables: CreatePayableDto[];
  totalPayables: number;
  createdAt: Date;
}

@Controller()
export class BatchProcessorController {
  private readonly logger = new Logger(BatchProcessorController.name);

  constructor(private readonly batchProcessorService: BatchProcessorService) {}

  @EventPattern('payables_batch_queue')
  async handleBatchProcessing(@Payload() data: BatchData) {
    try {
      await this.batchProcessorService.processBatch(data);
    } catch (error) {}
  }
}
