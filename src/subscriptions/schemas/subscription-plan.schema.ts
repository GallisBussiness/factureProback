import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SubscriptionPlanDocument = HydratedDocument<SubscriptionPlan>;

export enum PlanDuration {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  prix: number;

  @Prop({ required: true, default: 'XOF' })
  devise: string;

  @Prop({ required: true, enum: PlanDuration })
  duree: PlanDuration;

  @Prop({ type: [String], default: [] })
  fonctionnalites: string[];

  @Prop({ default: true })
  actif: boolean;
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);
