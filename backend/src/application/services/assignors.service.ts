import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import {
  CreateAssignorDto,
  UpdateAssignorDto,
} from '../../presentation/dtos/assignors/assignors.dto';

@Injectable()
export class AssignorsService {
  private readonly logger = new Logger(AssignorsService.name);

  constructor(private prisma: PrismaService) {}

  async create(createAssignorDto: CreateAssignorDto) {
    try {
      const { document, email, phone, name } = createAssignorDto;

      const existingAssignor = await this.prisma.assignor.findFirst({
        where: {
          OR: [{ document }, { email }],
          deletedAt: null,
        },
      });

      if (existingAssignor) {
        throw new BadRequestException(
          'Já existe um cedente com este documento ou e-mail',
        );
      }

      const assignor = await this.prisma.$transaction(async (prisma) => {
        return await prisma.assignor.create({
          data: {
            document,
            email,
            phone,
            name,
          },
        });
      });

      return assignor;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new Error(`Erro interno ao criar cedente: ${error.message}`);
    }
  }

  async findById(id: string) {
    try {
      const assignor = await this.prisma.assignor.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!assignor) {
        throw new NotFoundException(`Cedente com ID ${id} não encontrado`);
      }

      return assignor;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Erro interno ao buscar cedente: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const assignors = await this.prisma.assignor.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return assignors;
    } catch (error) {
      throw new Error(`Erro interno ao buscar cedentes: ${error.message}`);
    }
  }

  async update(id: string, updateAssignorDto: UpdateAssignorDto) {
    try {
      const existingAssignor = await this.prisma.assignor.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingAssignor) {
        throw new NotFoundException(`Cedente com ID ${id} não encontrado`);
      }

      if (updateAssignorDto.document || updateAssignorDto.email) {
        const conflictingAssignor = await this.prisma.assignor.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              { deletedAt: null },
              {
                OR: [
                  ...(updateAssignorDto.document
                    ? [{ document: updateAssignorDto.document }]
                    : []),
                  ...(updateAssignorDto.email
                    ? [{ email: updateAssignorDto.email }]
                    : []),
                ],
              },
            ],
          },
        });

        if (conflictingAssignor) {
          throw new BadRequestException(
            'Já existe um cedente com este documento ou e-mail',
          );
        }
      }

      const updatedAssignor = await this.prisma.$transaction(async (prisma) => {
        return await prisma.assignor.update({
          where: { id },
          data: {
            ...updateAssignorDto,
          },
        });
      });

      return updatedAssignor;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new Error(`Erro interno ao atualizar cedente: ${error.message}`);
    }
  }

  async softDelete(id: string) {
    try {
      const existingAssignor = await this.prisma.assignor.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingAssignor) {
        throw new NotFoundException(`Cedente com ID ${id} não encontrado`);
      }

      const deletedAssignor = await this.prisma.$transaction(async (prisma) => {
        return await prisma.assignor.update({
          where: { id },
          data: {
            deletedAt: new Date(),
          },
        });
      });

      return { message: 'Cedente excluído com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new Error(`Erro interno ao excluir cedente: ${error.message}`);
    }
  }
}
