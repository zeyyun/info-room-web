import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestDebugInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const hasAuth = req.headers.has('Authorization');
    console.log('[DBG→]', req.method.toUpperCase(), req.url, 'AuthHeader?', hasAuth);

    return next.handle(req).pipe(
      tap(evt => {
        if (evt instanceof HttpResponse) {
          console.log('[←DBG]', req.method.toUpperCase(), req.url, 'Status', evt.status);
        }
      })
    );
  }
}
