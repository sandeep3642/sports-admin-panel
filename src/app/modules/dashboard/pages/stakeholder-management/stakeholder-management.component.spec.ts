import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakeholderManagementComponent } from './stakeholder-management.component';
import { DashboardRoutingModule } from '../../dashboard-routing.module';
import { NgModule } from '@angular/core';

describe('StakeholderManagementComponent', () => {
  let component: StakeholderManagementComponent;
  let fixture: ComponentFixture<StakeholderManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StakeholderManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StakeholderManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


