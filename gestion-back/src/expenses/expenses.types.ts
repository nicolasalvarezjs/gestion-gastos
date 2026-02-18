export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
}

export interface MonthlySummary {
  currentTotal: number;
  previousTotal: number;
  delta: number;
  deltaPercent: number;
  periodStart: string;
  periodEnd: string;
  previousPeriodStart: string;
  previousPeriodEnd: string;
}

export interface DailyTrendPoint {
  day: number;
  amount: number;
}

export interface BreakdownItem {
  date: string;
  merchant: string;
  subCategory: string;
  amount: number;
}

export interface InsightItem {
  title: string;
  text: string;
  icon: string;
  colorClass: string;
}
