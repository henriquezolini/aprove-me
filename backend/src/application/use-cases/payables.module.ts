import { Module } from '@nestjs/common';
import { PayablesService } from '../services/payables.service';
import { PayablesController } from '../../presentation/controllers/payables.controller';
import { BatchProcessorService } from '../../shared/utils/consumer/batch-processor.service';
import { BatchProcessorController } from '../../shared/utils/consumer/batch-processor.controller';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';
import { EmailModule } from '../../infrastructure/external/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [PayablesController, BatchProcessorController],
  providers: [PayablesService, BatchProcessorService],
})
export class PayablesModule {}
