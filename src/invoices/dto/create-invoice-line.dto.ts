import { IsString, IsNumber, Min } from 'class-validator';

export class CreateInvoiceLineDto {
  @IsString()
  produitId: string;

  @IsNumber()
  @Min(1)
  quantite: number;

  @IsNumber()
  @Min(0)
  prixUnitaire: number;
}
