import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { DateRangeService } from './date-range.service';
import {
  BreakdownItem,
  CategorySummary,
  DailyTrendPoint,
  Expense,
  MonthlySummary,
  InsightCard
} from '../models/expense.models';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly dateRangeService: DateRangeService
  ) {}

  getAll(params?: {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    status?: string;
  }): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${environment.apiBaseUrl}/expenses`, {
      params: this.buildParams(params)
    });
  }

  getRecent(
    limit = 10,
    params?: { start?: string; end?: string; category?: string; search?: string; status?: string }
  ): Observable<Expense[]> {
    const httpParams = this.buildParams({ ...params, limit: String(limit) });
    return this.http.get<Expense[]>(`${environment.apiBaseUrl}/expenses/recent`, { params: httpParams });
  }

  getByCategory(params?: {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    status?: string;
  }): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${environment.apiBaseUrl}/expenses/by-category`, {
      params: this.buildParams(params)
    });
  }

  getDailyTrend(params?: {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    status?: string;
  }): Observable<DailyTrendPoint[]> {
    return this.http.get<DailyTrendPoint[]>(`${environment.apiBaseUrl}/expenses/daily-trend`, {
      params: this.buildParams(params)
    });
  }

  getBreakdown(
    limit = 4,
    params?: { start?: string; end?: string; category?: string; search?: string; status?: string }
  ): Observable<BreakdownItem[]> {
    const httpParams = this.buildParams({ ...params, limit: String(limit) });
    return this.http.get<BreakdownItem[]>(`${environment.apiBaseUrl}/expenses/breakdown`, {
      params: httpParams
    });
  }

  getMonthlySummary(params?: {
    start?: string;
    end?: string;
    category?: string;
    search?: string;
    status?: string;
  }): Observable<MonthlySummary> {
    return this.http.get<MonthlySummary>(`${environment.apiBaseUrl}/expenses/monthly-summary`, {
      params: this.buildParams(params)
    });
  }

  getInsights(): Observable<InsightCard[]> {
    return this.http.get<InsightCard[]>(`${environment.apiBaseUrl}/expenses/insights`, {
      params: this.buildParams()
    });
  }

  remove(id: string): Observable<{ deleted: true }> {
    const params = this.buildParams();
    return this.http.delete<{ deleted: true }>(`${environment.apiBaseUrl}/expenses/${id}`, params ? { params } : {});
  }

  updateCategory(id: string, category: string): Observable<Expense> {
    const activePhone = this.authService.activePhone() ?? this.authService.user()?.mainPhone;
    const payload = activePhone ? { category, phone: activePhone } : { category };
    return this.http.patch<Expense>(`${environment.apiBaseUrl}/expenses/${id}/category`, payload);
  }

  private buildParams(params?: Record<string, string | undefined>): HttpParams | undefined {
    const activePhone = this.authService.activePhone() ?? this.authService.user()?.mainPhone;
    const dateRange = this.dateRangeService.range();
    let httpParams = new HttpParams();
    if (activePhone) {
      httpParams = httpParams.set('phone', activePhone);
    }
    httpParams = httpParams.set('start', dateRange.start).set('end', dateRange.end);
    if (!params) {
      return httpParams;
    }
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });
    return httpParams;
  }
}
