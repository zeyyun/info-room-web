// src/app/core/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(): boolean {
    const role = localStorage.getItem('role'); // e.g. LECTURER
    if (role !== 'LECTURER' && role !== 'ADMIN') {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}
