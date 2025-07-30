import { Module } from '@nestjs/common';
import { AppController } from './presentation/controllers/app.controller';
import { AppService } from './application/services/app.service';
import { PayablesModule } from './application/use-cases/payables.module';
import { AssignorsModule } from './application/use-cases/assignors.module';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { AuthModule } from './application/use-cases/auth.module';

@Module({
  imports: [PayablesModule, AssignorsModule, PrismaModule, AuthModule],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
