import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateClientDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
