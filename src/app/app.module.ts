// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AuthInterceptor } from './core/auth.interceptor';
import { RequestDebugInterceptor } from './core/request-debug.interceptor';

import { LecturerDashboardComponent } from './lecturer/lecturer-dashboard/lecturer-dashboard.component';
import { PostCreateComponent } from './lecturer/post-create/post-create.component';
import { PostListComponent } from './lecturer/post-list/post-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LecturerDashboardComponent,
    PostCreateComponent,
    PostListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [
    // Kwanza: debug logger (haina madhara kwenye headers)
    { provide: HTTP_INTERCEPTORS, useClass: RequestDebugInterceptor, multi: true },
    // Pili: auth (inaweka base URL + Authorization)
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
