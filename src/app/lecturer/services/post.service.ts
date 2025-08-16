import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreatePostDto, PostItem } from '../../core/models/post.models';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly BASE = '/api/posts';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders | undefined {
    const raw = (localStorage.getItem('token') || '').trim();
    if (!raw) return undefined;
    const bearer = raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`;
    return new HttpHeaders({ Authorization: bearer });
  }

  create(dto: CreatePostDto, attachment?: File | null): Observable<PostItem> {
    const hasFile = attachment instanceof File;

    if (!hasFile) {
      const body: any = {
        text: String(dto.text ?? '').trim(),
        link: dto.link ? String(dto.link).trim() : null,
        audienceType: dto.audienceType || 'ALL_STUDENTS',
        classId: dto.classId ?? null,
      };
      const headers = this.authHeaders();
      return headers
        ? this.http.post<PostItem>(this.BASE, body, { headers })
        : this.http.post<PostItem>(this.BASE, body);
    }

    const form = new FormData();
    form.append('text', String(dto.text ?? '').trim());
    if (dto.link) form.append('link', String(dto.link).trim());
    form.append('audienceType', dto.audienceType || 'ALL_STUDENTS');
    if (dto.classId != null) form.append('classId', String(dto.classId));
    form.append('image', attachment!, attachment!.name);

    const headers = this.authHeaders();
    return headers
      ? this.http.post<PostItem>(this.BASE, form, { headers })
      : this.http.post<PostItem>(this.BASE, form);
  }

  update(id: number, dto: Partial<CreatePostDto & { text: string; link?: string }>): Observable<PostItem> {
    const headers = this.authHeaders();
    return headers
      ? this.http.put<PostItem>(`${this.BASE}/${id}`, dto, { headers })
      : this.http.put<PostItem>(`${this.BASE}/${id}`, dto);
  }

  myPosts(page = 0, size = 10, q?: string) {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q && q.trim()) params = params.set('q', q.trim());
    const headers = this.authHeaders();
    return headers
      ? this.http.get<{ content: PostItem[]; totalElements: number }>(`${this.BASE}/mine`, { params, headers })
      : this.http.get<{ content: PostItem[]; totalElements: number }>(`${this.BASE}/mine`, { params });
  }

  delete(id: number) {
    const headers = this.authHeaders();
    return headers
      ? this.http.delete<void>(`${this.BASE}/${id}`, { headers })
      : this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
