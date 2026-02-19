import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
const TOKEN_KEY = 'auth.token';
const PHONE_KEY = 'auth.phone';

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
  private readonly phoneSignal = signal<string | null>(this.readPhone());

  readonly token = this.tokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly activePhone = this.phoneSignal.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this.tokenSignal()));

  constructor(private readonly http: HttpClient) {}

  requestCode(phone: string): Observable<{ success: boolean; message: string }> {
    this.setActivePhone(phone);
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
    this.phoneSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PHONE_KEY);
  }

  setActivePhone(phone: string): void {
    const normalized = phone.trim();
    if (!normalized) {
      return;
    }
    this.phoneSignal.set(normalized);
    localStorage.setItem(PHONE_KEY, normalized);
  }

  private setSession(token: string, user: AuthUser): void {
    this.tokenSignal.set(token);
    this.userSignal.set(user);
    this.setActivePhone(user.mainPhone);
    localStorage.setItem(TOKEN_KEY, token);
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  private readPhone(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(PHONE_KEY);
  }
}
