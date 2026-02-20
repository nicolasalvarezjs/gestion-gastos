import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, map, startWith, Subject, switchMap } from 'rxjs';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { ExpensesService } from '../../shared/services/expenses.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  private readonly expensesService = inject(ExpensesService);
  private readonly refreshTrigger$ = new Subject<void>();

  periodMode: 'year' | 'range' = 'year';
  selectedYear = new Date().getFullYear();
  startDate = '';
  endDate = '';

  readonly years = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);

  readonly summary$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getMonthlySummary(this.activeRangeParams))
  );
  readonly byCategory$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getByCategory(this.activeRangeParams))
  );
  readonly allExpenses$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getAll(this.activeRangeParams))
  );

  readonly topMerchants$ = this.allExpenses$.pipe(
    map((items) => {
      const totals = new Map<string, number>();
      items.forEach((expense) => {
        const current = totals.get(expense.description) ?? 0;
        totals.set(expense.description, current + expense.amount);
      });

      return [...totals.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5)
        .map(([merchant, total]) => ({ merchant, total }));
    })
  );

  readonly reportStats$ = combineLatest([this.summary$, this.byCategory$, this.allExpenses$]).pipe(
    map(([summary, categories, expenses]) => {
      const biggestExpense = [...expenses].sort((left, right) => right.amount - left.amount)[0] ?? null;
      const avgTicket = expenses.length ? summary.currentTotal / expenses.length : 0;

      return {
        total: summary.currentTotal,
        avgTicket,
        topCategory: categories[0] ?? null,
        biggestExpense
      };
    })
  );

  formatAmount(amount: number): string {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  applyFilters(): void {
    this.refreshTrigger$.next();
  }

  get activeRangeParams(): { start: string; end: string } {
    if (this.periodMode === 'range' && this.startDate && this.endDate) {
      const start = new Date(`${this.startDate}T00:00:00.000Z`).toISOString();
      const end = new Date(`${this.endDate}T23:59:59.999Z`).toISOString();
      return { start, end };
    }

    const start = new Date(this.selectedYear, 0, 1, 0, 0, 0, 0).toISOString();
    const end = new Date(this.selectedYear, 11, 31, 23, 59, 59, 999).toISOString();
    return { start, end };
  }
}
