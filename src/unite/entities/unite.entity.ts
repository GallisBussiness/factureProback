import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UniteDocument = HydratedDocument<Unite>;

@Schema({ timestamps: true })
export class Unite {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true })
  nombre: number;
}

export const UniteSchema = SchemaFactory.createForClass(Unite);
