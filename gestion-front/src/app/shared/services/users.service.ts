import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddSecondaryPhoneDto, UserProfile } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly http: HttpClient) {}

  getUserByPhone(phone: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiBaseUrl}/users/by-phone/${phone}`);
  }

  getUser(mainPhone: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiBaseUrl}/users/${mainPhone}`);
  }

  addSecondary(mainPhone: string, dto: AddSecondaryPhoneDto): Observable<UserProfile> {
    return this.http.post<UserProfile>(`${environment.apiBaseUrl}/users/${mainPhone}/secondary`, dto);
  }

  removeSecondary(mainPhone: string, phone: string): Observable<UserProfile> {
    return this.http.delete<UserProfile>(`${environment.apiBaseUrl}/users/${mainPhone}/secondary/${phone}`);
  }
}