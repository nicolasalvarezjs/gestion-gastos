import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  mainPhone: string;

  @Prop({ required: true, trim: true, lowercase: true })
  name: string;

  @Prop({ default: '', trim: true })
  description: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ mainPhone: 1, name: 1 }, { unique: true });
