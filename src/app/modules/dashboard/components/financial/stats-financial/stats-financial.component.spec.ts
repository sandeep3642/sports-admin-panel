import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsFinancialComponent } from './stats-financial.component';

describe('StatsFinancialComponent', () => {
  let component: StatsFinancialComponent;
  let fixture: ComponentFixture<StatsFinancialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsFinancialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsFinancialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
