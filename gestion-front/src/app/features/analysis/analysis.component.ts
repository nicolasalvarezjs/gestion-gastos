import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { map } from 'rxjs';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ExpensesService } from '../../shared/services/expenses.service';
import { DailyTrendPoint } from '../../shared/models/expense.models';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.scss',
  imports: [NgClass, NgFor, NgIf, AsyncPipe, BaseChartDirective, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisComponent {
  private readonly i18n = inject(I18nService);
  private readonly expensesService = inject(ExpensesService);
  readonly insights$ = this.expensesService.getInsights();
  readonly breakdown$ = this.expensesService.getBreakdown();
  readonly trend$ = this.expensesService.getDailyTrend();
  readonly monthlySummary$ = this.expensesService.getMonthlySummary();
  readonly breakdownCount$ = this.breakdown$.pipe(map((items) => items.length));

  readonly analysisChartData$ = this.trend$.pipe(
    map((trend) => this.buildTrendChart(trend))
  );

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
