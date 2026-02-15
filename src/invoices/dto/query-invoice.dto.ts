import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryInvoiceDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  dateDebut?: string;

  @IsOptional()
  @IsString()
  dateFin?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
