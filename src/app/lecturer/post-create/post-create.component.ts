import { Component, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { PostService } from '../services/post.service';
import { MetaService } from '../services/meta.service';
import { ClassItem, CreatePostDto } from '../../core/models/post.models';

type Audience = 'ALL_STUDENTS' | 'CLASSES';

const DEFAULT_CLASSES: ClassItem[] = [
  { id: 101, code: 'BITA'  },
  { id: 102, code: 'DITA'  },
  { id: 103, code: 'BAF'   },
  { id: 104, code: 'BEI'   },
  { id: 105, code: 'DFA'   },
  { id: 106, code: 'BITAM' },
];

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  @Output() posted = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;

  classes: ClassItem[] = [];
  audienceType: Audience = 'ALL_STUDENTS';
  attachment: File | null = null;

  busy = false;
  error = '';
  success = '';

  form = this.fb.group({
    audienceType: ['ALL_STUDENTS' as Audience],
    classId: [null as number | null],
    // text ni OPTIONAL sasa: hakuna required/minLength
    text: [''],
    link: [
      '',
      Validators.pattern(
        /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i
      ),
    ],
  });

  constructor(
    private fb: FormBuilder,
    private posts: PostService,
    private meta: MetaService
  ) {
    this.classes = DEFAULT_CLASSES;
    this.meta.getClasses().subscribe({
      next: (r) => { if (Array.isArray(r) && r.length) this.classes = r; },
      error: () => {},
    });

    this.f.audienceType.valueChanges.subscribe(v =>
      this.onAudienceChange((v ?? 'ALL_STUDENTS') as Audience)
    );
  }

  get f() {
    return {
      audienceType: this.form.get('audienceType')!,
      classId: this.form.get('classId')!,
      text: this.form.get('text')!,
      link: this.form.get('link')!,
    };
  }

  onAudienceChange(v: Audience) {
    this.audienceType = v;
    if (v === 'ALL_STUDENTS') this.form.patchValue({ classId: null });
  }

  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] || null;
    this.attachment = file;
  }
  cancelFile() {
    this.attachment = null;
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
  }

  submit() {
    this.error = '';
    this.success = '';

    if (this.audienceType === 'CLASSES' && !this.form.value.classId) {
      this.error = 'Please select a class.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const text = (this.form.value.text || '').trim();
    const link = (this.form.value.link || '').trim();
    const hasImage = !!this.attachment;
    const hasAnything = !!text || !!link || hasImage;

    if (!hasAnything) {
      this.error = 'Add text, or a link, or an image.';
      return;
    }

    const dto: CreatePostDto = {
      audienceType: (this.form.value.audienceType as Audience) || 'ALL_STUDENTS',
      classId: this.form.value.classId ?? undefined,
      text,                          // tupu inaruhusiwa (backend itakubali)
      link: link || undefined,
    };

    this.busy = true;
    this.form.disable();

    this.posts.create(dto, this.attachment)
      .pipe(finalize(() => { this.busy = false; this.form.enable(); }))
      .subscribe({
        next: () => {
          this.success = 'Posted successfully.';
          this.form.reset({
            audienceType: 'ALL_STUDENTS',
            classId: null,
            text: '',
            link: '',
          });
          this.cancelFile();
          this.posted.emit();
        },
        error: (err) => {
          this.error =
            err?.error?.detail ||
            err?.error?.message ||
            err?.message ||
            'Failed to post.';
        },
      });
  }
}
