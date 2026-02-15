import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClientDocument = HydratedDocument<Client>;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true, trim: true })
  nom: string;

  @Prop({ trim: true })
  telephone: string;

  @Prop({ trim: true })
  adresse: string;

  @Prop({ default: true })
  actif: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

ClientSchema.index({ nom: 'text' });
