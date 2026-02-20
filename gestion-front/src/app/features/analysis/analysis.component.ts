import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Subject, map, startWith, switchMap } from 'rxjs';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ExpensesService } from '../../shared/services/expenses.service';
import { DailyTrendPoint } from '../../shared/models/expense.models';
import { DateRangeService } from '../../shared/services/date-range.service';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
  imports: [NgClass, NgFor, NgIf, AsyncPipe, BaseChartDirective, RouterLink, TranslatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisComponent {
  private readonly i18n = inject(I18nService);
  private readonly expensesService = inject(ExpensesService);
  private readonly dateRangeService = inject(DateRangeService);
  private readonly refreshTrigger$ = new Subject<void>();

  readonly monthOptions = this.dateRangeService.monthOptions;
  selectedMonth = this.dateRangeService.selectedMonth();
  customStartDate = '';
  customEndDate = '';

  readonly insights$ = this.expensesService.getInsights();
  readonly breakdown$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getBreakdown(10, this.currentRangeParams))
  );
  readonly trend$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getDailyTrend(this.currentRangeParams))
  );
  readonly monthlySummary$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getMonthlySummary(this.currentRangeParams))
  );
  readonly breakdownCount$ = this.breakdown$.pipe(map((items) => items.length));

  readonly analysisChartData$ = this.trend$.pipe(
    map((trend) => this.buildTrendChart(trend))
  );

  constructor() {
    this.syncDatesFromMonth(this.selectedMonth);
  }

  get currentRangeParams(): { start?: string; end?: string } {
    if (!this.customStartDate || !this.customEndDate) {
      return {};
    }

    const startDate = new Date(`${this.customStartDate}T00:00:00.000Z`);
    const endDate = new Date(`${this.customEndDate}T23:59:59.999Z`);
    return { start: startDate.toISOString(), end: endDate.toISOString() };
  }

  onMonthChange(month: string): void {
    this.selectedMonth = month;
    this.dateRangeService.setMonth(month);
    this.syncDatesFromMonth(month);
    this.refreshTrigger$.next();
  }

  applyCustomDateRange(): void {
    if (!this.customStartDate || !this.customEndDate) {
      return;
    }

    this.dateRangeService.setCustomRange(this.customStartDate, this.customEndDate);
    this.selectedMonth = this.customStartDate.slice(0, 7);
    this.refreshTrigger$.next();
  }

  private syncDatesFromMonth(month: string): void {
    const [year, monthNumber] = month.split('-').map((value) => Number(value));
    const end = new Date(year, monthNumber, 0);
    this.customStartDate = `${year}-${String(monthNumber).padStart(2, '0')}-01`;
    this.customEndDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
  }

  readonly analysisChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#111418',
        bodyColor: '#617589',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#617589',
          font: { size: 11, weight: 700 }
        }
      },
      y: {
        display: false,
        grid: { color: '#f1f5f9' }
      }
    }
  };

  private buildTrendChart(trend: DailyTrendPoint[]): ChartData<'line'> {
    return {
      labels: trend.map((item) => item.day),
      datasets: [
        {
          data: trend.map((item) => item.amount),
          fill: true,
          borderColor: '#2b8cee',
          backgroundColor: 'rgba(43, 140, 238, 0.15)',
          pointRadius: 0,
          tension: 0.4,
          borderWidth: 4
        }
      ]
    };
  }

  getSubCategoryLabelKey(subCategory: string): string {
    switch (subCategory) {
      case 'Groceries':
        return 'category.groceries';
      case 'Snacks':
        return 'category.snacks';
      case 'Household':
        return 'category.household';
      default:
        return subCategory;
    }
  }

  formatAmount(amount: number): string {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  getDateRangeLabel(start: string, end: string): { start: string; end: string } {
    return {
      start: this.formatShortDate(start),
      end: this.formatShortDate(end)
    };
  }

  getDeltaLabel(deltaPercent: number): { percent: string } {
    const sign = deltaPercent > 0 ? '+' : '';
    return { percent: `${sign}${deltaPercent}` };
  }

  private formatShortDate(dateValue: string): string {
    const locale = this.i18n.language() === 'es' ? 'es-AR' : 'en-US';
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
      new Date(dateValue)
    );
  }
}
