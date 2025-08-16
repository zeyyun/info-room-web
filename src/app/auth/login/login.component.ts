// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  showPassword = false;
  loading = false;
  error = '';
  success = '';
  currentYear = new Date().getFullYear();

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  toggle() { this.showPassword = !this.showPassword; }

  // ---------- helpers ----------
  private normalizeRole(r: any): string {
    return String(r || '').trim().toUpperCase().replace(/^ROLE_/, '');
  }

  private decodeJwt(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
      );
      return JSON.parse(json);
    } catch { return null; }
  }

  private roleFromToken(token: string): string {
    const p = this.decodeJwt(token) || {};
    const candidates: any[] = [
      p.role,
      Array.isArray(p.roles) ? p.roles[0] : p.roles,
      Array.isArray(p.authorities) ? p.authorities[0] : p.authorities,
      Array.isArray(p.scope) ? p.scope[0] : p.scope,
      Array.isArray(p.scopes) ? p.scopes[0] : p.scopes,
    ].filter(Boolean);
    const found = candidates.find(Boolean) || '';
    return this.normalizeRole(found);
  }

  private go(url: string) {
    return this.router.navigate([url], { replaceUrl: true });
  }

  private navigateByRole(roleRaw: string) {
    const role = this.normalizeRole(roleRaw);
    switch (role) {
      case 'ADMIN': return this.go('/admin');
      case 'LECTURER': return this.go('/lecturer');
      case 'CLASS_REP':
      case 'UNIVERSITY_REP': return this.go('/admin'); // muda
      default: return this.go('/login');
    }
  }
  // -----------------------------

  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.success = '';

    const emailInput = String(this.form.value.email || '').trim().toLowerCase();
    const defaultAdmin = String((environment as any).defaultAdminEmail || '').trim().toLowerCase();

    this.auth.login(this.form.value as any).subscribe({
      next: (res: any) => {
        if (res?.status && String(res.status).toUpperCase() !== 'ACTIVE') {
          this.loading = false;
          this.error =
            String(res.status).toUpperCase() === 'PENDING'
              ? 'Your account is pending approval by admin.'
              : 'Your account is not active. Please contact admin.';
          return;
        }

        let role = this.normalizeRole(res?.role);
        if (!role && res?.token) role = this.roleFromToken(res.token);
        if (!role && defaultAdmin && emailInput === defaultAdmin) role = 'ADMIN';

        if (!res?.token || !role) {
          this.loading = false;
          this.error = 'Login succeeded but role/token missing. Contact admin.';
          return;
        }

        this.auth.setSession(res.token, role);

        if (res?.name)  localStorage.setItem('name',  res.name);
        if (res?.email) localStorage.setItem('email', res.email);

        this.success = 'Logged in successfully.';
        this.loading = false;

        this.navigateByRole(role);
      },
      error: (err: HttpErrorResponse) => {
        this.error =
          (typeof err?.error === 'string' && err.error) ||
          (err?.error as any)?.message ||
          (err?.error as any)?.error ||
          'Login failed. Please check your email or password.';
        this.loading = false;
      }
    });
  }

  goRegister() { this.router.navigate(['/register']); }
  get f() { return this.form.controls; }
}
