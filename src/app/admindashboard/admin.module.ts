import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { AdminRoutingModule } from './admin-routing.module';

import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './admin/admin.component';
import { StatCardComponent } from './components/stat-card/stat-card.component';
import { PendingUsersTableComponent } from './components/pending-users-table/pending-users-table.component';
import { UsersTableComponent } from './components/users-table/users-table.component';

@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    StatCardComponent,
    PendingUsersTableComponent,
    UsersTableComponent
  ],
  imports: [
    CommonModule,          // *ngIf, *ngFor, etc.
    RouterModule,          // routerLink, router-outlet (in components declared here)
    AdminRoutingModule,    // your routes (forChild)
    FormsModule,           // ngModel (if used)
    ReactiveFormsModule,   // [formGroup] (Change Password modal)
    HttpClientModule       // HTTP (ok to import in feature module)
  ]
})
export class AdminModule {}

