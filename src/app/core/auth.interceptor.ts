import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

function stripTrailingSlashes(s: string) {
  return String(s || '').replace(/\/+$/, '');
}
function stripLeadingSlashes(s: string) {
  return String(s || '').replace(/^\/+/, '');
}
function ensureApi(base: string) {
  const b = stripTrailingSlashes(base || (environment as any).apiBase || 'http://localhost:9090');
  return b.endsWith('/api') ? b : `${b}/api`;
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Root ya API (supports environment.api or environment.apiBase)
  private readonly apiRoot = ensureApi((environment as any).api || (environment as any).apiBase || '');

  /** Geuza url relative → absolute kwa kutumia apiRoot */
  private toAbsolute(url: string): string {
    if (/^https?:\/\//i.test(url)) return url;
    const rel = stripLeadingSlashes(url).replace(/^api\/+/, '');
    return `${this.apiRoot}/${rel}`;
  }

  /** Pata pathname salama */
  private pathname(u: string): string {
    try {
      return new URL(u, window.location.origin).pathname || '/';
    } catch {
      return '/' + stripLeadingSlashes(u);
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const absUrl = this.toAbsolute(req.url);
    const path = this.pathname(absUrl);
    const method = (req.method || 'GET').toUpperCase();

    const isOptions = method === 'OPTIONS';
    const isApi = path.startsWith('/api/');
    const isOpen = isApi && path.startsWith('/api/open/');
    const isAuthLogin = isApi && path === '/api/auth/login';

    // Skip OPTIONS, /api/open/** na /api/auth/login (hakuna Authorization)
    const shouldSkip = isOptions || isOpen || isAuthLogin || !isApi;

    if (shouldSkip) {
      return next.handle(absUrl !== req.url ? req.clone({ url: absUrl }) : req);
    }

    // Kwa rasilimali nyingine zote za /api/** weka Bearer token kama ipo
    const raw = (localStorage.getItem('token') || '').trim();
    const bearer = raw && !/^Bearer\s+/i.test(raw) ? `Bearer ${raw}` : raw;

    const authReq = req.clone({
      url: absUrl,
      setHeaders: bearer ? { Authorization: bearer } : {},
    });

    return next.handle(authReq);
  }
}
