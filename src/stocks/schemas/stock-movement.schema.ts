import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Invoice } from 'src/invoices/schemas/invoice.schema';
import { Product } from 'src/products/schemas/product.schema';

export type StockMovementDocument = HydratedDocument<StockMovement>;

export enum MovementType {
  ENTREE = 'ENTREE',
  SORTIE = 'SORTIE',
  AJUSTEMENT = 'AJUSTEMENT',
}

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
    index: true,
  })
  produitId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, enum: MovementType })
  type: MovementType;

  @Prop({ required: true })
  quantite: number;

  @Prop({ required: true })
  quantiteAvant: number;

  @Prop({ required: true })
  quantiteApres: number;

  @Prop({ trim: true })
  motif: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Invoice.name })
  factureId: Types.ObjectId;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);

StockMovementSchema.index({ produitId: 1, createdAt: -1 });
