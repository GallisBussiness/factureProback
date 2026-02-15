import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceLineDto } from './create-invoice-line.dto';

export class CreateInvoiceDto {
  @IsString()
  clientId: string;

  @IsDateString()
  dateEmission: string;

  @IsDateString()
  dateEcheance: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lignes: CreateInvoiceLineDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
