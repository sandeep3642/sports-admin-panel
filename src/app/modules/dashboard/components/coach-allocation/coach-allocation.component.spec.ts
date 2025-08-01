import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachAllocationComponent } from './coach-allocation.component';

describe('CoachAllocationComponent', () => {
  let component: CoachAllocationComponent;
  let fixture: ComponentFixture<CoachAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoachAllocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
