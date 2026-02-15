import {
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AddPaymentDto {
  @IsNumber()
  @Min(0.01)
  montant: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  methode?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}
