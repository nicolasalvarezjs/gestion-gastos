import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { I18nService } from '../shared/i18n/i18n.service';
import { TranslatePipe } from '../shared/i18n/translate.pipe';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  imports: [NgIf, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private readonly i18n: I18nService) {}

  readonly currentMonthLabel = computed(() => {
    const locale = this.i18n.language() === 'es' ? 'es-AR' : 'en-US';
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date());
  });

  toggleLanguage(): void {
    this.i18n.toggleLanguage();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
