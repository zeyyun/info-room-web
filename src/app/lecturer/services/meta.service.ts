// src/app/lecturer/services/meta.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Campus, ClassItem } from '../../core/models/post.models';

@Injectable({ providedIn: 'root' })
export class MetaService {
  constructor(private http: HttpClient) {}

  getCampuses(): Observable<Campus[]> {
    return this.http.get<Campus[]>('/api/meta/campuses');
  }

  getClasses(campusId?: number): Observable<ClassItem[]> {
    const options = campusId != null
      ? { params: new HttpParams().set('campusId', campusId) }
      : {};
    return this.http.get<ClassItem[]>('/api/meta/classes', options);
  }
}
