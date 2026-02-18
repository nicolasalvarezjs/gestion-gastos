import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExpenseDocument = Expense & Document;

@Schema({ timestamps: true })
export class Expense {
  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, min: 0.000001 })
  amount: number;

  @Prop({ required: true, trim: true })
  category: string;

  @Prop({ required: true, type: Date })
  date: Date;

  @Prop({ default: false })
  isFamilyShared: boolean;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ phone: 1, date: -1 });
