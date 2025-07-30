import { Module } from '@nestjs/common';
import { AssignorsService } from '../services/assignors.service';
import { AssignorsController } from '../../presentation/controllers/assignors.controller';
import { PrismaModule } from '../../infrastructure/database/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AssignorsController],
  providers: [AssignorsService],
})
export class AssignorsModule {}
