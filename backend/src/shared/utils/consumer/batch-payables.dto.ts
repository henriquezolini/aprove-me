import { IsArray, IsNotEmpty, ValidateNested, ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePayableDto } from '../../../presentation/dtos/payables/payables.dto';

export class BatchPayablesDto {
  @IsArray({ message: 'Payables must be an array' })
  @IsNotEmpty({ message: 'Payables array cannot be empty' })
  @ArrayMinSize(1, { message: 'At least one payable is required' })
  @ArrayMaxSize(10000, { message: 'Maximum 10,000 payables allowed per batch' })
  @ValidateNested({ each: true })
  @Type(() => CreatePayableDto)
  payables: CreatePayableDto[];
}

export class BatchResponseDto {
  batchId: string;
  totalPayables: number;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
}

export class BatchProcessingResultDto {
  batchId: string;
  totalPayables: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  processedAt: Date;
} 