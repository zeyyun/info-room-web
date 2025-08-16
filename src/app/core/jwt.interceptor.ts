// src/app/core/jwt.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = req.url || '';
    const isOpen = url.includes('/api/open/');
    const isAuth = url.includes('/api/auth/') || url.includes('/auth/');
    const isOptions = req.method === 'OPTIONS';
    const skipHeader = req.headers.has('X-Skip-Auth'); // force-skip kwa request maalum

    // Skip kabisa public/auth endpoints na preflight
    if (isOpen || isAuth || isOptions || skipHeader) {
      // hakikisha Authorization haipo
      const clean = req.clone({ headers: req.headers.delete('Authorization') });
      return next.handle(clean);
    }

    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token.trim() !== '') {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
    return next.handle(req);
  }
}
