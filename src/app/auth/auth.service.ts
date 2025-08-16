// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, Role } from '../core/models/auth.models';

function stripTrailingSlashes(s: string) { return String(s || '').replace(/\/+$/, ''); }
function stripLeadingSlashes(s: string) { return String(s || '').replace(/^\/+/, ''); }
function joinApi(base: string, path: string): string {
  const b = stripTrailingSlashes((base as any));
  const p = stripLeadingSlashes(path).replace(/^api\/+/, '');
  return `${b}/${p}`;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBase =
    stripTrailingSlashes((environment as any).apiBase || (environment as any).api || 'http://localhost:9090');

  private readonly loginPath = '/api/auth/login';
  private readonly registerPath = '/api/open/register';

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    const url = joinApi(this.apiBase, this.loginPath);
    return this.http.post<LoginResponse>(url, body, { observe: 'response' }).pipe(
      map((resp: HttpResponse<LoginResponse>) => {
        const out: any = resp.body || {};
        let token =
          (out?.token as string) ||
          (out as any)?.jwt ||
          (out as any)?.accessToken ||
          (out as any)?.data?.token;

        if (!token) {
          const authHeader = resp.headers.get('Authorization') || resp.headers.get('authorization') || '';
          const m = authHeader.match(/^Bearer\s+(.+)$/i);
          if (m) token = m[1].trim();
        }

        if (token && !out.token) out.token = token;
        return out as LoginResponse;
      })
    );
  }

  register(body: RegisterRequest) {
    const url = joinApi(this.apiBase, this.registerPath);
    return this.http.post(url, body);
  }

  setSession(token: string, role: string) {
    if (token) localStorage.setItem('token', token);
    if (role)  localStorage.setItem('role', role);
  }

  isLoggedIn() { return !!localStorage.getItem('token'); }
  role() { return localStorage.getItem('role'); }

  dashboardFor(role: string | null): string {
    switch (role as Role) {
      case 'ADMIN': return '/admin';
      case 'LECTURER': return '/lecturer';
      case 'CLASS_REP': return '/class-rep';
      case 'UNIVERSITY_REP': return '/uni-rep';
      default: return '/';
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  /** POST /api/auth/change-password (JWT required; interceptor ataweka header) */
  changePassword(currentPassword: string, newPassword: string) {
  return this.http.post<{ message: string }>(
    '/api/auth/change-password',
    { currentPassword, newPassword }
  );
  }
}
