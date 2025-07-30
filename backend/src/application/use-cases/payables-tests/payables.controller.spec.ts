import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PayablesController } from '../../../presentation/controllers/payables.controller';
import { PayablesService } from '../../../application/services/payables.service';
import {
  CreatePayableDto,
  UpdatePayableDto,
} from '../../../presentation/dtos/payables/payables.dto';

describe('PayablesController', () => {
  let controller: PayablesController;
  let service: PayablesService;

  const mockPayablesService = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayablesController],
      providers: [
        {
          provide: PayablesService,
          useValue: mockPayablesService,
        },
      ],
    }).compile();

    controller = module.get<PayablesController>(PayablesController);
    service = module.get<PayablesService>(PayablesService);
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

      mockPayablesService.create.mockResolvedValue(expectedPayable);

      const result = await controller.create(createPayableDto);

      expect(result).toEqual(expectedPayable);
      expect(mockPayablesService.create).toHaveBeenCalledWith(createPayableDto);
      expect(mockPayablesService.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando valor for menor ou igual a zero', async () => {
      const error = new BadRequestException(
        'The value must be greater than zero',
      );
      mockPayablesService.create.mockRejectedValue(error);

      await expect(controller.create(createPayableDto)).rejects.toThrow(
        new BadRequestException('The value must be greater than zero'),
      );

      expect(mockPayablesService.create).toHaveBeenCalledWith(createPayableDto);
      expect(mockPayablesService.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando data de emissão for futura', async () => {
      const error = new BadRequestException(
        'The emission date cannot be in the future',
      );
      mockPayablesService.create.mockRejectedValue(error);

      await expect(controller.create(createPayableDto)).rejects.toThrow(
        new BadRequestException('The emission date cannot be in the future'),
      );

      expect(mockPayablesService.create).toHaveBeenCalledWith(createPayableDto);
      expect(mockPayablesService.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error creating payable: Database connection failed',
      );
      mockPayablesService.create.mockRejectedValue(error);

      await expect(controller.create(createPayableDto)).rejects.toThrow(
        new Error(
          'Internal error creating payable: Database connection failed',
        ),
      );

      expect(mockPayablesService.create).toHaveBeenCalledWith(createPayableDto);
      expect(mockPayablesService.create).toHaveBeenCalledTimes(1);
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

      mockPayablesService.findById.mockResolvedValue(expectedPayable);

      const result = await controller.findById(payableId);

      expect(result).toEqual(expectedPayable);
      expect(mockPayablesService.findById).toHaveBeenCalledWith(payableId);
      expect(mockPayablesService.findById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando payable não for encontrado', async () => {
      const error = new NotFoundException(
        `Payable with ID ${payableId} not found`,
      );
      mockPayablesService.findById.mockRejectedValue(error);

      await expect(controller.findById(payableId)).rejects.toThrow(
        new NotFoundException(`Payable with ID ${payableId} not found`),
      );

      expect(mockPayablesService.findById).toHaveBeenCalledWith(payableId);
      expect(mockPayablesService.findById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error finding payable: Database connection failed',
      );
      mockPayablesService.findById.mockRejectedValue(error);

      await expect(controller.findById(payableId)).rejects.toThrow(
        new Error('Internal error finding payable: Database connection failed'),
      );

      expect(mockPayablesService.findById).toHaveBeenCalledWith(payableId);
      expect(mockPayablesService.findById).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    const payableId = '1';
    const updatePayableDto: UpdatePayableDto = {
      value: 200.75,
    };

    it('deve atualizar um payable com sucesso', async () => {
      const updatedPayable = {
        id: payableId,
        value: 200.75,
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

      mockPayablesService.update.mockResolvedValue(updatedPayable);

      const result = await controller.update(payableId, updatePayableDto);

      expect(result).toEqual(updatedPayable);
      expect(mockPayablesService.update).toHaveBeenCalledWith(
        payableId,
        updatePayableDto,
      );
      expect(mockPayablesService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando payable não for encontrado', async () => {
      const error = new NotFoundException(
        `Payable with ID ${payableId} not found`,
      );
      mockPayablesService.update.mockRejectedValue(error);

      await expect(
        controller.update(payableId, updatePayableDto),
      ).rejects.toThrow(
        new NotFoundException(`Payable with ID ${payableId} not found`),
      );

      expect(mockPayablesService.update).toHaveBeenCalledWith(
        payableId,
        updatePayableDto,
      );
      expect(mockPayablesService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando valor for menor ou igual a zero', async () => {
      const error = new BadRequestException(
        'The value must be greater than zero',
      );
      mockPayablesService.update.mockRejectedValue(error);

      await expect(
        controller.update(payableId, updatePayableDto),
      ).rejects.toThrow(
        new BadRequestException('The value must be greater than zero'),
      );

      expect(mockPayablesService.update).toHaveBeenCalledWith(
        payableId,
        updatePayableDto,
      );
      expect(mockPayablesService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando data de emissão for futura', async () => {
      const error = new BadRequestException(
        'The emission date cannot be in the future',
      );
      mockPayablesService.update.mockRejectedValue(error);

      await expect(
        controller.update(payableId, updatePayableDto),
      ).rejects.toThrow(
        new BadRequestException('The emission date cannot be in the future'),
      );

      expect(mockPayablesService.update).toHaveBeenCalledWith(
        payableId,
        updatePayableDto,
      );
      expect(mockPayablesService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException quando assignor não for encontrado', async () => {
      const error = new BadRequestException('Assignor not found');
      mockPayablesService.update.mockRejectedValue(error);

      await expect(
        controller.update(payableId, updatePayableDto),
      ).rejects.toThrow(new BadRequestException('Assignor not found'));

      expect(mockPayablesService.update).toHaveBeenCalledWith(
        payableId,
        updatePayableDto,
      );
      expect(mockPayablesService.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error updating payable: Database connection failed',
      );
      mockPayablesService.update.mockRejectedValue(error);

      await expect(
        controller.update(payableId, updatePayableDto),
      ).rejects.toThrow(
        new Error(
          'Internal error updating payable: Database connection failed',
        ),
      );

      expect(mockPayablesService.update).toHaveBeenCalledWith(
        payableId,
        updatePayableDto,
      );
      expect(mockPayablesService.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    const payableId = '1';

    it('deve fazer soft delete de um payable com sucesso', async () => {
      const expectedResponse = { message: 'Payable deleted successfully' };

      mockPayablesService.softDelete.mockResolvedValue(expectedResponse);

      const result = await controller.remove(payableId);

      expect(result).toEqual(expectedResponse);
      expect(mockPayablesService.softDelete).toHaveBeenCalledWith(payableId);
      expect(mockPayablesService.softDelete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando payable não for encontrado', async () => {
      const error = new NotFoundException(
        `Payable with ID ${payableId} not found`,
      );
      mockPayablesService.softDelete.mockRejectedValue(error);

      await expect(controller.remove(payableId)).rejects.toThrow(
        new NotFoundException(`Payable with ID ${payableId} not found`),
      );

      expect(mockPayablesService.softDelete).toHaveBeenCalledWith(payableId);
      expect(mockPayablesService.softDelete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro interno quando ocorrer erro no service', async () => {
      const error = new Error(
        'Internal error deleting payable: Database connection failed',
      );
      mockPayablesService.softDelete.mockRejectedValue(error);

      await expect(controller.remove(payableId)).rejects.toThrow(
        new Error(
          'Internal error deleting payable: Database connection failed',
        ),
      );

      expect(mockPayablesService.softDelete).toHaveBeenCalledWith(payableId);
      expect(mockPayablesService.softDelete).toHaveBeenCalledTimes(1);
    });
  });
});
