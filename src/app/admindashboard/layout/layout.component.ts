import { Component, HostListener } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {
  // ====== User menu state ======
  menuOpen = false;

  // ====== Change Password modal state ======
  pwdOpen = false;
  busy = false;
  ok = '';
  err = '';

  // TODO: chukua jina/email halisi kutoka backend/token kama ulivyoHifadhi
  displayName = 'khamis abdullatif';
  displayEmail = 'lecturer@example.com';

  pwdForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', [Validators.required]],
  });

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  // Funga dropdown ukiclick nje
  @HostListener('document:click')
  onDocClick() { this.menuOpen = false; }

  toggleMenu(e: MouseEvent) {
    e.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  openChangePassword() {
    this.pwdOpen = true;
    this.ok = ''; this.err = '';
  }

  closePwd() {
    this.pwdOpen = false;
    this.pwdForm.enable();
    this.busy = false;
  }

  submitPwd() {
    this.err = ''; this.ok = '';
    if (this.pwdForm.invalid) { this.pwdForm.markAllAsTouched(); return; }

    const cur = (this.pwdForm.value.currentPassword || '').toString();
    const nw  = (this.pwdForm.value.newPassword || '').toString();
    const cf  = (this.pwdForm.value.confirm || '').toString();

    if (nw !== cf) {
      this.err = 'New password and confirmation do not match.';
      return;
    }

    this.busy = true;
    this.pwdForm.disable();
    this.auth.changePassword(cur, nw).subscribe({
      next: (res) => {
        this.ok = res?.message || 'Password changed.';
        setTimeout(() => this.closePwd(), 700);
      },
      error: (e) => {
        this.err = e?.error?.message || e?.message || 'Failed to change password.';
        this.busy = false;
        this.pwdForm.enable();
      }
    });
  }

  logout() { this.auth.logout(); }
}
