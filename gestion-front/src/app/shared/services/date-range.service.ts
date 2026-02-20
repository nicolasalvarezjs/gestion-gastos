import { Injectable, computed, signal } from '@angular/core';

export interface DateRangeSelection {
  start: string;
  end: string;
}

@Injectable({ providedIn: 'root' })
export class DateRangeService {
  private readonly monthSignal = signal<string>(this.currentMonthValue());
  readonly selectedMonth = this.monthSignal.asReadonly();

  readonly monthOptions = computed(() => {
    const options: string[] = [];
    const now = new Date();
    for (let offset = 0; offset < 12; offset += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      options.push(this.toMonthValue(date));
    }
    return options;
  });

  readonly range = computed<DateRangeSelection>(() => this.toRange(this.monthSignal()));

  setMonth(month: string): void {
    if (!month) {
      return;
    }
    this.monthSignal.set(month);
  }

  setCustomRange(start: string, end: string): void {
    if (!start || !end) {
      return;
    }
    const month = start.slice(0, 7);
    this.monthSignal.set(month);
  }

  private toRange(month: string): DateRangeSelection {
    const [yearValue, monthValue] = month.split('-').map((item) => Number(item));
    const startDate = new Date(yearValue, monthValue - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(yearValue, monthValue, 0, 23, 59, 59, 999);

    return {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    };
  }

  private currentMonthValue(): string {
    return this.toMonthValue(new Date());
  }

  private toMonthValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}