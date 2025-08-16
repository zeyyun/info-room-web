// src/app/core/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, UrlSegment, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate, CanMatch {
  constructor(private router: Router) {}

  private normalizeRole(r: any): string {
    return String(r || '').trim().toUpperCase().replace(/^ROLE_/, '');
  }
  private isAdmin(): boolean {
    const role = this.normalizeRole(localStorage.getItem('role'));
    return role === 'ADMIN';
  }

  canActivate(): boolean {
    if (!this.isAdmin()) { this.router.navigate(['/login']); return false; }
    return true;
  }
  canMatch(route: Route, segments: UrlSegment[]): boolean {
    if (!this.isAdmin()) { this.router.navigate(['/login']); return false; }
    return true;
  }
}
