import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.models';

const API_BASE_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  create(dto: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(`${API_BASE_URL}/categories`, dto);
  }

  update(id: string, dto: UpdateCategoryDto): Observable<Category> {
    return this.http.patch<Category>(`${API_BASE_URL}/categories/${id}`, dto);
  }

  remove(id: string): Observable<{ deleted: true }> {
    return this.http.delete<{ deleted: true }>(`${API_BASE_URL}/categories/${id}`);
  }
}