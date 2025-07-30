import { Body, Controller, Post, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PayablesService } from '../../application/services/payables.service';
import { CreatePayableDto, UpdatePayableDto } from '../dtos/payables/payables.dto';
import { BatchPayablesDto, BatchResponseDto } from '../../shared/utils/consumer/batch-payables.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('integrations/payable')
@UseGuards(JwtAuthGuard)
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Post()
  async create(@Body() createPayableDto: CreatePayableDto) {
    return this.payablesService.create(createPayableDto);
  }

  @Post('batch')
  async createBatch(@Body() batchPayablesDto: BatchPayablesDto): Promise<BatchResponseDto> {
    return this.payablesService.createBatch(batchPayablesDto);
  }

  @Post('test-email')
  async testEmail(@Body() body: { email?: string }) {
    return this.payablesService.testEmail(body.email);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.payablesService.findById(id);
  }

  @Get('assignor/:assignorId')
  async findByAssignor(@Param('assignorId') assignorId: string) {
    return this.payablesService.findByAssignor(assignorId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePayableDto: UpdatePayableDto) {
    return this.payablesService.update(id, updatePayableDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.payablesService.softDelete(id);
  }
}
