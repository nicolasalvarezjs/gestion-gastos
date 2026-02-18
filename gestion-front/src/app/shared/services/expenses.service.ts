import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  BreakdownItem,
  CategorySummary,
  DailyTrendPoint,
  Expense,
  MonthlySummary,
  InsightCard
} from '../models/expense.models';

const API_BASE_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  constructor(private readonly http: HttpClient) {}

  getAll(params?: { start?: string; end?: string }): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${API_BASE_URL}/expenses`, {
      params: this.buildParams(params)
    });
  }

  getRecent(limit = 10, params?: { start?: string; end?: string }): Observable<Expense[]> {
    const httpParams = this.buildParams({ ...params, limit: String(limit) });
    return this.http.get<Expense[]>(`${API_BASE_URL}/expenses/recent`, { params: httpParams });
  }

  getByCategory(params?: { start?: string; end?: string }): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${API_BASE_URL}/expenses/by-category`, {
      params: this.buildParams(params)
    });
  }

  getDailyTrend(params?: { start?: string; end?: string }): Observable<DailyTrendPoint[]> {
    return this.http.get<DailyTrendPoint[]>(`${API_BASE_URL}/expenses/daily-trend`, {
      params: this.buildParams(params)
    });
  }

  getBreakdown(limit = 4, params?: { start?: string; end?: string }): Observable<BreakdownItem[]> {
    const httpParams = this.buildParams({ ...params, limit: String(limit) });
    return this.http.get<BreakdownItem[]>(`${API_BASE_URL}/expenses/breakdown`, {
      params: httpParams
    });
  }

  getMonthlySummary(params?: { start?: string; end?: string }): Observable<MonthlySummary> {
    return this.http.get<MonthlySummary>(`${API_BASE_URL}/expenses/monthly-summary`, {
      params: this.buildParams(params)
    });
  }

  getInsights(): Observable<InsightCard[]> {
    return this.http.get<InsightCard[]>(`${API_BASE_URL}/expenses/insights`);
  }

  private buildParams(params?: Record<string, string | undefined>): HttpParams | undefined {
    if (!params) {
      return undefined;
    }
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    });
    return httpParams;
  }
}
