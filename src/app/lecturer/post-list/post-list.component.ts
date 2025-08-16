import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { PostItem, Audience } from '../../core/models/post.models';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  q = '';
  page = 0;
  size = 10;

  items: (PostItem & {
    _editing?: boolean;
    _text?: string;
    _link?: string;
    _aud?: Audience;
    _classId?: number | null;
  })[] = [];
  total = 0;
  loading = false;
  error = '';

  classes = [
    { id: 101, code: 'BITA'  },
    { id: 102, code: 'DITA'  },
    { id: 103, code: 'BAF'   },
    { id: 104, code: 'BEI'   },
    { id: 105, code: 'DFA'   },
    { id: 106, code: 'BITAM' },
  ];
  private classMap = new Map<number, string>();

  constructor(private posts: PostService) {}

  ngOnInit(): void {
    this.buildClassMap();
    this.load();
  }
  private buildClassMap() { this.classMap.clear(); for (const c of this.classes) this.classMap.set(c.id, c.code); }
  classCode(id?: number | null): string { return id == null ? '' : (this.classMap.get(id) ?? String(id)); }

  load() {
    this.loading = true; this.error = '';
    this.posts.myPosts(this.page, this.size, this.q).subscribe({
      next: (res) => { this.items = (res.content || []).map(p => ({ ...p })); this.total = res.totalElements || 0; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || err?.message || 'Failed to load posts'; this.loading = false; },
    });
  }
  search() { this.page = 0; this.load(); }

  audienceLabel(p: PostItem) { return (p.audienceType || 'ALL_STUDENTS') === 'CLASSES' ? 'Classes' : 'All Students'; }

  edit(p: any) {
    p._editing = true;
    p._text = p.text;
    p._link = p.link || '';
    p._aud  = (p.audienceType as Audience) || 'ALL_STUDENTS';
    p._classId = p.classId ?? null;
  }
  cancel(p: any) { p._editing = false; }

  // NOW: Save == Repost (create a new post)
  repost(p: any) {
    const dto: any = {
      audienceType: p._aud || 'ALL_STUDENTS',
      classId: p._aud === 'CLASSES' ? (p._classId ?? null) : null,
      text: String(p._text ?? '').trim(),           // empty allowed
      link: p._link ? String(p._link).trim() : null
    };
    // Kama hakuna chochote, situme
    if (!dto.text && !dto.link) {
      this.error = 'Add text or a link before reposting.';
      return;
    }
    this.posts.create(dto).subscribe({
      next: () => { p._editing = false; this.load(); },
      error: (err) => { this.error = err?.error?.message || err?.message || 'Repost failed'; },
    });
  }

  del(p: PostItem) {
    if (!confirm('Delete this post?')) return;
    this.posts.delete(p.id).subscribe({
      next: () => this.load(),
      error: (err) => this.error = err?.error?.message || err?.message || 'Delete failed',
    });
  }
}
