import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiBaseUrl}/categories`);
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${environment.apiBaseUrl}/categories`, dto);
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    return this.http.patch<Category>(`${environment.apiBaseUrl}/categories/${id}`, dto);
  }

  remove(id: string): Observable<{ deleted: true }> {
    return this.http.delete<{ deleted: true }>(`${environment.apiBaseUrl}/categories/${id}`);
  }
}