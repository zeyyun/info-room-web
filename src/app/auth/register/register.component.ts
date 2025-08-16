import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth.service';
import { Role, RegisterRequest } from '../../core/models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  roles: Role[] = ['CLASS_REP', 'UNIVERSITY_REP', 'LECTURER', 'ADMIN'];

  campuses = ['Tunguu', 'Beit-el-Raas', 'Maruhubi', 'Vuga'];
  courses  = ['BITA', 'BSC', 'BBA', 'BAF', 'BITAM', 'DFA', 'DITA'];

  loading = false;
  error = '';
  success = '';
  private roleSub?: Subscription;

  showPassword = false;
  showConfirm  = false;

  private passwordsMatch: ValidatorFn = (group: AbstractControl) => {
    const pass = group.get('password')?.value ?? '';
    const conf = group.get('confirmPassword')?.value ?? '';
    if (!conf) return null;
    return pass === conf ? null : { mismatch: true };
  };

  form = this.fb.group(
    {
      firstName: ['', [Validators.required]],
      lastName:  ['', [Validators.required]],
      email:     ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role:      ['CLASS_REP' as Role, [Validators.required]],
      campus:             [''],
      course:             [''],
      registrationNumber: [''],
    },
    { validators: [] }
  );

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form.setValidators(this.passwordsMatch);
  }

  ngOnInit(): void {
    this.applyRules(this.form.value.role as Role);
    this.roleSub = this.form.get('role')!.valueChanges.subscribe((r) =>
      this.applyRules(r as Role)
    );
  }

  ngOnDestroy(): void {
    this.roleSub?.unsubscribe();
  }

  private setReq(ctrl: AbstractControl, required: boolean, minLen?: number) {
    const validators = required ? [Validators.required] : [];
    if (minLen) validators.push(Validators.minLength(minLen));
    ctrl.setValidators(validators);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  /** CLASS_REP = campus+course+regNo required; wengine optional */
  applyRules(role: Role) {
    const campus = this.form.get('campus')!;
    const course = this.form.get('course')!;
    const regNo  = this.form.get('registrationNumber')!;

    if (role === 'CLASS_REP') {
      this.setReq(campus, true);
      this.setReq(course, true);
      this.setReq(regNo,  true);
    } else {
      this.setReq(campus, false);
      this.setReq(course, false);
      this.setReq(regNo,  false);
    }
  }

  private norm(v: any): string | undefined {
    if (v === null || v === undefined) return undefined;
    const t = String(v).trim();
    return t.length ? t : undefined;
  }

  /** Build payload; tuma aliases zote mbili (registration & registrationNumber) kwa upatanifu */
  private buildPayload(): RegisterRequest {
    const v = this.form.getRawValue();
    const base: any = {
      firstName: (this.norm(v.firstName) ?? '') as string,
      lastName:  (this.norm(v.lastName)  ?? '') as string,
      email:     (this.norm(v.email)?.toLowerCase() ?? '') as string,
      password:  v.password!,
      role:      v.role as Role,
    };

    if (v.role === 'CLASS_REP') {
      base.campus = this.norm(v.campus);
      base.course = this.norm(v.course);
      const reg = this.norm(v.registrationNumber);
      base.registration = reg;
      base.registrationNumber = reg;
    } else if (v.role === 'UNIVERSITY_REP') {
      const c = this.norm(v.campus); if (c) base.campus = c;
      const crs = this.norm(v.course); if (crs) base.course = crs;
      const rn = this.norm(v.registrationNumber);
      if (rn) { base.registration = rn; base.registrationNumber = rn; }
    }
    // LECTURER/ADMIN: hakuna extra

    Object.keys(base).forEach((k) => {
      if (base[k] === undefined || base[k] === '') delete base[k];
    });

    return base as RegisterRequest;
  }

  submit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    this.loading = true;
    this.error = '';
    this.success = '';
    this.auth.register(payload).subscribe({
      next: () => { this.router.navigate(['/login']); },
      error: (err: HttpErrorResponse) => {
        const msg =
          err?.error?.message ??
          (typeof err?.error === 'string' ? err.error : null) ??
          err?.message ??
          'Registration failed. Please try again.';
        this.error = msg;
        this.loading = false;
      },
      complete: () => { this.loading = false; }
    });
  }

  togglePass(which: 'pass' | 'confirm') {
    if (which === 'pass') this.showPassword = !this.showPassword;
    else this.showConfirm = !this.showConfirm;
  }

  get f() { return this.form.controls as any; }
}
