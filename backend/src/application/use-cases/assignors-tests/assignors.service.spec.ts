import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignorsService } from '../../../application/services/assignors.service';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import {
  CreateAssignorDto,
  UpdateAssignorDto,
} from '../../../presentation/dtos/assignors/assignors.dto';

describe('AssignorsService', () => {
  let service: AssignorsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    assignor: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssignorsService>(AssignorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createAssignorDto: CreateAssignorDto = {
      document: '12345678901',
      email: 'test@example.com',
      phone: '11999999999',
      name: 'John Doe',
    };

    it('deve criar um assignor com sucesso', async () => {
      const expectedAssignor = {
        id: '1',
        ...createAssignorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.assignor.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.assignor.create.mockResolvedValue(expectedAssignor);
        return callback(mockPrismaService);
      });

      const result = await service.create(createAssignorDto);

      expect(result).toEqual(expectedAssignor);
      expect(mockPrismaService.assignor.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { document: createAssignorDto.document },
            { email: createAssignorDto.email },
          ],
          deletedAt: null,
        },
      });
      expect(mockPrismaService.assignor.create).toHaveBeenCalledWith({
        data: createAssignorDto,
      });
    });

    it('deve lançar BadRequestException se assignor com documento ou email já existir', async () => {
      const existingAssignor = {
        id: '1',
        document: '12345678901',
        email: 'test@example.com',
        phone: '11999999999',
        name: 'Existing User',
      };

      mockPrismaService.assignor.findFirst.mockResolvedValue(existingAssignor);

      await expect(service.create(createAssignorDto)).rejects.toThrow(
        new BadRequestException(
          'Assignor with this document or email already exists',
        ),
      );

      expect(mockPrismaService.assignor.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { document: createAssignorDto.document },
            { email: createAssignorDto.email },
          ],
          deletedAt: null,
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.assignor.findFirst.mockRejectedValue(databaseError);

      await expect(service.create(createAssignorDto)).rejects.toThrow(
        new Error(
          'Internal error creating assignor: Database connection failed',
        ),
      );
    });
  });

  describe('findById', () => {
    const assignorId = '1';

    it('deve encontrar um assignor por ID com sucesso', async () => {
      const expectedAssignor = {
        id: assignorId,
        document: '12345678901',
        email: 'test@example.com',
        phone: '11999999999',
        name: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockPrismaService.assignor.findUnique.mockResolvedValue(expectedAssignor);

      const result = await service.findById(assignorId);

      expect(result).toEqual(expectedAssignor);
      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });
    });

    it('deve lançar NotFoundException se assignor não for encontrado', async () => {
      mockPrismaService.assignor.findUnique.mockResolvedValue(null);

      await expect(service.findById(assignorId)).rejects.toThrow(
        new NotFoundException(`Assignor with ID ${assignorId} not found`),
      );

      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.assignor.findUnique.mockRejectedValue(databaseError);

      await expect(service.findById(assignorId)).rejects.toThrow(
        new Error(
          'Internal error finding assignor: Database connection failed',
        ),
      );
    });
  });

  describe('update', () => {
    const assignorId = '1';
    const updateAssignorDto: UpdateAssignorDto = {
      name: 'Updated Name',
      phone: '11888888888',
    };

    const existingAssignor = {
      id: assignorId,
      document: '12345678901',
      email: 'test@example.com',
      phone: '11999999999',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('deve atualizar um assignor com sucesso', async () => {
      const updatedAssignor = {
        ...existingAssignor,
        ...updateAssignorDto,
        updatedAt: new Date(),
      };

      mockPrismaService.assignor.findUnique.mockResolvedValue(existingAssignor);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.assignor.update.mockResolvedValue(updatedAssignor);
        return callback(mockPrismaService);
      });

      const result = await service.update(assignorId, updateAssignorDto);

      expect(result).toEqual(updatedAssignor);
      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.assignor.update).toHaveBeenCalledWith({
        where: { id: assignorId },
        data: updateAssignorDto,
      });
    });

    it('deve lançar NotFoundException se assignor não for encontrado', async () => {
      mockPrismaService.assignor.findUnique.mockResolvedValue(null);

      await expect(
        service.update(assignorId, updateAssignorDto),
      ).rejects.toThrow(
        new NotFoundException(`Assignor with ID ${assignorId} not found`),
      );

      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se tentar atualizar com documento ou email já existente', async () => {
      const updateWithConflictDto: UpdateAssignorDto = {
        document: '98765432109',
        email: 'existing@example.com',
      };

      const conflictingAssignor = {
        id: '2',
        document: '98765432109',
        email: 'existing@example.com',
        phone: '11777777777',
        name: 'Existing User',
      };

      mockPrismaService.assignor.findUnique.mockResolvedValue(existingAssignor);
      mockPrismaService.assignor.findFirst.mockResolvedValue(
        conflictingAssignor,
      );

      await expect(
        service.update(assignorId, updateWithConflictDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Assignor with this document or email already exists',
        ),
      );

      expect(mockPrismaService.assignor.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [
            { id: { not: assignorId } },
            { deletedAt: null },
            {
              OR: [
                { document: updateWithConflictDto.document },
                { email: updateWithConflictDto.email },
              ],
            },
          ],
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve permitir atualização quando documento/email não estão em conflito', async () => {
      const updateWithNoConflictDto: UpdateAssignorDto = {
        document: '98765432109',
        email: 'new@example.com',
      };

      const updatedAssignor = {
        ...existingAssignor,
        ...updateWithNoConflictDto,
        updatedAt: new Date(),
      };

      mockPrismaService.assignor.findUnique.mockResolvedValue(existingAssignor);
      mockPrismaService.assignor.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.assignor.update.mockResolvedValue(updatedAssignor);
        return callback(mockPrismaService);
      });

      const result = await service.update(assignorId, updateWithNoConflictDto);

      expect(result).toEqual(updatedAssignor);
      expect(mockPrismaService.assignor.findFirst).toHaveBeenCalledWith({
        where: {
          AND: [
            { id: { not: assignorId } },
            { deletedAt: null },
            {
              OR: [
                { document: updateWithNoConflictDto.document },
                { email: updateWithNoConflictDto.email },
              ],
            },
          ],
        },
      });
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.assignor.findUnique.mockRejectedValue(databaseError);

      await expect(
        service.update(assignorId, updateAssignorDto),
      ).rejects.toThrow(
        new Error(
          'Internal error updating assignor: Database connection failed',
        ),
      );
    });
  });

  describe('softDelete', () => {
    const assignorId = '1';

    const existingAssignor = {
      id: assignorId,
      document: '12345678901',
      email: 'test@example.com',
      phone: '11999999999',
      name: 'John Doe',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('deve fazer soft delete de um assignor com sucesso', async () => {
      const deletedAssignor = {
        ...existingAssignor,
        deletedAt: new Date(),
      };

      mockPrismaService.assignor.findUnique.mockResolvedValue(existingAssignor);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        mockPrismaService.assignor.update.mockResolvedValue(deletedAssignor);
        return callback(mockPrismaService);
      });

      const result = await service.softDelete(assignorId);

      expect(result).toEqual({ message: 'Assignor deleted successfully' });
      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.assignor.update).toHaveBeenCalledWith({
        where: { id: assignorId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });

    it('deve lançar NotFoundException se assignor não for encontrado', async () => {
      mockPrismaService.assignor.findUnique.mockResolvedValue(null);

      await expect(service.softDelete(assignorId)).rejects.toThrow(
        new NotFoundException(`Assignor with ID ${assignorId} not found`),
      );

      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: {
          id: assignorId,
          deletedAt: null,
        },
      });
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });

    it('deve lançar erro interno se ocorrer erro no banco de dados', async () => {
      const databaseError = new Error('Database connection failed');

      mockPrismaService.assignor.findUnique.mockRejectedValue(databaseError);

      await expect(service.softDelete(assignorId)).rejects.toThrow(
        new Error(
          'Internal error deleting assignor: Database connection failed',
        ),
      );
    });
  });
});
