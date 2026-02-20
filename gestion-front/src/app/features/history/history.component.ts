import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, map, startWith, switchMap, tap } from 'rxjs';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { CategoriesService } from '../../shared/services/categories.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { ExpensesService } from '../../shared/services/expenses.service';
import { Expense } from '../../shared/models/expense.models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
  imports: [NgFor, NgIf, AsyncPipe, DatePipe, RouterLink, TranslatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HistoryComponent {
  private readonly expensesService = inject(ExpensesService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly refreshTrigger$ = new Subject<void>();

  readonly transactions$ = this.refreshTrigger$.pipe(
    startWith(undefined),
    switchMap(() => this.expensesService.getAll(this.buildFilters())),
    tap((items) => this.syncSelectedCategories(items))
  );
  readonly transactionsCount$ = this.transactions$.pipe(map((items) => items.length));
  readonly categoryOptions$ = this.categoriesService.getAll().pipe(map((items) => items.map((item) => item.name)));
  readonly selectedCategoryByExpenseId: Record<string, string> = {};
  deletingExpenseId: string | null = null;
  updatingExpenseId: string | null = null;
  readonly dateRangeOptions = [
    { value: 'last7', labelKey: 'history.range.last7' },
    { value: 'last30', labelKey: 'history.range.last30' },
    { value: 'thisMonth', labelKey: 'history.range.thisMonth' },
    { value: 'lastMonth', labelKey: 'history.range.lastMonth' }
  ];
  searchTerm = '';
  selectedDateRange = 'thisMonth';
  selectedCategory = '';

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

  onCategoryChange(expenseId: string | undefined, category: string): void {
    if (!expenseId) {
      return;
    }
    this.selectedCategoryByExpenseId[expenseId] = category;
  }

  reassignCategory(expense: Expense): void {
    if (!expense._id) {
      return;
    }

    const selectedCategory = this.selectedCategoryByExpenseId[expense._id] ?? expense.category;
    if (!selectedCategory || selectedCategory === expense.category) {
      return;
    }

    this.updatingExpenseId = expense._id;
    this.expensesService.updateCategory(expense._id, selectedCategory).subscribe({
      next: () => {
        this.updatingExpenseId = null;
        this.refreshTrigger$.next();
      },
      error: () => {
        this.updatingExpenseId = null;
      }
    });
  }

  async deleteExpense(expense: Expense): Promise<void> {
    if (!expense._id) {
      return;
    }

    const shouldDelete = await this.confirmDialogService.confirm({
      title: '¿Eliminar gasto?',
      message: 'Esta acción eliminará el gasto de forma permanente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });

    if (!shouldDelete) {
      return;
    }

    this.deletingExpenseId = expense._id;
    this.expensesService.remove(expense._id).subscribe({
      next: () => {
        this.deletingExpenseId = null;
        this.refreshTrigger$.next();
      },
      error: () => {
        this.deletingExpenseId = null;
      }
    });
  }

  applyFilters(): void {
    this.refreshTrigger$.next();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDateRange = 'thisMonth';
    this.selectedCategory = '';
    this.refreshTrigger$.next();
  }

  private syncSelectedCategories(items: Expense[]): void {
    items.forEach((expense) => {
      if (!expense._id) {
        return;
      }

      if (!this.selectedCategoryByExpenseId[expense._id]) {
        this.selectedCategoryByExpenseId[expense._id] = expense.category;
      }
    });
  }

  private buildFilters(): {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    status?: string;
  } {
    const range = this.resolveDateRange(this.selectedDateRange);

    return {
      start: range.start,
      end: range.end,
      category: this.selectedCategory || undefined,
      search: this.searchTerm.trim() || undefined
    };
  }

  private resolveDateRange(value: string): { start: string; end: string } {
    const now = new Date();

    if (value === 'last7') {
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      return { start: start.toISOString(), end: now.toISOString() };
    }

    if (value === 'last30') {
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      return { start: start.toISOString(), end: now.toISOString() };
    }

    if (value === 'lastMonth') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: start.toISOString(), end: end.toISOString() };
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
  }
}
