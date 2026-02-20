import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { AuthService } from '../../shared/services/auth.service';

interface CountryOption {
  iso: string;
  label: string;
  dialCode: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [FormsModule, NgIf, NgFor, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
  phoneNumber = '';
  code = '';
  readonly step = signal<1 | 2>(1);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  get phoneForBackend(): string {
    const dialCode = this.selectedCountry.dialCode.replace('+', '');
    const phone = this.onlyDigits(this.phoneNumber);
    return `${dialCode}${phone}`;
  }

  get selectedCountry(): CountryOption {
    return this.countries.find((country) => country.iso === this.selectedCountryIso) ?? this.countries[0];
  }

  onCountryChange(countryIso: string): void {
    this.selectedCountryIso = countryIso;
  }

  onPhoneInput(phoneValue: string): void {
    this.phoneNumber = this.onlyDigits(phoneValue);
  }


  onCodeInput(rawValue: string): void {
    this.code = this.onlyDigits(rawValue).slice(0, 6);
  }

  requestCode(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    const phone = this.phoneForBackend;
    this.authService.setActivePhone(phone);

    this.authService.requestCode(phone).subscribe({
      next: () => {
        this.step.set(2);
        this.code = '';
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('login.errorPhoneNotFound');
        this.isLoading.set(false);
      }
    });
  }

  verifyCode(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    const phone = this.phoneForBackend;
    this.authService.setActivePhone(phone);

    this.authService.verifyCode(phone, this.code).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.errorMessage.set('login.errorInvalidCode');
        this.isLoading.set(false);
      }
    });
  }

  private onlyDigits(value: string): string {
    return value.replace(/\D/g, '');
  }

}
