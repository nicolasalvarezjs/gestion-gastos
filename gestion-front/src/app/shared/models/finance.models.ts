export enum TransactionStatus {
  Confirmed = 'Confirmed',
  Pending = 'Pending',
  Flagged = 'Flagged'
}

export interface Transaction {
  id: string;
  date: string;
  time: string;
  description: string;
  originalMessage?: string;
  category: string;
  amount: number;
  status: TransactionStatus;
}

export interface CategoryData {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface DailyTrendPoint {
  day: number;
  amount: number;
}

export interface InsightCard {
  titleKey: string;
  textKey: string;
  icon: string;
  colorClass: string;
}

export interface BreakdownItem {
  date: string;
  merchant: string;
  subCategory: string;
  amount: number;
  icon: string;
}
