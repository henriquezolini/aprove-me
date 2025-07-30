import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { EmailService } from '../../infrastructure/external/email/email.service';
import {
  CreatePayableDto,
  UpdatePayableDto,
} from '../../presentation/dtos/payables/payables.dto';
import {
  BatchPayablesDto,
  BatchResponseDto,
} from '../../shared/utils/consumer/batch-payables.dto';
import { Payable } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PayablesService {
  private readonly logger = new Logger(PayablesService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createPayableDto: CreatePayableDto): Promise<Payable> {
    try {
      const { value, emissionDate, assignor } = createPayableDto;

      if (value <= 0) {
        throw new BadRequestException('O valor deve ser maior que zero');
      }

      if (new Date(emissionDate) > new Date()) {
        throw new BadRequestException(
          'A data de emissão não pode estar no futuro',
        );
      }

      const payable = await this.prisma.$transaction(async (prisma) => {
        return await prisma.payable.create({
          data: {
            value,
            emissionDate: new Date(emissionDate),
            assignorId: assignor,
          },
        });
      });

      return payable;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new Error(`Erro interno ao criar título: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Payable> {
    try {
      const payable = await this.prisma.payable.findUnique({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          assignor: true,
        },
      });

      if (!payable) {
        throw new NotFoundException(`Título com ID ${id} não encontrado`);
      }

      return payable;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Erro interno ao buscar título: ${error.message}`);
    }
  }

  async findByAssignor(assignorId: string): Promise<Payable[]> {
    try {
      const assignorExists = await this.prisma.assignor.findUnique({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });

      if (!assignorExists) {
        throw new NotFoundException(
          `Cedente com ID ${assignorId} não encontrado`,
        );
      }

      const payables = await this.prisma.payable.findMany({
        where: {
          assignorId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return payables;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Erro interno ao buscar títulos: ${error.message}`);
    }
  }

  async update(
    id: string,
    updatePayableDto: UpdatePayableDto,
  ): Promise<Payable> {
    try {
      const existingPayable = await this.prisma.payable.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingPayable) {
        throw new NotFoundException(`Título com ID ${id} não encontrado`);
      }

      if (updatePayableDto.value !== undefined && updatePayableDto.value <= 0) {
        throw new BadRequestException('O valor deve ser maior que zero');
      }

      if (
        updatePayableDto.emissionDate !== undefined &&
        new Date(updatePayableDto.emissionDate) > new Date()
      ) {
        throw new BadRequestException(
          'A data de emissão não pode estar no futuro',
        );
      }

      if (updatePayableDto.assignor) {
        const assignorExists = await this.prisma.assignor.findUnique({
          where: {
            id: updatePayableDto.assignor,
            deletedAt: null,
          },
        });

        if (!assignorExists) {
          throw new BadRequestException('Cedente não encontrado');
        }
      }

      const updatedPayable = await this.prisma.$transaction(async (prisma) => {
        const { assignor, ...otherData } = updatePayableDto;

        return await prisma.payable.update({
          where: { id },
          data: {
            ...otherData,
            ...(updatePayableDto.emissionDate && {
              emissionDate: new Date(updatePayableDto.emissionDate),
            }),
            ...(assignor && { assignorId: assignor }),
          },
          include: {
            assignor: true,
          },
        });
      });

      return updatedPayable;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new Error(`Erro interno ao atualizar título: ${error.message}`);
    }
  }

  async softDelete(id: string) {
    try {
      const existingPayable = await this.prisma.payable.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingPayable) {
        throw new NotFoundException(`Título com ID ${id} não encontrado`);
      }

      const deletedPayable = await this.prisma.$transaction(async (prisma) => {
        return await prisma.payable.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        });
      });

      return { message: 'Título excluído com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Erro interno ao excluir título: ${error.message}`);
    }
  }

  async createBatch(
    batchPayablesDto: BatchPayablesDto,
  ): Promise<BatchResponseDto> {
    try {
      const batchId = uuidv4();
      const totalPayables = batchPayablesDto.payables.length;

      if (totalPayables === 0) {
        throw new BadRequestException('Pelo menos um título é obrigatório');
      }

      if (totalPayables > 10000) {
        throw new BadRequestException(
          'Máximo de 10.000 títulos permitidos por lote',
        );
      }

      for (const payable of batchPayablesDto.payables) {
        if (payable.value <= 0) {
          throw new BadRequestException('O valor do título deve ser positivo');
        }

        if (new Date(payable.emissionDate) > new Date()) {
          throw new BadRequestException(
            'A data de emissão não pode estar no futuro',
          );
        }
      }

      const assignorIds = [
        ...new Set(batchPayablesDto.payables.map((p) => p.assignor)),
      ];
      const existingAssignors = await this.prisma.assignor.findMany({
        where: {
          id: { in: assignorIds },
          deletedAt: null,
        },
      });

      if (existingAssignors.length !== assignorIds.length) {
        throw new BadRequestException('Alguns cedentes não existem');
      }

      const batchData = {
        batchId,
        payables: batchPayablesDto.payables,
        totalPayables,
        createdAt: new Date(),
      };

      return {
        batchId,
        totalPayables,
        status: 'queued',
        message: 'Lote enfileirado para processamento',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new Error(`Erro interno ao criar lote: ${error.message}`);
    }
  }

  async testEmail(email?: string): Promise<{ message: string; email: string }> {
    try {
      const testEmail = email || 'broigrecezauffe-3585@yopmail.com';

      const testResult = {
        batchId: 'test-' + Date.now(),
        totalPayables: 1,
        successCount: 1,
        failureCount: 0,
        errors: [],
        processedAt: new Date(),
      };

      await this.emailService.sendBatchCompletionEmail(testResult, testEmail);

      return {
        message: 'E-mail de teste enviado com sucesso',
        email: testEmail,
      };
    } catch (error) {
      throw new Error(`Erro ao enviar e-mail de teste: ${error.message}`);
    }
  }
}
