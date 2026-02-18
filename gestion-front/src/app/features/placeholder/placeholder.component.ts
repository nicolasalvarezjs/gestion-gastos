import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { I18nService } from '../../shared/i18n/i18n.service';

@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.component.html',
  styleUrl: './placeholder.component.scss',
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaceholderComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly i18n = inject(I18nService);
  readonly titleKey = this.route.snapshot.data['titleKey'] ?? 'nav.dashboard';

  get title(): string {
    return this.i18n.t(this.titleKey);
  }
}
