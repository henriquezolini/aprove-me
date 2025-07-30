import { IsDateString, IsNotEmpty, IsNumber, IsPositive, IsUUID } from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreatePayableDto {
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'The payable value must be a number with up to 2 decimal places' })
    @IsPositive({ message: 'The payable value must be positive' })
    @IsNotEmpty({ message: 'The payable value is required' })
    value: number;

    @IsDateString({}, { message: "The payable emissionDate must be a valid date" })
    @IsNotEmpty({ message: 'The payable emission date is required' })
    emissionDate: Date;

    @IsNotEmpty({ message: 'The assignor ID is required' })
    @IsUUID('4', { message: 'The assignor ID must be a valid UUID' })
    assignor: string;
}

export class UpdatePayableDto extends PartialType(CreatePayableDto) {}