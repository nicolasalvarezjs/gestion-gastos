import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../shared/i18n/i18n.service';
import { TranslatePipe } from '../shared/i18n/translate.pipe';
import { AuthService } from '../shared/services/auth.service';
import { DateRangeService } from '../shared/services/date-range.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  imports: [NgIf, NgFor, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly i18n = inject(I18nService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dateRangeService = inject(DateRangeService);

  readonly monthOptions = this.dateRangeService.monthOptions;
  readonly selectedMonth = this.dateRangeService.selectedMonth;

  readonly currentMonthLabel = computed(() => {
    const monthValue = this.selectedMonth();
    const [yearValue, rawMonth] = monthValue.split('-').map((item) => Number(item));
    const monthDate = new Date(yearValue, rawMonth - 1, 1);
    const locale = this.i18n.language() === 'es' ? 'es-AR' : 'en-US';
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(monthDate);
  });

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  onMonthChange(month: string): void {
    this.dateRangeService.setMonth(month);
  }
}
