import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUniteDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  nombre: number;
}
