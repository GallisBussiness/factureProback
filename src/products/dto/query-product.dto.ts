import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  actif?: string;

  @IsOptional()
  @IsString()
  stockBas?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
