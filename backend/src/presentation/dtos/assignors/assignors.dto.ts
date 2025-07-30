import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { IsValidDocument } from '../../../shared/utils/validators/document.validator';

export class CreateAssignorDto {
  @IsString({ message: 'The document must be a string' })
  @IsNotEmpty({ message: 'The document is required' })
  @IsValidDocument({
    message: 'The document must be a valid CPF (11 digits) or CNPJ (14 digits)',
  })
  @MaxLength(30, { message: 'The document must have at most 30 characters' })
  document: string;

  @IsEmail({}, { message: 'The email must be a valid email address' })
  @IsNotEmpty({ message: 'The email is required' })
  @MaxLength(140, { message: 'The email must have at least 140 characters' })
  email: string;

  @IsString({ message: 'The phone must be a string' })
  @IsNotEmpty({ message: 'The phone is required' })
  @MaxLength(20, { message: 'The phone must have at most 20 characters' })
  phone: string;

  @IsString({ message: 'The name must be a string' })
  @IsNotEmpty({ message: 'The name is required' })
  @MinLength(2, { message: 'The name must have at least 2 characters' })
  name: string;
}

export class UpdateAssignorDto extends PartialType(CreateAssignorDto) {}
