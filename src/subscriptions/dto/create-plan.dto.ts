import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
} from 'class-validator';
import { PlanDuration } from '../schemas/subscription-plan.schema';

export class CreatePlanDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  prix: number;

  @IsOptional()
  @IsString()
  devise?: string;

  @IsEnum(PlanDuration)
  duree: PlanDuration;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fonctionnalites?: string[];

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}
