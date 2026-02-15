import { IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  userId: string;

  @IsString()
  planId: string;
}
