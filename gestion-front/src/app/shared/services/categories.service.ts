import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly http: HttpClient, private readonly authService: AuthService) {}

  private buildPhoneParams(): HttpParams | null {
    const phone = this.authService.user()?.mainPhone;
    return phone ? new HttpParams().set('phone', phone) : null;
  }

  private withPhone<T extends { phone?: string }>(dto: T): T {
    const phone = this.authService.user()?.mainPhone;
    if (!phone || dto.phone) {
      return dto;
    }
    return { ...dto, phone };
  }

  getAll(): Observable<Category[]> {
    const params = this.buildPhoneParams();
    return this.http.get<Category[]>(`${environment.apiBaseUrl}/categories`, params ? { params } : {});
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${environment.apiBaseUrl}/categories`, this.withPhone(dto));
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    return this.http.patch<Category>(`${environment.apiBaseUrl}/categories/${id}`, this.withPhone(dto));
  }

  remove(id: string): Observable<{ deleted: true }> {
    const params = this.buildPhoneParams();
    return this.http.delete<{ deleted: true }>(`${environment.apiBaseUrl}/categories/${id}`, params ? { params } : {});
  }
}