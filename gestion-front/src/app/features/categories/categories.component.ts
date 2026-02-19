import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { Category } from '../../shared/models/category.models';
import { CategoriesService } from '../../shared/services/categories.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  imports: [NgIf, NgFor, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoriesComponent {
  private readonly categoriesService = inject(CategoriesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  name = '';
  description = '';
  editingId: string | null = null;

  constructor() {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriesService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => {
          this.categories.set(items);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('categories.errorLoad');
          this.loading.set(false);
        }
      });
  }

  submit(): void {
    const payload = {
      name: this.name.trim(),
      description: this.description.trim()
    };

    if (!payload.name) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const request$ = this.editingId
      ? this.categoriesService.update(this.editingId, payload)
      : this.categoriesService.create(payload);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.resetForm();
        this.loadCategories();
      },
      error: () => {
        this.error.set('categories.errorSave');
        this.loading.set(false);
      }
    });
  }

  edit(category: Category): void {
    this.editingId = category._id;
    this.name = category.name;
    this.description = category.description ?? '';
  }

  remove(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.categoriesService
      .remove(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loadCategories();
        },
        error: () => {
          this.error.set('categories.errorDelete');
          this.loading.set(false);
        }
      });
  }

  resetForm(): void {
    this.editingId = null;
    this.name = '';
    this.description = '';
  }
}
