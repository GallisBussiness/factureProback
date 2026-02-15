import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Unite } from 'src/unite/entities/unite.entity';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, trim: true })
  reference: string;

  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  prix: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Unite.name,
    required: true,
  })
  unite: Unite;

  @Prop({ default: 0, min: 0 })
  quantiteStock: number;

  @Prop({ default: 10, min: 0 })
  seuilAlerte: number;

  @Prop({ default: true })
  actif: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ nom: 'text', reference: 'text' });
ProductSchema.index({ reference: 1 }, { unique: true });
