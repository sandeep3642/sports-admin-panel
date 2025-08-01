import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailsTableComponent } from './view-details-table.component';

describe('StakeholderTableComponent', () => {
  let component: ViewDetailsTableComponent;
  let fixture: ComponentFixture<ViewDetailsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDetailsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
