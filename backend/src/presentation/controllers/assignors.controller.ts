import { Body, Controller, Post, Get, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { AssignorsService } from '../../application/services/assignors.service';
import { CreateAssignorDto, UpdateAssignorDto } from '../dtos/assignors/assignors.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('integrations/assignor')
@UseGuards(JwtAuthGuard)
export class AssignorsController {
  constructor(private readonly assignorsService: AssignorsService) {}

  @Post()
  async create(@Body() createAssignorDto: CreateAssignorDto) {
    return this.assignorsService.create(createAssignorDto);
  }

  @Get()
  async findAll() {
    return this.assignorsService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.assignorsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAssignorDto: UpdateAssignorDto) {
    return this.assignorsService.update(id, updateAssignorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.assignorsService.softDelete(id);
  }
} 