import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerDashboardComponent } from './lecturer-dashboard.component';

describe('LecturerDashboardComponent', () => {
  let component: LecturerDashboardComponent;
  let fixture: ComponentFixture<LecturerDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LecturerDashboardComponent]
    });
    fixture = TestBed.createComponent(LecturerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
