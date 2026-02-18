import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { TransactionStatus } from '../../shared/models/finance.models';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { CategoriesService } from '../../shared/services/categories.service';
import { ExpensesService } from '../../shared/services/expenses.service';
import { Expense } from '../../shared/models/expense.models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  imports: [NgClass, NgFor, NgIf, AsyncPipe, DatePipe, RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent {
  private readonly expensesService = inject(ExpensesService);
  private readonly categoriesService = inject(CategoriesService);
  readonly transactions$ = this.expensesService.getAll();
  readonly transactionsCount$ = this.transactions$.pipe(map((items) => items.length));
  readonly categoryOptions$ = this.categoriesService.getAll().pipe(map((items) => items.map((item) => item.name)));
  readonly status = TransactionStatus;
  readonly dateRangeOptions = [
    'history.range.last7',
    'history.range.last30',
    'history.range.thisMonth',
    'history.range.lastMonth'
  ];
  readonly statusOptions = ['status.confirmed', 'status.pending', 'status.flagged'];

  formatAmount(amount: number): string {
    if (amount === 0) {
      return '--';
    }
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  formatExpenseAmount(expense: Expense): string {
    return this.formatAmount(expense.amount);
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
      default:
        return category;
    }
  }

  getStatusLabelKey(status: TransactionStatus): string {
    switch (status) {
      case TransactionStatus.Confirmed:
        return 'status.confirmed';
      case TransactionStatus.Pending:
        return 'status.pending';
      case TransactionStatus.Flagged:
        return 'status.flagged';
      default:
        return String(status);
    }
  }

  getStatusForExpense(expense: Expense): TransactionStatus {
    if (expense.amount === 0) {
      return TransactionStatus.Flagged;
    }
    return TransactionStatus.Confirmed;
  }
}
