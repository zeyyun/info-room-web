// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LecturerDashboardComponent } from './lecturer/lecturer-dashboard/lecturer-dashboard.component';

import { AdminGuard } from './core/admin.guard';
import { LecturerGuard } from './core/lecturer.guard';
import { AuthGuard } from './core/auth.guard';
import { LoginRedirectGuard } from './auth/login-redirect.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Standalone auth screens
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginRedirectGuard], // <= zuia kufungua ukiwa logged-in
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [LoginRedirectGuard], // <= zuia kufungua ukiwa logged-in
  },

  // Lecturer dashboard
  {
    path: 'lecturer',
    component: LecturerDashboardComponent,
    canActivate: [AuthGuard, LecturerGuard],
    canMatch: [LecturerGuard],
  },

  // Admin (lazy module)
  {
    path: 'admin',
    loadChildren: () =>
      import('./admindashboard/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, AdminGuard],
    canMatch: [AdminGuard],
  },

  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
