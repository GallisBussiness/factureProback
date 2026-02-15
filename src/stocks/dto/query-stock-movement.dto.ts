import { IsOptional, IsString, IsNumberString, IsEnum } from 'class-validator';
import { MovementType } from '../schemas/stock-movement.schema';

export class QueryStockMovementDto {
  @IsOptional()
  @IsString()
  produitId?: string;

  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;
}
