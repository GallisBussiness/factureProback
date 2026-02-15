import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  prix: number;

  @IsString()
  unite: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantiteStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  seuilAlerte?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
