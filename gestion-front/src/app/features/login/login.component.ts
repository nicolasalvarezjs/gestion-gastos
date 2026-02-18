import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  imports: [FormsModule, NgIf, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  phone = '';
  code = '';
  readonly step = signal<1 | 2>(1);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  requestCode(): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.requestCode(this.phone).subscribe({
      next: () => {
        this.step.set(2);
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

    this.authService.verifyCode(this.phone, this.code).subscribe({
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
}
