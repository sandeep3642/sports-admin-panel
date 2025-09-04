import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardKpiCardsComponent } from './dashboard-kpi-cards.component';

describe('DashboardKpiCardsComponent', () => {
  let component: DashboardKpiCardsComponent;
  let fixture: ComponentFixture<DashboardKpiCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardKpiCardsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardKpiCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
