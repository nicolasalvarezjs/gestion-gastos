import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  mainPhone: string;

  @Prop({ type: [String], default: [] })
  secondaryPhones: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ mainPhone: 1 }, { unique: true });
