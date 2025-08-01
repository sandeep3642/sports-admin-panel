import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleStatsCardComponent } from './role-stats-card.component';

describe('RoleStatsCardComponent', () => {
  let component: RoleStatsCardComponent;
  let fixture: ComponentFixture<RoleStatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleStatsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleStatsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
