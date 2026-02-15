import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { SubscriptionPlan } from './subscription-plan.schema';

export type SubscriptionDocument = HydratedDocument<Subscription>;

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, type: String })
  userId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: SubscriptionPlan.name,
    required: true,
  })
  planId: Types.ObjectId;

  @Prop({
    required: true,
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  statut: SubscriptionStatus;

  @Prop({ required: true })
  dateDebut: Date;

  @Prop({ required: true })
  dateFin: Date;

  @Prop({ trim: true })
  paytechToken: string;

  @Prop({ trim: true })
  refCommand: string;

  @Prop({ trim: true })
  paymentMethod: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ userId: 1, statut: 1 });
SubscriptionSchema.index({ refCommand: 1 }, { unique: true, sparse: true });
