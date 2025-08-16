// src/app/core/lecturer.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, CanMatch, Route, UrlSegment, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class LecturerGuard implements CanActivate, CanMatch {
  constructor(private router: Router) {}

  private normalizeRole(r: any): string {
    return String(r || '').trim().toUpperCase().replace(/^ROLE_/, '');
  }
  private isLecturer(): boolean {
    const role = this.normalizeRole(localStorage.getItem('role'));
    return role === 'LECTURER';
  }

  canActivate(): boolean {
    if (!this.isLecturer()) { this.router.navigate(['/login']); return false; }
    return true;
  }
  canMatch(route: Route, segments: UrlSegment[]): boolean {
    if (!this.isLecturer()) { this.router.navigate(['/login']); return false; }
    return true;
  }
}
