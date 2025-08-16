// src/app/admin/dashboard/dashboard.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { PendingUser } from '../components/pending-users-table/pending-users-table.component';
import { UsersService, UserRow, Role } from '../../lecturer/services/users.service';
import { AuthService } from '../../auth/auth.service';

type Status = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

@Component({
  selector: 'app-dashboard',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class DashboardComponent implements OnInit {
  allUsers: UserRow[] = [];

  // Top cards
  usersCount = 0;
  postsCount = 0;

  // Status breakdown
  activeCount = 0;
  pendingCount = 0;
  suspendedCount = 0;
  statusCount = 0; // legacy binding → pending

  // Account
  accountOpen = false;
  currentUser: { name: string; email: string } | null = { name: 'k', email: '' }; // set real user if available

  // Change password
  pwdOpen = false;
  busy = false;
  ok = '';
  err = '';
  showCur = false;
  showNew = false;
  showCf  = false;

  pwdForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  // Add user dialog
  newUser: any = {
    name: '', email: '', role: 'CLASS_REP' as Role, status: 'ACTIVE' as Status,
    campus: '', course: '', registration: '', password: '', confirmPassword: '',
  };

  roles: Role[] = ['ADMIN', 'LECTURER', 'CLASS_REP', 'UNIVERSITY_REP'];
  campuses = ['Main', 'Beit-el-Ras', 'Kilimani', 'Tunguu'];
  courses  = ['BSc-IT', 'BSc-CS', 'BBA', 'BCom'];

  loading = false;
  saving  = false;
  addError = '';

  // Collapsibles
  showSuspended = true;
  showAll = true;

  constructor(
    private usersSvc: UsersService,
    private auth: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadAll();
    // Example to set current user from auth if you have it:
    // const { name, email } = this.auth.getProfile();
    // this.currentUser = { name, email };
  }

  /* ===== derived ===== */
  get userInitial(): string {
    const n = (this.currentUser?.name || '').trim();
    return (n ? n[0] : 'k').toUpperCase();
  }

  /* ===== Account menu ===== */
  toggleAccountMenu() { this.accountOpen = !this.accountOpen; }
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    const el = ev.target as HTMLElement;
    if (!el.closest('.admin-account')) this.accountOpen = false;
  }
  @HostListener('document:keydown.escape') onEsc() { this.accountOpen = false; }

  /* ===== Change Password ===== */
  openChangePassword(): void {
    this.accountOpen = false;
    this.ok = ''; this.err = '';
    this.showCur = this.showNew = this.showCf = false;
    this.pwdForm.reset({ currentPassword: '', newPassword: '', confirm: '' });
    this.pwdForm.enable();
    this.pwdOpen = true;
  }
  closePwd() { this.pwdOpen = false; this.pwdForm.enable(); this.busy = false; }
  submitPwd() {
    this.err = ''; this.ok = '';
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }
    const cur = String(this.pwdForm.value.currentPassword || '');
    const nw  = String(this.pwdForm.value.newPassword || '');
    const cf  = String(this.pwdForm.value.confirm || '');
    if (nw !== cf) { this.err = 'New password and confirmation do not match.'; return; }
    this.busy = true; this.pwdForm.disable();
    this.auth.changePassword(cur, nw).subscribe({
      next: (res) => { this.ok = res?.message || 'Password changed.'; setTimeout(() => this.closePwd(), 800); },
      error: (e: any) => { this.err = e?.error?.message || e?.message || 'Failed to change password.'; this.busy = false; this.pwdForm.enable(); }
    });
  }

  /* ===== Cards helper ===== */
  private updateCards() {
    this.usersCount  = this.activeCount;
    this.statusCount = this.pendingCount;
  }

  /* ===== Load data ===== */
  private loadAll() {
    this.loading = true;
    forkJoin({
      approved:  this.usersSvc.getApproved(),
      pending:   this.usersSvc.getPending(),
      suspended: this.usersSvc.getSuspended()
    }).subscribe({
      next: ({ approved, pending, suspended }) => {
        this.allUsers        = [...approved, ...pending, ...suspended];
        this.activeCount     = approved.length;
        this.pendingCount    = pending.length;
        this.suspendedCount  = suspended.length;
        this.updateCards();
      },
      error: (_err: HttpErrorResponse) => { this.loading = false; },
      complete: () => (this.loading = false),
    });
  }

  /* ===== Lists ===== */
  get pendingUsers(): PendingUser[] {
    return this.allUsers
      .filter(u => u.status === 'PENDING')
      .map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, status: 'PENDING' as const }));
  }
  get approvedUsers(): UserRow[]  { return this.allUsers.filter(u => u.status === 'ACTIVE'); }
  get suspendedUsers(): UserRow[] { return this.allUsers.filter(u => u.status === 'SUSPENDED'); }

  /* ===== Suspended actions ===== */
  onActivate(id: number) { this.usersSvc.activate(id).subscribe({ next: () => this.loadAll() }); }
  onDeleteSuspended(id: number) {
    if (!confirm('Delete this suspended user?')) return;
    this.usersSvc.remove(id).subscribe({ next: () => this.loadAll() });
  }

  /* ===== Role rules ===== */
  get roleSel(): Role { return (this.newUser.role as Role) || 'CLASS_REP'; }
  needCampus()       { return this.roleSel === 'CLASS_REP' || this.roleSel === 'UNIVERSITY_REP'; }
  needCourse()       { return this.roleSel === 'CLASS_REP'; }
  needRegistration() { return this.roleSel === 'CLASS_REP' || this.roleSel === 'UNIVERSITY_REP'; }

  /* ===== Add user form helpers ===== */
  get passTooShort(): boolean {
    const p = this.newUser.password || '';
    return p.length > 0 && p.length < 6;
  }
  get passMismatch(): boolean {
    const p = this.newUser.password || '';
    const c = this.newUser.confirmPassword || '';
    return p.length >= 6 && c.length > 0 && p !== c;
  }
  get canSave(): boolean {
    const nameOk  = !!(this.newUser.name && String(this.newUser.name).trim());
    const emailOk = !!(this.newUser.email && String(this.newUser.email).trim());
    const pass    = (this.newUser.password || '').trim();
    const cpass   = (this.newUser.confirmPassword || '').trim();
    const passOk  = pass.length >= 6 && pass === cpass;
    const campusOk = !this.needCampus() || !!this.newUser.campus;
    const courseOk = !this.needCourse() || !!this.newUser.course;
    const regOk    = !this.needRegistration() || !!this.newUser.registration;
    return nameOk && emailOk && passOk && campusOk && courseOk && regOk;
  }

  /* ===== Add user dialog ===== */
  openAdd() {
    this.addError = '';
    (document.getElementById('addUserDialog') as HTMLDialogElement)?.showModal();
  }
  closeAdd() {
    (document.getElementById('addUserDialog') as HTMLDialogElement)?.close();
    this.newUser = { name: '', email: '', role: 'CLASS_REP' as Role, status: 'ACTIVE' as Status,
      campus: '', course: '', registration: '', password: '', confirmPassword: '' };
    this.addError = '';
  }

  saveAdd() {
    if (this.saving) return;
    const name  = (this.newUser.name || '').trim();
    const email = (this.newUser.email || '').trim();
    const role: Role = (this.newUser.role as Role) || 'CLASS_REP';
    const pass  = (this.newUser.password || '').trim();
    const cpass = (this.newUser.confirmPassword || '').trim();
    if (!name){ this.addError='Name is required.'; return; }
    if (!email){ this.addError='Email is required.'; return; }
    if (pass.length<6){ this.addError='Password must be at least 6 characters.'; return; }
    if (pass!==cpass){ this.addError='Passwords do not match.'; return; }
    if (this.needCampus() && !this.newUser.campus){ this.addError='Campus is required for this role.'; return; }
    if (this.needCourse() && !this.newUser.course){ this.addError='Course is required for Class Rep.'; return; }
    if (this.needRegistration() && !this.newUser.registration){ this.addError='Registration is required for this role.'; return; }

    this.saving = true; this.addError = '';
    const payload = {
      name, email, role, password: pass, status: 'ACTIVE' as Status,
      campus: this.needCampus()? this.newUser.campus: undefined,
      course: this.needCourse()? this.newUser.course: undefined,
      registration: this.needRegistration()? this.newUser.registration: undefined
    };

    this.usersSvc.create(payload).subscribe({
      next: (created) => {
        this.allUsers.push({
          id: created?.id ?? Date.now(),
          name: created?.name ?? name,
          email: created?.email ?? email,
          role: created?.role ?? role,
          status: created?.status ?? 'ACTIVE',
          campus: created?.campus ?? (this.needCampus()? this.newUser.campus: undefined),
          course: created?.course ?? (this.needCourse()? this.newUser.course: undefined),
          registration: created?.registration ?? (this.needRegistration()? this.newUser.registration: undefined)
        });
        this.activeCount++; this.updateCards(); this.closeAdd();
      },
      error: (err: HttpErrorResponse) => {
        this.addError = (typeof err?.error === 'string' && err.error) || (err?.error as any)?.message || `Failed to add user (HTTP ${err?.status || '??'})`;
        this.saving = false;
      },
      complete: () => { this.saving = false; }
    });
  }

  /* ===== other actions ===== */
  deleteUser(u: UserRow) {
    if (!confirm(`Delete ${u.name}?`)) return;
    this.usersSvc.remove(u.id).subscribe({ next: () => this.loadAll() });
  }
  onApprove(id: number)  { this.usersSvc.approve(id).subscribe({ next: () => this.loadAll() }); }
  onSuspend(id: number)  { this.usersSvc.suspend(id).subscribe({ next: () => this.loadAll() }); }
  onRemove(id: number)   {
    if (!confirm('Delete this pending user?')) return;
    this.usersSvc.remove(id).subscribe({ next: () => this.loadAll() });
  }

  trackById = (_: number, u: UserRow) => u.id;
  logout() { this.auth.logout(); }

  toggleSuspended() { this.showSuspended = !this.showSuspended; }
  toggleAll()       { this.showAll = !this.showAll; }
}
