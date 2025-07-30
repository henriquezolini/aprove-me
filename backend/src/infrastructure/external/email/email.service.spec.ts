import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { BatchProcessingResultDto } from '../../../shared/utils/consumer/batch-payables.dto';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
  createTestAccount: jest.fn(),
  getTestMessageUrl: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockTransporter: any;

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('sendBatchCompletionEmail', () => {
    const mockBatchResult: BatchProcessingResultDto = {
      batchId: 'test-batch-123',
      totalPayables: 100,
      successCount: 95,
      failureCount: 5,
      errors: ['Erro 1', 'Erro 2'],
      processedAt: new Date('2023-01-01T00:00:00Z'),
    };

    it('deve enviar email com sucesso', async () => {
      const mockInfo = { messageId: 'id-mensagem-teste' };
      mockTransporter.sendMail.mockResolvedValue(mockInfo);

      const result = await service.sendBatchCompletionEmail(mockBatchResult);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@bankme.com',
        to: 'ml54iw7mistfjzwg@ethereal.email',
        subject: `Processamento de Lote Concluído - ${mockBatchResult.batchId}`,
        html: expect.stringContaining(mockBatchResult.batchId),
      });
      expect(result).toBe(mockInfo);
    });

    it('deve enviar email para destinatário personalizado', async () => {
      const mockInfo = { messageId: 'id-mensagem-teste' };
      mockTransporter.sendMail.mockResolvedValue(mockInfo);
      const customEmail = 'personalizado@example.com';

      await service.sendBatchCompletionEmail(mockBatchResult, customEmail);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@bankme.com',
        to: customEmail,
        subject: `Processamento de Lote Concluído - ${mockBatchResult.batchId}`,
        html: expect.stringContaining(mockBatchResult.batchId),
      });
    });

    it('deve lidar com URL de visualização do ethereal.email', async () => {
      const mockInfo = { messageId: 'mensagem-id@ethereal.email' };
      const mockPreviewUrl = 'https://ethereal.email/message/visualizacao';
      mockTransporter.sendMail.mockResolvedValue(mockInfo);
      (nodemailer.getTestMessageUrl as jest.Mock).mockReturnValue(
        mockPreviewUrl,
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      await service.sendBatchCompletionEmail(mockBatchResult);

      expect(nodemailer.getTestMessageUrl).toHaveBeenCalledWith(mockInfo);
      expect(logSpy).toHaveBeenCalledWith(
        `Visualizar e-mail em: ${mockPreviewUrl}`,
      );
    });

    it('deve tratar erros ao enviar e-mail', async () => {
      const error = new Error('Falha ao enviar e-mail');
      mockTransporter.sendMail.mockRejectedValue(error);

      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      await expect(
        service.sendBatchCompletionEmail(mockBatchResult),
      ).rejects.toThrow(error);

      expect(errorSpy).toHaveBeenCalledWith(
        `Falha ao enviar e-mail para o lote ${mockBatchResult.batchId}:`,
        error,
      );
    });

    it('deve inicializar o transporter se não estiver disponível', async () => {
      (service as any).transporter = null;

      const mockInfo = { messageId: 'id-mensagem-teste' };
      mockTransporter.sendMail.mockResolvedValue(mockInfo);

      await service.sendBatchCompletionEmail(mockBatchResult);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });
  });

  describe('initializeTransporter', () => {
    it('deve criar transporter com variáveis de ambiente', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '587',
        SMTP_USER: 'usuario@example.com',
        SMTP_PASS: 'senha',
      };

      const service = new EmailService();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'usuario@example.com',
          pass: 'senha',
        },
      });

      process.env = originalEnv;
    });

    it('deve criar conta de teste quando não houver configuração SMTP', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'localhost',
        SMTP_USER: 'teste@example.com',
      };

      const mockTestAccount = {
        user: 'teste@ethereal.email',
        pass: 'senhaTeste',
        smtp: {
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
        },
      };

      (nodemailer.createTestAccount as jest.Mock).mockResolvedValue(
        mockTestAccount,
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

      const service = new EmailService();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(nodemailer.createTestAccount).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith(
        'Gerando credenciais de teste do Ethereal...',
      );

      process.env = originalEnv;
    });

    it('deve tratar erros ao criar conta de teste', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'localhost',
        SMTP_USER: 'teste@example.com',
      };

      const error = new Error('Falha ao criar conta de teste');
      (nodemailer.createTestAccount as jest.Mock).mockRejectedValue(error);

      const logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation();

      const service = new EmailService();
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(errorSpy).toHaveBeenCalledWith(
        'Erro ao gerar credenciais de teste, usando configuração padrão:',
        error,
      );

      process.env = originalEnv;
    });
  });

  describe('generateEmailTemplate', () => {
    it('deve gerar template de e-mail com conteúdo correto', () => {
      const mockResult: BatchProcessingResultDto = {
        batchId: 'lote-123',
        totalPayables: 100,
        successCount: 95,
        failureCount: 5,
        errors: ['Erro 1', 'Erro 2'],
        processedAt: new Date('2023-01-01T00:00:00Z'),
      };

      const template = (service as any).generateEmailTemplate(mockResult);

      expect(template).toContain(mockResult.batchId);
      expect(template).toContain('95');
      expect(template).toContain('5');
      expect(template).toContain('100');
      expect(template).toContain('95.00%');
      expect(template).toContain('5.00%');
      expect(template).toContain('Erro 1');
      expect(template).toContain('Erro 2');
      expect(template).toContain('Processamento de Lote Concluído');
    });

    it('não deve incluir a seção de erros quando não houver erros', () => {
      const mockResult: BatchProcessingResultDto = {
        batchId: 'lote-123',
        totalPayables: 100,
        successCount: 100,
        failureCount: 0,
        errors: [],
        processedAt: new Date('2023-01-01T00:00:00Z'),
      };

      const template = (service as any).generateEmailTemplate(mockResult);

      expect(template).toContain(mockResult.batchId);
      expect(template).toContain('100');
      expect(template).toContain('0');
      expect(template).toContain('100.00%');
      expect(template).toContain('0.00%');
      expect(template).not.toContain('Erros');
    });

    it('deve calcular corretamente as porcentagens', () => {
      const mockResult: BatchProcessingResultDto = {
        batchId: 'lote-123',
        totalPayables: 3,
        successCount: 2,
        failureCount: 1,
        errors: [],
        processedAt: new Date('2023-01-01T00:00:00Z'),
      };

      const template = (service as any).generateEmailTemplate(mockResult);

      expect(template).toContain('66.67%');
      expect(template).toContain('33.33%');
    });
  });

  describe('createDefaultTransporter', () => {
    it('deve criar transporter com configuração padrão', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '587',
        SMTP_USER: 'usuario@example.com',
        SMTP_PASS: 'senha',
      };

      (service as any).createDefaultTransporter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'usuario@example.com',
          pass: 'senha',
        },
      });

      process.env = originalEnv;
    });

    it('deve usar porta padrão quando não especificada', () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SMTP_HOST: 'smtp.example.com',
        SMTP_USER: 'usuario@example.com',
        SMTP_PASS: 'senha',
      };

      (service as any).createDefaultTransporter();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'usuario@example.com',
          pass: 'senha',
        },
      });

      process.env = originalEnv;
    });
  });
});
