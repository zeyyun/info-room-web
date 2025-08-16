import { Component, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-lecturer-dashboard',
  templateUrl: './lecturer-dashboard.component.html',
  styleUrls: ['./lecturer-dashboard.component.css']
})
export class LecturerDashboardComponent {
  // Tabs
  tab: 'create' | 'list' = 'create';
  setTab(t: 'create' | 'list') { this.tab = t; }

  // User display (kibali cha jina/email)
  userName: string =
    (typeof localStorage !== 'undefined' &&
     (localStorage.getItem('name') || localStorage.getItem('userName'))) || 'Lecturer';
  userEmail: string =
    (typeof localStorage !== 'undefined' &&
     (localStorage.getItem('email') || localStorage.getItem('userEmail'))) || 'lecturer@example.com';

  // ===== Account dropdown =====
  accountOpen = false;
  toggleAccountMenu() { this.accountOpen = !this.accountOpen; }
  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) { if (!(ev.target as HTMLElement).closest('.account')) this.accountOpen = false; }
  @HostListener('document:keydown.escape') onEsc() { this.accountOpen = false; }

  // ===== Change Password modal =====
  pwdOpen = false;
  busy = false;
  ok = '';
  err = '';

  // eye toggles
  showCur = false;
  showNew = false;
  showCf  = false;

  pwdForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  openChangePassword() {
    this.accountOpen = false;
    this.ok = ''; this.err = '';
    this.showCur = this.showNew = this.showCf = false;
    this.pwdForm.reset({ currentPassword: '', newPassword: '', confirm: '' });
    this.pwdForm.enable();
    this.pwdOpen = true;
  }
  closePwd() {
    this.pwdOpen = false;
    this.pwdForm.enable();
    this.busy = false;
  }

  submitPwd() {
    this.err = ''; this.ok = '';
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }

    const cur = String(this.pwdForm.value.currentPassword || '');
    const nw  = String(this.pwdForm.value.newPassword || '');
    const cf  = String(this.pwdForm.value.confirm || '');

    if (nw !== cf) { this.err = 'New password and confirmation do not match.'; return; }

    this.busy = true;
    this.pwdForm.disable();

    this.auth.changePassword(cur, nw).subscribe({
      next: (res) => {
        this.ok = res?.message || 'Password changed.';
        setTimeout(() => this.closePwd(), 800);
      },
      error: (e) => {
        this.err = e?.error?.message || e?.message || 'Unauthorized';
        this.busy = false;
        this.pwdForm.enable();
      }
    });
  }

  logout() { this.auth.logout(); }
}
