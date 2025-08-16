import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UpdatesService, CreateUpdateDto } from '../services/updates.service';

@Component({
  selector: 'app-create-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-update.component.html',
  styleUrls: ['./create-update.component.css'],
})
export class CreateUpdateComponent {
  // list za static: tumetumia zile zako
  classesList = ['BITA', 'BITAM', 'BSC', 'BBA', 'BAF', 'DFA', 'DITA'];
  campuses    = ['Tunguu', 'Beit-el-Raas', 'Maruhubi', 'Vuga'];

  loading = false;
  error = '';
  success = '';
  selectedFile?: File;

  form = this.fb.group({
    audience: ['CLASSES', Validators.required],  // 'ALL' | 'CLASSES'
    classes:  [[] as string[]],
    campus:   [''],
    text:     ['', [Validators.required, Validators.minLength(2)]],
    link:     [''],
  });

  constructor(private fb: FormBuilder, private updates: UpdatesService) {}

  get isClasses() { return this.form.value.audience === 'CLASSES'; }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.selectedFile = input?.files?.[0] || undefined;
  }

  submit() {
    if (this.loading) return;

    if (this.isClasses && !(this.form.value.classes && this.form.value.classes.length)) {
      this.error = 'Please select at least one class.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    const v = this.form.getRawValue();
    const dto: CreateUpdateDto = {
      text: (v.text || '').trim(),
      audience: v.audience as 'ALL' | 'CLASSES',
      classes: this.isClasses ? (v.classes || []) : undefined,
      campus: v.campus || undefined,
      link:   v.link?.trim() || undefined,
    };

    this.updates.create(dto, this.selectedFile).subscribe({
      next: () => {
        this.success = 'Posted successfully.';
        this.form.reset({ audience: 'CLASSES', classes: [] });
        this.selectedFile = undefined;
      },
      error: (err) => {
        this.error =
          (typeof err?.error === 'string' && err.error) ||
          err?.error?.message ||
          `Failed to post (HTTP ${err?.status || '??'})`;
      },
      complete: () => (this.loading = false),
    });
  }
}
