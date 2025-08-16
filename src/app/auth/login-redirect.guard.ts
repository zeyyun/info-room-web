import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LoginRedirectGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(): boolean | UrlTree {
    if (this.auth.isLoggedIn()) {
      return this.router.parseUrl(this.auth.dashboardFor(this.auth.role()));
    }
    return true;
  }
}
