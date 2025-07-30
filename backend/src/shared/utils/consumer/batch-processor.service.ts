import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { EmailService } from '../../../infrastructure/external/email/email.service';
import { CreatePayableDto } from '../../../presentation/dtos/payables/payables.dto';
import { BatchProcessingResultDto } from './batch-payables.dto';

interface BatchData {
  batchId: string;
  payables: CreatePayableDto[];
  totalPayables: number;
  createdAt: Date;
}

@Injectable()
export class BatchProcessorService {
  private readonly logger = new Logger(BatchProcessorService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async processBatch(data: BatchData): Promise<BatchProcessingResultDto> {
    const result: BatchProcessingResultDto = {
      batchId: data.batchId,
      totalPayables: data.totalPayables,
      successCount: 0,
      failureCount: 0,
      errors: [],
      processedAt: new Date(),
    };

    for (const payableData of data.payables) {
      try {
        await this.processPayable(payableData);
        result.successCount++;
      } catch (error) {
        result.failureCount++;
        result.errors.push(`Error processing payable: ${error.message}`);
      }
    }

    await this.sendBatchCompletionEmail(result);

    return result;
  }

  private async processPayable(payableData: CreatePayableDto) {
    try {
      const { value, emissionDate, assignor } = payableData;

      if (value <= 0) {
        throw new Error('The value must be greater than zero');
      }

      if (new Date(emissionDate) > new Date()) {
        throw new Error('The emission date cannot be in the future');
      }

      await this.prisma.payable.create({
        data: {
          value,
          emissionDate: new Date(emissionDate),
          assignorId: assignor,
        },
      });
    } catch (error) {
      throw new Error(`Failed to create payable: ${error.message}`);
    }
  }

  private async sendBatchCompletionEmail(result: BatchProcessingResultDto) {
    try {
      await this.emailService.sendBatchCompletionEmail(result);
    } catch (error) {}
  }
}
