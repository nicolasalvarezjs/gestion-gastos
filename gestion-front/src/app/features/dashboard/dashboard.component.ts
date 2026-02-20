import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { combineLatest, map, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { I18nService } from '../../shared/i18n/i18n.service';
import { ExpensesService } from '../../shared/services/expenses.service';
import { DateRangeService } from '../../shared/services/date-range.service';
import {
  CategorySummary,
  DailyTrendPoint,
  Expense,
  MonthlySummary
} from '../../shared/models/expense.models';

interface CategoryMeta {
  icon: string;
  chipClass: string;
  badgeClass: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [NgClass, NgFor, NgIf, AsyncPipe, DatePipe, BaseChartDirective, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly i18n = inject(I18nService);
  private readonly expensesService = inject(ExpensesService);
  private readonly dateRangeService = inject(DateRangeService);

  private readonly selectedMonth$ = toObservable(this.dateRangeService.selectedMonth);

  readonly recentTransactions$ = this.selectedMonth$.pipe(
    map(() => null),
    switchMap(() => this.expensesService.getRecent(4))
  );
  readonly categorySummary$ = this.selectedMonth$.pipe(
    map(() => null),
    switchMap(() => this.expensesService.getByCategory())
  );
  readonly dailyTrend$ = this.selectedMonth$.pipe(
    map(() => null),
    switchMap(() => this.expensesService.getDailyTrend())
  );
  readonly monthlySummary$ = this.selectedMonth$.pipe(
    map(() => null),
    switchMap(() => this.expensesService.getMonthlySummary())
  );
  readonly topCategory$ = this.categorySummary$.pipe(map((items) => items[0] ?? null));
  private readonly language$ = toObservable(this.i18n.language);

  readonly categoryMeta: Record<string, CategoryMeta> = {
    Groceries: {
      icon: 'shopping_cart',
      chipClass: 'chip--orange',
      badgeClass: 'badge--orange'
    },
    Transport: {
      icon: 'local_gas_station',
      chipClass: 'chip--blue',
      badgeClass: 'badge--blue'
    },
    Utilities: {
      icon: 'bolt',
      chipClass: 'chip--purple',
      badgeClass: 'badge--purple'
    },
    Entertainment: {
      icon: 'movie',
      chipClass: 'chip--pink',
      badgeClass: 'badge--pink'
    }
  };

  readonly categoryChartData$ = combineLatest([this.categorySummary$, this.language$]).pipe(
    map(([summary]) => this.buildCategoryChart(summary))
  );

  readonly categoryChartOptions: ChartOptions<'bar'> = {
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
        grid: { display: false }
      }
    }
  };

  readonly trendChartData$ = this.dailyTrend$.pipe(
    map((trend) => this.buildTrendChart(trend))
  );

  readonly avgDailySpending$ = this.dailyTrend$.pipe(
    map((trend) => {
      if (trend.length === 0) {
        return 0;
      }
      const total = trend.reduce((sum, item) => sum + item.amount, 0);
      return total / trend.length;
    })
  );

  readonly trendChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
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
        grid: { display: false }
      }
    }
  };

  getCategoryMeta(category: string): CategoryMeta {
    return (
      this.categoryMeta[category] ?? {
        icon: 'category',
        chipClass: 'chip--gray',
        badgeClass: 'badge--gray'
      }
    );
  }

  getCategoryLabelKey(category: string): string {
    switch (category) {
      case 'Groceries':
        return 'category.groceries';
      case 'Transport':
        return 'category.transport';
      case 'Utilities':
        return 'category.utilities';
      case 'Entertainment':
        return 'category.entertainment';
      case 'Unassigned':
        return 'category.unassigned';
      case 'Housing':
        return 'category.housing';
      case 'Food':
        return 'category.food';
      case 'Util':
        return 'category.util';
      case 'Ent':
        return 'category.ent';
      case 'Shop':
        return 'category.shop';
      default:
        return category;
    }
  }

  private buildCategoryChart(summary: CategorySummary[]): ChartData<'bar'> {
    return {
      labels: summary.map((item) => this.i18n.t(this.getCategoryLabelKey(item.category))),
      datasets: [
        {
          data: summary.map((item) => item.total),
          backgroundColor: summary.map((item) => this.getCategoryColor(item.category)),
          borderRadius: 8,
          barThickness: 40
        }
      ]
    };
  }

  private buildTrendChart(trend: DailyTrendPoint[]): ChartData<'line'> {
    return {
      labels: trend.map((item) => item.day),
      datasets: [
        {
          data: trend.map((item) => item.amount),
          fill: true,
          borderColor: '#2b8cee',
          backgroundColor: 'rgba(43, 140, 238, 0.2)',
          pointRadius: 0,
          tension: 0.4
        }
      ]
    };
  }

  private getCategoryColor(category: string): string {
    switch (category) {
      case 'Housing':
        return '#2b8cee';
      case 'Food':
      case 'Groceries':
        return '#fb923c';
      case 'Transport':
        return '#34d399';
      case 'Utilities':
      case 'Util':
        return '#c084fc';
      case 'Entertainment':
      case 'Ent':
        return '#f472b6';
      case 'Shop':
        return '#60a5fa';
      default:
        return '#94a3b8';
    }
  }

  formatAmount(value: number): string {
    const absValue = Math.abs(value);
    return `${value < 0 ? '-' : ''}$${absValue.toFixed(2)}`;
  }

  formatExpenseAmount(expense: Expense): string {
    return this.formatAmount(expense.amount);
  }

  getDeltaPercent(summary: MonthlySummary): string {
    const sign = summary.deltaPercent > 0 ? '+' : '';
    return `${sign}${summary.deltaPercent}%`;
  }

  getPeriodRange(summary: MonthlySummary): { start: string; end: string } {
    return {
      start: this.formatShortDate(summary.periodStart),
      end: this.formatShortDate(summary.periodEnd)
    };
  }

  getDeltaMessage(summary: MonthlySummary): string {
    if (summary.deltaPercent > 0) {
      return 'kpi.deltaUp';
    }
    if (summary.deltaPercent < 0) {
      return 'kpi.deltaDown';
    }
    return 'kpi.deltaFlat';
  }

  private formatShortDate(dateValue: string): string {
    const locale = this.i18n.language() === 'es' ? 'es-AR' : 'en-US';
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(
      new Date(dateValue)
    );
  }
}
