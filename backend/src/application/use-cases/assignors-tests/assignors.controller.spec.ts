import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignorsController } from '../../../presentation/controllers/assignors.controller';
import { AssignorsService } from '../../../application/services/assignors.service';
import {
  CreateAssignorDto,
  UpdateAssignorDto,
} from '../../../presentation/dtos/assignors/assignors.dto';

describe('AssignorsController', () => {
  let controller: AssignorsController;
  let service: AssignorsService;

  const mockAssignorsService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignorsController],
      providers: [
        {
          provide: AssignorsService,
          useValue: mockAssignorsService,
        },
      ],
    }).compile();

    controller = module.get<AssignorsController>(AssignorsController);
    service = module.get<AssignorsService>(AssignorsService);
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

      mockAssignorsService.create.mockResolvedValue(expectedAssignor);

      const result = await controller.create(createAssignorDto);

      expect(result).toEqual(expectedAssignor);
      expect(mockAssignorsService.create).toHaveBeenCalledWith(
        createAssignorDto,
      );
      expect(mockAssignorsService.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando assignor com documento ou email já existir', async () => {
      const error = new BadRequestException(
        'Assignor with this document or email already exists',
      );
      mockAssignorsService.create.mockRejectedValue(error);

      await expect(controller.create(createAssignorDto)).rejects.toThrow(
        new BadRequestException(
          'Assignor with this document or email already exists',
        ),
      );

      expect(mockAssignorsService.create).toHaveBeenCalledWith(
        createAssignorDto,
      );
      expect(mockAssignorsService.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error creating assignor: Database connection failed',
      );
      mockAssignorsService.create.mockRejectedValue(error);

      await expect(controller.create(createAssignorDto)).rejects.toThrow(
        new Error(
          'Internal error creating assignor: Database connection failed',
        ),
      );

      expect(mockAssignorsService.create).toHaveBeenCalledWith(
        createAssignorDto,
      );
      expect(mockAssignorsService.create).toHaveBeenCalledTimes(1);
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

      mockAssignorsService.findById.mockResolvedValue(expectedAssignor);

      const result = await controller.findById(assignorId);

      expect(result).toEqual(expectedAssignor);
      expect(mockAssignorsService.findById).toHaveBeenCalledWith(assignorId);
      expect(mockAssignorsService.findById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não for encontrado', async () => {
      const error = new NotFoundException(
        `Assignor with ID ${assignorId} not found`,
      );
      mockAssignorsService.findById.mockRejectedValue(error);

      await expect(controller.findById(assignorId)).rejects.toThrow(
        new NotFoundException(`Assignor with ID ${assignorId} not found`),
      );

      expect(mockAssignorsService.findById).toHaveBeenCalledWith(assignorId);
      expect(mockAssignorsService.findById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error finding assignor: Database connection failed',
      );
      mockAssignorsService.findById.mockRejectedValue(error);

      await expect(controller.findById(assignorId)).rejects.toThrow(
        new Error(
          'Internal error finding assignor: Database connection failed',
        ),
      );

      expect(mockAssignorsService.findById).toHaveBeenCalledWith(assignorId);
      expect(mockAssignorsService.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const assignorId = '1';
    const updateAssignorDto: UpdateAssignorDto = {
      name: 'Updated Name',
      phone: '11888888888',
    };

    it('deve atualizar um assignor com sucesso', async () => {
      const updatedAssignor = {
        id: assignorId,
        document: '12345678901',
        email: 'test@example.com',
        ...updateAssignorDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockAssignorsService.update.mockResolvedValue(updatedAssignor);

      const result = await controller.update(assignorId, updateAssignorDto);

      expect(result).toEqual(updatedAssignor);
      expect(mockAssignorsService.update).toHaveBeenCalledWith(
        assignorId,
        updateAssignorDto,
      );
      expect(mockAssignorsService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não for encontrado', async () => {
      const error = new NotFoundException(
        `Assignor with ID ${assignorId} not found`,
      );
      mockAssignorsService.update.mockRejectedValue(error);

      await expect(
        controller.update(assignorId, updateAssignorDto),
      ).rejects.toThrow(
        new NotFoundException(`Assignor with ID ${assignorId} not found`),
      );

      expect(mockAssignorsService.update).toHaveBeenCalledWith(
        assignorId,
        updateAssignorDto,
      );
      expect(mockAssignorsService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando tentar atualizar com documento ou email já existente', async () => {
      const updateWithConflictDto: UpdateAssignorDto = {
        document: '98765432109',
        email: 'existing@example.com',
      };

      const error = new BadRequestException(
        'Assignor with this document or email already exists',
      );
      mockAssignorsService.update.mockRejectedValue(error);

      await expect(
        controller.update(assignorId, updateWithConflictDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Assignor with this document or email already exists',
        ),
      );

      expect(mockAssignorsService.update).toHaveBeenCalledWith(
        assignorId,
        updateWithConflictDto,
      );
      expect(mockAssignorsService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error updating assignor: Database connection failed',
      );
      mockAssignorsService.update.mockRejectedValue(error);

      await expect(
        controller.update(assignorId, updateAssignorDto),
      ).rejects.toThrow(
        new Error(
          'Internal error updating assignor: Database connection failed',
        ),
      );

      expect(mockAssignorsService.update).toHaveBeenCalledWith(
        assignorId,
        updateAssignorDto,
      );
      expect(mockAssignorsService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    const assignorId = '1';

    it('deve fazer soft delete de um assignor com sucesso', async () => {
      const expectedResponse = { message: 'Assignor deleted successfully' };

      mockAssignorsService.softDelete.mockResolvedValue(expectedResponse);

      const result = await controller.remove(assignorId);

      expect(result).toEqual(expectedResponse);
      expect(mockAssignorsService.softDelete).toHaveBeenCalledWith(assignorId);
      expect(mockAssignorsService.softDelete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não for encontrado', async () => {
      const error = new NotFoundException(
        `Assignor with ID ${assignorId} not found`,
      );
      mockAssignorsService.softDelete.mockRejectedValue(error);

      await expect(controller.remove(assignorId)).rejects.toThrow(
        new NotFoundException(`Assignor with ID ${assignorId} not found`),
      );

      expect(mockAssignorsService.softDelete).toHaveBeenCalledWith(assignorId);
      expect(mockAssignorsService.softDelete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error deleting assignor: Database connection failed',
      );
      mockAssignorsService.softDelete.mockRejectedValue(error);

      await expect(controller.remove(assignorId)).rejects.toThrow(
        new Error(
          'Internal error deleting assignor: Database connection failed',
        ),
      );

      expect(mockAssignorsService.softDelete).toHaveBeenCalledWith(assignorId);
      expect(mockAssignorsService.softDelete).toHaveBeenCalledTimes(1);
    });
  });
});
