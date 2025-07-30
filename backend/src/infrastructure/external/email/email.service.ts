import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { BatchProcessingResultDto } from '../../../shared/utils/consumer/batch-payables.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    if (
      !process.env.SMTP_HOST ||
      process.env.SMTP_HOST === 'localhost' ||
      !process.env.SMTP_USER ||
      process.env.SMTP_USER === 'test@example.com'
    ) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
      } catch (error) {
        this.createDefaultTransporter();
      }
    } else {
      this.createDefaultTransporter();
    }
  }

  private createDefaultTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendBatchCompletionEmail(
    result: BatchProcessingResultDto,
    recipientEmail?: string,
  ) {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const recipient = recipientEmail || 'ml54iw7mistfjzwg@ethereal.email';

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@bankme.com',
        to: recipient,
        subject: `Processamento de Lote Concluído - ${result.batchId}`,
        html: this.generateEmailTemplate(result),
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (info.messageId && info.messageId.includes('ethereal.email')) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
      }

      return info;
    } catch (error) {
      throw error;
    }
  }

  private generateEmailTemplate(result: BatchProcessingResultDto): string {
    const successRate = (
      (result.successCount / result.totalPayables) *
      100
    ).toFixed(2);
    const failureRate = (
      (result.failureCount / result.totalPayables) *
      100
    ).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
          .content { margin: 20px 0; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-box { background-color: #e9ecef; padding: 15px; border-radius: 5px; flex: 1; }
          .success { border-left: 4px solid #28a745; }
          .failure { border-left: 4px solid #dc3545; }
          .errors { background-color: #f8d7da; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Processamento de Lote Concluído</h1>
          <p><strong>ID do Lote:</strong> ${result.batchId}</p>
          <p><strong>Processado em:</strong> ${result.processedAt.toLocaleString()}</p>
        </div>
        
        <div class="content">
          <h2>Resumo</h2>
          <div class="stats">
            <div class="stat-box">
              <h3>Total de Títulos</h3>
              <p style="font-size: 24px; margin: 0;">${result.totalPayables}</p>
            </div>
            <div class="stat-box success">
              <h3>Com Sucesso</h3>
              <p style="font-size: 24px; margin: 0; color: #28a745;">${result.successCount}</p>
              <p style="margin: 0; color: #6c757d;">${successRate}%</p>
            </div>
            <div class="stat-box failure">
              <h3>Com Falha</h3>
              <p style="font-size: 24px; margin: 0; color: #dc3545;">${result.failureCount}</p>
              <p style="margin: 0; color: #6c757d;">${failureRate}%</p>
            </div>
          </div>
          
          ${
            result.errors.length > 0
              ? `
            <div class="errors">
              <h3>Erros</h3>
              <ul>
                ${result.errors.map((error) => `<li>${error}</li>`).join('')}
              </ul>
            </div>
          `
              : ''
          }
        </div>
        
        <div class="footer">
          <p>Esta é uma notificação automática do sistema BankMe Payables.</p>
        </div>
      </body>
      </html>
    `;
  }
}
