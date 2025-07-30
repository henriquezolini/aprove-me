import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PayablesService } from '../../../application/services/payables.service';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { EmailService } from '../../../infrastructure/external/email/email.service';
import {
  CreatePayableDto,
  UpdatePayableDto,
} from '../../../presentation/dtos/payables/payables.dto';

describe('PayablesService', () => {
  let service: PayablesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    payable: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    assignor: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockEmailService = {
    sendBatchCompletionEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayablesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<PayablesService>(PayablesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createPayableDto: CreatePayableDto = {
      value: 100.5,
      emissionDate: new Date('2024-01-01'),
      assignor: '550e8400-e29b-41d4-a716-446655440000',
    };

    it('deve criar um payable com sucesso', async () => {
      const expectedPayable = {
        id: '1',
        value: 100.5,
        emissionDate: new Date('2024-01-01'),
        assignorId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.payable.create.mockResolvedValue(expectedPayable);
        return callback(mockPrismaService);
      });

      const result = await service.create(createPayableDto);

      expect(result).toEqual(expectedPayable);
      expect(mockPrismaService.payable.create).toHaveBeenCalledWith({
        data: {
          value: createPayableDto.value,
          emissionDate: new Date(createPayableDto.emissionDate),
          assignorId: createPayableDto.assignor,
        },
      });
    });

    it('deve lançar BadRequestException se valor for menor ou igual a zero', async () => {
      const invalidPayableDto = {
        ...createPayableDto,
        value: 0,
      };

      await expect(service.create(invalidPayableDto)).rejects.toThrow(
        new BadRequestException('The value must be greater than zero'),
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se valor for negativo', async () => {
      const invalidPayableDto = {
        ...createPayableDto,
        value: -10,
      };

      await expect(service.create(invalidPayableDto)).rejects.toThrow(
        new BadRequestException('The value must be greater than zero'),
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se data de emissão for futura', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidPayableDto = {
        ...createPayableDto,
        emissionDate: futureDate,
      };

      await expect(service.create(invalidPayableDto)).rejects.toThrow(
        new BadRequestException('The emission date cannot be in the future'),
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.$transaction.mockRejectedValue(databaseError);

      await expect(service.create(createPayableDto)).rejects.toThrow(
        new Error(
          'Internal error creating payable: Database connection failed',
        ),
      );
    });
  });

  describe('findById', () => {
    const payableId = '1';

    it('deve encontrar um payable por ID com sucesso', async () => {
      const expectedPayable = {
        id: payableId,
        value: 100.5,
        emissionDate: new Date('2024-01-01'),
        assignorId: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        assignor: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(expectedPayable);

      const result = await service.findById(payableId);

      expect(result).toEqual(expectedPayable);
      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: {
          id: payableId,
          deletedAt: null,
        },
        include: {
          assignor: true,
        },
      });
    });

    it('deve lançar NotFoundException se payable não for encontrado', async () => {
      mockPrismaService.payable.findUnique.mockResolvedValue(null);

      await expect(service.findById(payableId)).rejects.toThrow(
        new NotFoundException(`Payable with ID ${payableId} not found`),
      );

      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: {
          id: payableId,
          deletedAt: null,
        },
        include: {
          assignor: true,
        },
      });
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.payable.findUnique.mockRejectedValue(databaseError);

      await expect(service.findById(payableId)).rejects.toThrow(
        new Error('Internal error finding payable: Database connection failed'),
      );
    });
  });

  describe('update', () => {
    const payableId = '1';
    const updatePayableDto: UpdatePayableDto = {
      value: 200.75,
    };

    const existingPayable = {
      id: payableId,
      value: 100.5,
      emissionDate: new Date('2024-01-01'),
      assignorId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('deve atualizar um payable com sucesso', async () => {
      const updatedPayable = {
        ...existingPayable,
        ...updatePayableDto,
        updatedAt: new Date(),
        assignor: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(existingPayable);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.payable.update.mockResolvedValue(updatedPayable);
        return callback(mockPrismaService);
      });

      const result = await service.update(payableId, updatePayableDto);

      expect(result).toEqual(updatedPayable);
      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: {
          id: payableId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.payable.update).toHaveBeenCalledWith({
        where: { id: payableId },
        data: updatePayableDto,
        include: {
          assignor: true,
        },
      });
    });

    it('deve lançar NotFoundException se payable não for encontrado', async () => {
      mockPrismaService.payable.findUnique.mockResolvedValue(null);

      await expect(service.update(payableId, updatePayableDto)).rejects.toThrow(
        new NotFoundException(`Payable with ID ${payableId} not found`),
      );

      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: {
          id: payableId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se tentar atualizar com valor menor ou igual a zero', async () => {
      const invalidUpdateDto = {
        value: -10,
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(existingPayable);

      await expect(service.update(payableId, invalidUpdateDto)).rejects.toThrow(
        new BadRequestException('The value must be greater than zero'),
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se tentar atualizar com data de emissão futura', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidUpdateDto = {
        emissionDate: futureDate,
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(existingPayable);

      await expect(service.update(payableId, invalidUpdateDto)).rejects.toThrow(
        new BadRequestException('The emission date cannot be in the future'),
      );

      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se assignor não existir', async () => {
      const updateWithInvalidAssignor = {
        assignor: '550e8400-e29b-41d4-a716-446655440001',
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(existingPayable);
      mockPrismaService.assignor.findUnique.mockResolvedValue(null);

      await expect(
        service.update(payableId, updateWithInvalidAssignor),
      ).rejects.toThrow(new BadRequestException('Assignor not found'));

      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: updateWithInvalidAssignor.assignor,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve atualizar com assignor válido', async () => {
      const updateWithValidAssignor = {
        assignor: '550e8400-e29b-41d4-a716-446655440001',
      };

      const validAssignor = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      const updatedPayable = {
        ...existingPayable,
        assignorId: updateWithValidAssignor.assignor,
        updatedAt: new Date(),
        assignor: validAssignor,
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(existingPayable);
      mockPrismaService.assignor.findUnique.mockResolvedValue(validAssignor);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.payable.update.mockResolvedValue(updatedPayable);
        return callback(mockPrismaService);
      });

      const result = await service.update(payableId, updateWithValidAssignor);

      expect(result).toEqual(updatedPayable);
      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: updateWithValidAssignor.assignor,
          deletedAt: null,
        },
      });
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.payable.findUnique.mockRejectedValue(databaseError);

      await expect(service.update(payableId, updatePayableDto)).rejects.toThrow(
        new Error(
          'Internal error updating payable: Database connection failed',
        ),
      );
    });
  });

  describe('softDelete', () => {
    const payableId = '1';

    const existingPayable = {
      id: payableId,
      value: 100.5,
      emissionDate: new Date('2024-01-01'),
      assignorId: '550e8400-e29b-41d4-a716-446655440000',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('deve fazer soft delete de um payable com sucesso', async () => {
      const deletedPayable = {
        ...existingPayable,
        deletedAt: new Date(),
      };

      mockPrismaService.payable.findUnique.mockResolvedValue(existingPayable);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.payable.update.mockResolvedValue(deletedPayable);
        return callback(mockPrismaService);
      });

      const result = await service.softDelete(payableId);

      expect(result).toEqual({ message: 'Payable deleted successfully' });
      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: {
          id: payableId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.payable.update).toHaveBeenCalledWith({
        where: { id: payableId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('deve lançar NotFoundException se payable não for encontrado', async () => {
      mockPrismaService.payable.findUnique.mockResolvedValue(null);

      await expect(service.softDelete(payableId)).rejects.toThrow(
        new NotFoundException(`Payable with ID ${payableId} not found`),
      );

      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: {
          id: payableId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.payable.findUnique.mockRejectedValue(databaseError);

      await expect(service.softDelete(payableId)).rejects.toThrow(
        new Error(
          'Internal error deleting payable: Database connection failed',
        ),
      );
    });
  });
});
