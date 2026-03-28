import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveDashboard } from './approve-dashboard';

describe('ApproveDashboard', () => {
  let component: ApproveDashboard;
  let fixture: ComponentFixture<ApproveDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
