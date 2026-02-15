import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class QueryClientDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  actif?: string;
}
