import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, of, switchMap, tap } from 'rxjs';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { AuthService } from '../../shared/services/auth.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { UsersService } from '../../shared/services/users.service';

interface CountryOption {
  iso: string;
  label: string;
  dialCode: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly confirmDialogService = inject(ConfirmDialogService);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly countries: CountryOption[] = [
    { iso: 'AR', label: 'Argentina', dialCode: '+549' },
    { iso: 'UY', label: 'Uruguay', dialCode: '+598' },
    { iso: 'CL', label: 'Chile', dialCode: '+56' },
    { iso: 'BR', label: 'Brasil', dialCode: '+55' },
    { iso: 'PY', label: 'Paraguay', dialCode: '+595' },
    { iso: 'BO', label: 'Bolivia', dialCode: '+591' },
    { iso: 'PE', label: 'Perú', dialCode: '+51' },
    { iso: 'MX', label: 'México', dialCode: '+52' },
    { iso: 'US', label: 'Estados Unidos', dialCode: '+1' },
    { iso: 'ES', label: 'España', dialCode: '+34' }
  ];

  selectedCountryIso = 'AR';
  secondaryLocalNumber = '';
  isSaving = false;
  removingPhone: string | null = null;
  errorMessage = '';
  activeMainPhone = '';

  readonly profile$ = this.refresh$.pipe(
    switchMap(() => {
      const activePhone = this.authService.user()?.mainPhone ?? this.authService.activePhone();
      if (!activePhone) {
        return of(null);
      }
      return this.usersService.getUserByPhone(activePhone);
    }),
    tap((profile) => {
      this.activeMainPhone = profile?.mainPhone ?? '';
    })
  );

  addSecondary(): void {
    const normalizedLocal = this.secondaryLocalNumber.replace(/\D/g, '');
    const dialCode = this.selectedCountry.dialCode.replace('+', '');
    const normalized = `${dialCode}${normalizedLocal}`;

    if (!this.activeMainPhone || !normalizedLocal) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.usersService.addSecondary(this.activeMainPhone, { phone: normalized }).subscribe({
      next: () => {
        this.isSaving = false;
        this.secondaryLocalNumber = '';
        this.refresh$.next();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'settings.secondary.error';
      }
    });
  }

  async removeSecondary(phone: string): Promise<void> {
    if (!this.activeMainPhone || !phone) {
      return;
    }

    const shouldDelete = await this.confirmDialogService.confirm({
      title: '¿Eliminar número secundario?',
      message: `Se eliminará el número ${phone} de tu familia.`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      variant: 'danger'
    });

    if (!shouldDelete) {
      return;
    }

    this.removingPhone = phone;
    this.errorMessage = '';

    this.usersService.removeSecondary(this.activeMainPhone, phone).subscribe({
      next: () => {
        this.removingPhone = null;
        this.refresh$.next();
      },
      error: () => {
        this.removingPhone = null;
        this.errorMessage = 'settings.secondary.removeError';
      }
    });
  }

  get selectedCountry(): CountryOption {
    return this.countries.find((country) => country.iso === this.selectedCountryIso) ?? this.countries[0];
  }
}
