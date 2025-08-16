import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

export type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';
export type Role   = 'ADMIN' | 'LECTURER' | 'CLASS_REP' | 'UNIVERSITY_REP';

export interface UserRow {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  campus?: string;
  course?: string;
  registration?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: Role;
  password: string;
  status: Status;          // admin-created => 'ACTIVE'
  campus?: string;
  course?: string;
  registration?: string;
}

/** DTO ya backend (/api/admin/users...) */
interface UserSummaryDto {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  role: Role;
  status: Status;
  campus?: string;
  course?: string;
  registrationNumber?: string;   // jina la field backend
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  /** Base URL: hakikisha environment.api inaishia na '/api' */
  private readonly apiRoot = (() => {
    const base = String((environment as any).api || '').replace(/\/+$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  })();

  private readonly base = `${this.apiRoot}/admin/users`;

  constructor(private http: HttpClient) {}

  /** Badili DTO -> UserRow (compose name kutoka first/last/name/email) */
  private dtoToRow = (it: UserSummaryDto): UserRow => ({
    id: it.id,
    name:
      (((it.firstName?.trim() || '') + ' ' + (it.lastName?.trim() || '')).trim())
      || (it.name?.trim() || it.email.split('@')[0]),
    email: it.email,
    role: it.role,
    status: it.status,
    campus: it.campus,
    course: it.course,
    registration: it.registrationNumber
  });

  /** GET /api/admin/users?status=ACTIVE */
  getApproved(): Observable<UserRow[]> {
    const params = new HttpParams().set('status', 'ACTIVE');
    return this.http.get<UserSummaryDto[]>(this.base, { params })
      .pipe(map(list => list.map(this.dtoToRow)));
  }

  /** GET /api/admin/users?status=PENDING */
  getPending(): Observable<UserRow[]> {
    const params = new HttpParams().set('status', 'PENDING');
    return this.http.get<UserSummaryDto[]>(this.base, { params })
      .pipe(map(list => list.map(this.dtoToRow)));
  }

  /** GET /api/admin/users?status=SUSPENDED */
  getSuspended(): Observable<UserRow[]> {
    const params = new HttpParams().set('status', 'SUSPENDED');
    return this.http.get<UserSummaryDto[]>(this.base, { params })
      .pipe(map(list => list.map(this.dtoToRow)));
  }

  /** (Optional) GET all bila filter */
  getAll(): Observable<UserRow[]> {
    return this.http.get<UserSummaryDto[]>(this.base)
      .pipe(map(list => list.map(this.dtoToRow)));
  }

  /** POST /api/admin/users */
  create(payload: CreateUserDto): Observable<UserRow> {
    return this.http.post<UserSummaryDto>(this.base, payload)
      .pipe(map(this.dtoToRow));
  }

  /** PATCH /api/admin/users/{id}/approve */
  approve(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/approve`, {});
  }

  /** PATCH /api/admin/users/{id}/suspend */
  suspend(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/suspend`, {});
  }

  /** PATCH /api/admin/users/{id}/activate  — re-activate suspended user */
  activate(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/activate`, {});
  }

  /** DELETE /api/admin/users/{id} */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
