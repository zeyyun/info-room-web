import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Audience = 'ALL' | 'CLASSES';

export interface CreateUpdateDto {
  text: string;
  audience: Audience;  // 'ALL' | 'CLASSES'
  classes?: string[];  // kama audience = 'CLASSES'
  campus?: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class UpdatesService {
  // tumia environment.api au apiBase — hakikisha moja ipo kwenye environment.ts
  private base =
    (environment as any).api
      ? `${(environment as any).api}/lecturer/updates`
      : `${(environment as any).apiBase}/lecturer/updates`;

  constructor(private http: HttpClient) {}

  // Tuma kama multipart/form-data (inasaidia file + fields)
  create(update: CreateUpdateDto, image?: File): Observable<any> {
    const fd = new FormData();
    fd.append('text', update.text);
    fd.append('audience', update.audience);
    if (update.campus) fd.append('campus', update.campus);
    if (update.link)   fd.append('link', update.link);

    // arrays hutumwa kama repeated keys: classes=BITA&classes=BITAM...
    if (update.audience === 'CLASSES' && update.classes?.length) {
      update.classes.forEach(c => fd.append('classes', c));
    }

    if (image) fd.append('image', image, image.name);

    return this.http.post(this.base, fd);
  }
}
