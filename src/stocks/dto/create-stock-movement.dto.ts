import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { MovementType } from '../schemas/stock-movement.schema';

export class CreateStockMovementDto {
  @IsString()
  produitId: string;

  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  quantite: number;

  @IsOptional()
  @IsString()
  motif?: string;
}
