import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Client } from 'src/clients/schemas/client.schema';
import { Product } from 'src/products/schemas/product.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema({ _id: false })
export class InvoiceLine {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Product.name,
    required: true,
  })
  produitId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantite: number;

  @Prop({ required: true, min: 0 })
  prixUnitaire: number;

  @Prop({ required: true })
  total: number;
}

export const InvoiceLineSchema = SchemaFactory.createForClass(InvoiceLine);

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, trim: true })
  numero: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Client.name,
    required: true,
    index: true,
  })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  dateEmission: Date;

  @Prop({ required: true })
  dateEcheance: Date;

  @Prop({ type: [InvoiceLineSchema], default: [] })
  lignes: InvoiceLine[];

  @Prop({ default: 0 })
  total: number;

  @Prop({ trim: true })
  notes: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ numero: 1 }, { unique: true });
InvoiceSchema.index({ clientId: 1, createdAt: -1 });
InvoiceSchema.index({ dateEmission: -1 });
