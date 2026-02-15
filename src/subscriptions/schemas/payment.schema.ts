import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Subscription } from './subscription.schema';

export type PaymentDocument = HydratedDocument<Payment>;

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Subscription.name,
    required: true,
  })
  subscriptionId: Types.ObjectId;

  @Prop({ required: true, type: String })
  userId: string;

  @Prop({ required: true, min: 0 })
  montant: number;

  @Prop({ required: true, default: 'XOF' })
  devise: string;

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  statut: PaymentStatus;

  @Prop({ required: true, trim: true })
  refCommand: string;

  @Prop({ trim: true })
  paytechToken: string;

  @Prop({ trim: true })
  typeEvent: string;

  @Prop({ trim: true })
  paymentMethod: string;

  @Prop({ trim: true })
  clientPhone: string;

  @Prop({ trim: true })
  env: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ refCommand: 1 }, { unique: true });
PaymentSchema.index({ subscriptionId: 1 });
