import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
const TOKEN_KEY = 'auth.token';

interface AuthUser {
  mainPhone: string;
  secondaryPhones: string[];
}

interface VerifyResponse {
  accessToken: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.readToken());
  private readonly userSignal = signal<AuthUser | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.tokenSignal()));

  constructor(private readonly http: HttpClient) {}

  requestCode(phone: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${environment.apiBaseUrl}/auth/request-code`, {
      phone
    });
  }

  verifyCode(phone: string, code: string): Observable<VerifyResponse> {
    return this.http
      .post<VerifyResponse>(`${environment.apiBaseUrl}/auth/verify-code`, { phone, code })
      .pipe(tap((response) => this.setSession(response.accessToken, response.user)));
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
  }

  private setSession(token: string, user: AuthUser): void {
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    localStorage.setItem(TOKEN_KEY, token);
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }
}
